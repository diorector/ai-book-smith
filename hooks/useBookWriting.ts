'use client';

import { useRef, useCallback } from 'react';
import { SYSTEM_PROMPTS, WRITE_CONCURRENCY, TEST_SECTIONS_MAX, FACTCHECK_CONCURRENCY, AUTO_FACTCHECK_ON_COMPLETE } from '@/constants';
import { useAPI } from './useAPI';
import { runConcurrent, isAbortError } from '@/utils/helpers';
import { extractFactsJson, sanitizeManuscript, factCheckInstructionForSection } from '@/utils/manuscript';
import { getTonePrompt } from '@/utils/tonePrompt';
import type { BookStructure, Chapter, Subsection } from '@/types/book';
import type { ToneSettings } from '@/constants/toneFactors';
import type { Progress } from '@/types/project';
import type { FactClaim, FactCheckLog } from '@/types/factCheck';

interface WritingTask {
  chapter: Chapter;
  sub: Subsection;
  key: string;
  prompt: string;
}

interface UseBookWritingParams {
  bookStructure: BookStructure | null;
  toneSettings: ToneSettings;
  subsectionContents: Record<string, string>;
  factClaimsBySection: Record<string, FactClaim[]>;
  setSubsectionContents: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setFactClaimsBySection: React.Dispatch<React.SetStateAction<Record<string, FactClaim[]>>>;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
  setStep: (step: string) => void;
  setIsTestMode: (testMode: boolean) => void;
  setShowFeedbackInput: (show: boolean) => void;
  setAutoFactCheckProgress: React.Dispatch<React.SetStateAction<{ current: number; total: number; status: string }>>;
  setFactCheckLogs: React.Dispatch<React.SetStateAction<Record<string, FactCheckLog>>>;
  setIsAutoFactChecking: (checking: boolean) => void;
  writingFeedback: string;
}

export function useBookWriting(params: UseBookWritingParams) {
  const {
    bookStructure,
    toneSettings,
    subsectionContents,
    factClaimsBySection,
    setSubsectionContents,
    setFactClaimsBySection,
    setProgress,
    setStep,
    setIsTestMode,
    setShowFeedbackInput,
    setAutoFactCheckProgress,
    setFactCheckLogs,
    setIsAutoFactChecking,
    writingFeedback,
  } = params;

  const { callGemini, factCheckWeb } = useAPI();
  const writingAbortRef = useRef<AbortController | null>(null);

  const buildTasks = useCallback((testMode: boolean, tonePrompt: string, bookSummary: string): WritingTask[] => {
    if (!bookStructure) return [];
    
    const tasks: WritingTask[] = [];
    const chapters = bookStructure.chapters || [];

    const isPrologueLike = (t: string) => (t || '').includes('서문') || (t || '').includes('Prologue') || (t || '').includes('서론');
    const prologue = chapters.find((ch) => isPrologueLike(ch.title));
    const regularChapters = chapters
      .filter((ch) => !isPrologueLike(ch.title))
      .sort((a, b) => a.chapter_number - b.chapter_number);

    if (testMode) {
      const picks: Array<{ chapter: Chapter; sub: Subsection }> = [];
      if (prologue?.subsections?.length) picks.push({ chapter: prologue, sub: prologue.subsections[0] });
      if (regularChapters[0]?.subsections?.length) picks.push({ chapter: regularChapters[0], sub: regularChapters[0].subsections[0] });
      if (regularChapters[1]?.subsections?.length) picks.push({ chapter: regularChapters[1], sub: regularChapters[1].subsections[0] });

      for (const { chapter, sub } of picks.slice(0, TEST_SECTIONS_MAX)) {
        const key = `${chapter.chapter_number}_${sub.sub_number}`;
        const prompt = SYSTEM_PROMPTS.writer(bookStructure, chapter, sub, "", tonePrompt, bookSummary);
        tasks.push({ chapter, sub, key, prompt });
      }
      return tasks;
    }

    // 전체 모드
    for (const chapter of chapters) {
      for (const sub of (chapter.subsections || [])) {
        const key = `${chapter.chapter_number}_${sub.sub_number}`;
        const prompt = SYSTEM_PROMPTS.writer(bookStructure, chapter, sub, "", tonePrompt, bookSummary);
        tasks.push({ chapter, sub, key, prompt });
      }
    }
    return tasks;
  }, [bookStructure]);

  const autoFactCheckPass = useCallback(async (signal?: AbortSignal) => {
    if (!AUTO_FACTCHECK_ON_COMPLETE) return;

    const keys = Object.keys(factClaimsBySection || {}).filter((key) => {
      const claims = factClaimsBySection[key] || [];
      return claims.some(c => c.confidence === 'low' || c.confidence === 'medium');
    });

    if (keys.length === 0) {
      setAutoFactCheckProgress({ current: 0, total: 0, status: '팩트체크 완료 (낮은 신뢰도 항목 없음)' });
      return;
    }

    setIsAutoFactChecking(true);
    setAutoFactCheckProgress({
      current: 0,
      total: keys.length,
      status: '낮은 신뢰도 항목 팩트체크(Tavily) 중...'
    });

    try {
      await runConcurrent(
        keys,
        FACTCHECK_CONCURRENCY,
        async (key) => {
          if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
          const originalText = subsectionContents[key];
          if (!originalText) {
            setAutoFactCheckProgress(prev => ({ ...prev, current: prev.current + 1 }));
            return;
          }

          try {
            let rewritten: string | null = null;

            try {
              const data = await factCheckWeb(originalText, factClaimsBySection[key] || [], signal);
              if (data?.rewritten) {
                rewritten = data.rewritten;
                setFactCheckLogs(prev => ({
                  ...prev,
                  [key]: {
                    original: originalText,
                    rewritten: data.rewritten,
                    evaluations: data.evaluations || [],
                    references: data.references || [],
                    timestamp: Date.now()
                  }
                }));
              }
            } catch (e) {
              console.warn(`Web fact check failed for ${key}, falling back to local:`, e);
            }

            if (!rewritten) {
              const instruction = factCheckInstructionForSection(factClaimsBySection[key] || []);
              rewritten = await callGemini(originalText, instruction, signal);
              const cleanedFallback = sanitizeManuscript(rewritten);
              
              setFactCheckLogs(prev => ({
                ...prev,
                [key]: {
                  original: originalText,
                  rewritten: cleanedFallback,
                  evaluations: [], // Local fallback doesn't have evaluations
                  references: [],
                  timestamp: Date.now(),
                  isLocalOnly: true
                }
              }));
              rewritten = cleanedFallback;
            }

            const cleaned = sanitizeManuscript(rewritten);
            setSubsectionContents(prev => ({ ...prev, [key]: cleaned }));
          } finally {
            setAutoFactCheckProgress(prev => ({ ...prev, current: prev.current + 1 }));
          }
        },
        signal
      );
      setAutoFactCheckProgress(prev => ({ ...prev, status: '팩트체크 완료' }));
    } finally {
      setIsAutoFactChecking(false);
    }
  }, [factClaimsBySection, subsectionContents, callGemini, factCheckWeb, setAutoFactCheckProgress, setFactCheckLogs, setIsAutoFactChecking, setSubsectionContents]);

  const startDeepWriting = useCallback(async (testMode: boolean = false) => {
    if (!bookStructure) return;

    if (writingAbortRef.current) {
      try { writingAbortRef.current.abort(); } catch {}
    }
    writingAbortRef.current = new AbortController();
    const writingSignal = writingAbortRef.current.signal;

    setStep('writing');
    setIsTestMode(testMode);
    
    const tonePrompt = getTonePrompt(toneSettings);
    const bookSummary = await callGemini(
      `다음 책 구조의 전체 핵심 내용을 500자로 요약하세요:\n${JSON.stringify(bookStructure)}`,
      "",
      writingSignal
    );
    
    const tasks = buildTasks(testMode, tonePrompt, bookSummary);
    setProgress({ total: tasks.length, current: 0, status: 'writing' });

    try {
      await runConcurrent(
        tasks,
        WRITE_CONCURRENCY,
        async (t) => {
          try {
            const content = await callGemini(t.prompt, "", writingSignal);
            const { manuscript, claims } = extractFactsJson(content);
            const cleaned = sanitizeManuscript(manuscript, { sectionTitle: t.sub.title });
            setSubsectionContents(prev => ({ ...prev, [t.key]: cleaned }));
            if (claims?.length) setFactClaimsBySection(prev => ({ ...prev, [t.key]: claims }));
          } catch (error) {
            if (isAbortError(error)) throw error;
            setSubsectionContents(prev => ({ ...prev, [t.key]: "[Error generating this section]" }));
          } finally {
            setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          }
        },
        writingSignal
      );

      await autoFactCheckPass(writingSignal);

      if (testMode) {
        setProgress(prev => ({ ...prev, status: 'test-complete' }));
        setShowFeedbackInput(true);
      } else {
        setProgress(prev => ({ ...prev, status: 'done' }));
        setStep('done');
      }
    } catch (e) {
      if (isAbortError(e)) {
        setProgress(prev => ({ ...prev, status: 'stopped' }));
      } else {
        console.error("집필 실패:", e);
        setProgress(prev => ({ ...prev, status: 'stopped' }));
      }
    } finally {
      writingAbortRef.current = null;
    }
  }, [bookStructure, toneSettings, buildTasks, callGemini, autoFactCheckPass, setStep, setIsTestMode, setProgress, setSubsectionContents, setFactClaimsBySection, setShowFeedbackInput]);

  const resumeDeepWriting = useCallback(async () => {
    if (!bookStructure) return;

    if (writingAbortRef.current) {
      try { writingAbortRef.current.abort(); } catch {}
    }
    writingAbortRef.current = new AbortController();
    const writingSignal = writingAbortRef.current.signal;

    setStep('writing');
    setProgress((prev) => ({ ...prev, status: 'writing' }));

    const tonePrompt = getTonePrompt(toneSettings);
    const bookSummary = await callGemini(
      `다음 책 구조의 전체 핵심 내용을 500자로 요약하세요:\n${JSON.stringify(bookStructure)}`,
      "",
      writingSignal
    );

    const isGoodContent = (v: unknown) => typeof v === 'string' && v.trim() !== '' && !v.startsWith('[Error');
    const alreadyCount = Object.values(subsectionContents).filter(isGoodContent).length;
    const totalAll = bookStructure.chapters.reduce((acc, ch) => acc + (ch.subsections?.length || 0), 0);
    setProgress({ total: totalAll, current: alreadyCount, status: 'writing' });

    try {
      const tasks: WritingTask[] = [];
      for (const chapter of bookStructure.chapters) {
        for (const sub of (chapter.subsections || [])) {
          const key = `${chapter.chapter_number}_${sub.sub_number}`;
          const existing = subsectionContents[key];
          if (isGoodContent(existing)) continue;
          const prompt = SYSTEM_PROMPTS.writer(bookStructure, chapter, sub, "", tonePrompt, bookSummary);
          tasks.push({ chapter, sub, key, prompt });
        }
      }

      await runConcurrent(
        tasks,
        WRITE_CONCURRENCY,
        async (t) => {
          try {
            const content = await callGemini(t.prompt, "", writingSignal);
            const { manuscript, claims } = extractFactsJson(content);
            const cleaned = sanitizeManuscript(manuscript, { sectionTitle: t.sub.title });
            setSubsectionContents(prev => ({ ...prev, [t.key]: cleaned }));
            if (claims?.length) setFactClaimsBySection(prev => ({ ...prev, [t.key]: claims }));
          } catch (error) {
            if (isAbortError(error)) throw error;
            setSubsectionContents(prev => ({ ...prev, [t.key]: "[Error generating this section]" }));
          } finally {
            setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          }
        },
        writingSignal
      );

      await autoFactCheckPass(writingSignal);

      setProgress(prev => ({ ...prev, status: 'done' }));
      setStep('done');
    } catch (e) {
      if (isAbortError(e)) {
        setProgress(prev => ({ ...prev, status: 'stopped' }));
      } else {
        console.error("이어쓰기 실패:", e);
        setProgress(prev => ({ ...prev, status: 'stopped' }));
      }
    } finally {
      writingAbortRef.current = null;
    }
  }, [bookStructure, toneSettings, subsectionContents, callGemini, autoFactCheckPass, setStep, setProgress, setSubsectionContents, setFactClaimsBySection]);

  const continueWritingWithFeedback = useCallback(async () => {
    if (!writingFeedback.trim() || !bookStructure) {
      alert('피드백을 입력해주세요.');
      return;
    }
    
    setShowFeedbackInput(false);
    setProgress(prev => ({ ...prev, status: 'writing' }));
    
    const tonePrompt = getTonePrompt(toneSettings);
    const bookSummary = await callGemini(
      `다음 책 구조의 전체 핵심 내용을 500자로 요약하세요:\n${JSON.stringify(bookStructure)}`
    );
    
    const isGoodContent = (v: unknown) => typeof v === 'string' && v.trim() !== '' && !v.startsWith('[Error');
    const tasks: Array<{ key: string; prompt: string; sub: Subsection }> = [];
    
    for (const chapter of bookStructure.chapters) {
      for (const sub of (chapter.subsections || [])) {
        const key = `${chapter.chapter_number}_${sub.sub_number}`;
        const existing = subsectionContents[key];
        if (isGoodContent(existing)) continue;
        
        const basePrompt = SYSTEM_PROMPTS.writer(bookStructure, chapter, sub, "", tonePrompt, bookSummary);
        const promptWithFeedback = `${basePrompt}\n\n[사용자 피드백]\n${writingFeedback}\n\n위 피드백을 반영하여 집필하세요.`;
        tasks.push({ key, prompt: promptWithFeedback, sub });
      }
    }
    
    const alreadyCount = Object.values(subsectionContents).filter(isGoodContent).length;
    setProgress({ total: alreadyCount + tasks.length, current: alreadyCount, status: 'writing' });
    
    await runConcurrent(
      tasks,
      WRITE_CONCURRENCY,
      async (t) => {
        try {
          const content = await callGemini(t.prompt);
          const { manuscript, claims } = extractFactsJson(content);
          const cleaned = sanitizeManuscript(manuscript, { sectionTitle: t.sub.title });
          setSubsectionContents(prev => ({ ...prev, [t.key]: cleaned }));
          if (claims?.length) setFactClaimsBySection(prev => ({ ...prev, [t.key]: claims }));
        } catch (error) {
          if (isAbortError(error)) throw error;
          setSubsectionContents(prev => ({ ...prev, [t.key]: "[Error generating this section]" }));
        } finally {
          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }
      }
    );

    await autoFactCheckPass();
    
    setProgress(prev => ({ ...prev, status: 'done' }));
    setStep('done');
  }, [bookStructure, toneSettings, subsectionContents, writingFeedback, callGemini, autoFactCheckPass, setShowFeedbackInput, setProgress, setSubsectionContents, setFactClaimsBySection, setStep]);

  const stopWriting = useCallback(() => {
    if (writingAbortRef.current) {
      writingAbortRef.current.abort();
    }
  }, []);

  return {
    startDeepWriting,
    resumeDeepWriting,
    continueWritingWithFeedback,
    stopWriting,
    writingAbortRef,
  };
}

