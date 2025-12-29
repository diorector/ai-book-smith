'use client';

import { useRef, useCallback } from 'react';
import { SYSTEM_PROMPTS, WRITE_CONCURRENCY, TEST_SECTIONS_MAX, FACTCHECK_CONCURRENCY } from '@/constants';
import { useAPI } from './useAPI';
import { runConcurrent, isAbortError } from '@/utils/helpers';
import { sanitizeManuscript } from '@/utils/manuscript';
import { getTonePrompt } from '@/utils/tonePrompt';
import type { BookStructure, Chapter, Subsection } from '@/types/book';
import type { ToneSettings } from '@/constants/toneFactors';
import type { Progress, CustomStyle } from '@/types/project';

interface WritingTask {
  chapter: Chapter;
  sub: Subsection;
  key: string;
  prompt: string;
}

interface UseBookWritingParams {
  bookStructure: BookStructure | null;
  toneSettings: ToneSettings;
  customStyles: CustomStyle[];
  selectedCustomStyleId: string | null;
  subsectionContents: Record<string, string>;
  setSubsectionContents: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
  setStep: (step: string) => void;
  setIsTestMode: (testMode: boolean) => void;
  setShowFeedbackInput: (show: boolean) => void;
  setFactCheckStatus: React.Dispatch<React.SetStateAction<{ status: 'idle' | 'checking' | 'done'; current: number; total: number; changes: number; changesList: Array<{ original: string; corrected: string; reason: string }> }>>;
  writingFeedback: string;
}

export function useBookWriting(params: UseBookWritingParams) {
  const {
    bookStructure,
    toneSettings,
    customStyles,
    selectedCustomStyleId,
    subsectionContents,
    setSubsectionContents,
    setProgress,
    setStep,
    setIsTestMode,
    setShowFeedbackInput,
    setFactCheckStatus,
    writingFeedback,
  } = params;

  // 선택된 커스텀 스타일 찾기
  const selectedCustomStyle = selectedCustomStyleId 
    ? customStyles.find(s => s.id === selectedCustomStyleId) || null 
    : null;

  const { callGemini, factCheck, proofread } = useAPI();
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

    for (const chapter of chapters) {
      for (const sub of (chapter.subsections || [])) {
        const key = `${chapter.chapter_number}_${sub.sub_number}`;
        const prompt = SYSTEM_PROMPTS.writer(bookStructure, chapter, sub, "", tonePrompt, bookSummary);
        tasks.push({ chapter, sub, key, prompt });
      }
    }
    return tasks;
  }, [bookStructure]);

  /**
   * 배치 자동 팩트체크 (Gemini + Google Search Grounding)
   * - 여러 섹션을 동시에 처리 (FACTCHECK_CONCURRENCY 만큼 병렬)
   * - Gemini Free tier: 15 RPM → 안전하게 5개 동시 처리
   */
  const autoFactCheck = useCallback(async (
    contents: Record<string, string>,
    signal?: AbortSignal
  ) => {
    const keys = Object.keys(contents).filter(k => contents[k] && contents[k].length > 200);
    
    if (keys.length === 0) {
      setFactCheckStatus({ status: 'done', current: 0, total: 0, changes: 0, changesList: [] });
      return;
    }

    setFactCheckStatus({ status: 'checking', current: 0, total: keys.length, changes: 0, changesList: [] });
    
    // 동시 수정 횟수와 변경사항 목록을 관리
    let totalChanges = 0;
    let completed = 0;
    const allChanges: Array<{ original: string; corrected: string; reason: string }> = [];

    try {
      await runConcurrent(
        keys,
        FACTCHECK_CONCURRENCY,
        async (key) => {
          try {
            const result = await factCheck(contents[key], signal);
            
            if (result.changes && result.changes.length > 0) {
              totalChanges += result.changes.length;
              allChanges.push(...result.changes);
              setSubsectionContents(prev => ({ ...prev, [key]: sanitizeManuscript(result.revised) }));
            }
          } catch (e) {
            if (isAbortError(e)) throw e;
            console.warn(`[팩트체크] §${key} 실패:`, e);
            // 실패해도 계속 진행
          } finally {
            completed++;
            setFactCheckStatus(prev => ({ ...prev, current: completed, changes: totalChanges, changesList: [...allChanges] }));
          }
        },
        signal
      );
    } catch (e) {
      if (isAbortError(e)) {
        console.log('[팩트체크] 사용자에 의해 중단됨');
      }
    }

    setFactCheckStatus({ status: 'done', current: keys.length, total: keys.length, changes: totalChanges, changesList: allChanges });
  }, [factCheck, setFactCheckStatus, setSubsectionContents]);

  const startDeepWriting = useCallback(async (testMode: boolean = false) => {
    if (!bookStructure) return;

    if (writingAbortRef.current) {
      try { writingAbortRef.current.abort('restart'); } catch {}
    }
    writingAbortRef.current = new AbortController();
    const writingSignal = writingAbortRef.current.signal;

    setStep('writing');
    setIsTestMode(testMode);
    setFactCheckStatus({ status: 'idle', current: 0, total: 0, changes: 0, changesList: [] });
    
    // 즉시 "준비 중" 상태 표시 (사용자가 기다리고 있음을 인지하도록)
    setProgress({ total: 0, current: 0, status: 'preparing' });
    
    const tonePrompt = getTonePrompt(toneSettings, selectedCustomStyle);
    const bookSummary = await callGemini(
      `다음 책 구조의 전체 핵심 내용을 500자로 요약하세요:\n${JSON.stringify(bookStructure)}`,
      "",
      writingSignal
    );
    
    const tasks = buildTasks(testMode, tonePrompt, bookSummary);
    setProgress({ total: tasks.length, current: 0, status: 'writing' });

    const newContents: Record<string, string> = {};

    try {
      await runConcurrent(
        tasks,
        WRITE_CONCURRENCY,
        async (t) => {
          try {
            const content = await callGemini(t.prompt, "", writingSignal);
            // FACTS_JSON 블록 제거 (팩트체크에서 별도로 처리)
            const cleaned = sanitizeManuscript(
              content.replace(/```FACTS_JSON[\s\S]*?```/g, '').trim(),
              { sectionTitle: t.sub.title }
            );
            setSubsectionContents(prev => ({ ...prev, [t.key]: cleaned }));
            newContents[t.key] = cleaned;
          } catch (error) {
            if (isAbortError(error)) throw error;
            setSubsectionContents(prev => ({ ...prev, [t.key]: "[Error generating this section]" }));
          } finally {
            setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          }
        },
        writingSignal
      );

      // 글쓰기 완료 후 자동 팩트체크 (테스트 모드에서도 실행)
      await autoFactCheck(newContents, writingSignal);

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
  }, [bookStructure, toneSettings, buildTasks, callGemini, autoFactCheck, setStep, setIsTestMode, setProgress, setSubsectionContents, setShowFeedbackInput, setFactCheckStatus]);

  const resumeDeepWriting = useCallback(async () => {
    if (!bookStructure) return;

    if (writingAbortRef.current) {
      try { writingAbortRef.current.abort('restart'); } catch {}
    }
    writingAbortRef.current = new AbortController();
    const writingSignal = writingAbortRef.current.signal;

    setStep('writing');
    setProgress((prev) => ({ ...prev, status: 'writing' }));
    setFactCheckStatus({ status: 'idle', current: 0, total: 0, changes: 0, changesList: [] });

    const tonePrompt = getTonePrompt(toneSettings, selectedCustomStyle);
    const bookSummary = await callGemini(
      `다음 책 구조의 전체 핵심 내용을 500자로 요약하세요:\n${JSON.stringify(bookStructure)}`,
      "",
      writingSignal
    );

    const isGoodContent = (v: unknown) => typeof v === 'string' && v.trim() !== '' && !v.startsWith('[Error');
    const alreadyCount = Object.values(subsectionContents).filter(isGoodContent).length;
    const totalAll = bookStructure.chapters.reduce((acc, ch) => acc + (ch.subsections?.length || 0), 0);
    setProgress({ total: totalAll, current: alreadyCount, status: 'writing' });

    const newContents: Record<string, string> = { ...subsectionContents };

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
            const cleaned = sanitizeManuscript(
              content.replace(/```FACTS_JSON[\s\S]*?```/g, '').trim(),
              { sectionTitle: t.sub.title }
            );
            setSubsectionContents(prev => ({ ...prev, [t.key]: cleaned }));
            newContents[t.key] = cleaned;
          } catch (error) {
            if (isAbortError(error)) throw error;
            setSubsectionContents(prev => ({ ...prev, [t.key]: "[Error generating this section]" }));
          } finally {
            setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          }
        },
        writingSignal
      );

      // 자동 팩트체크
      await autoFactCheck(newContents, writingSignal);

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
  }, [bookStructure, toneSettings, subsectionContents, callGemini, autoFactCheck, setStep, setProgress, setSubsectionContents, setFactCheckStatus]);

  const continueWritingWithFeedback = useCallback(async () => {
    if (!writingFeedback.trim() || !bookStructure) {
      alert('피드백을 입력해주세요.');
      return;
    }
    
    setShowFeedbackInput(false);
    setProgress(prev => ({ ...prev, status: 'writing' }));
    setFactCheckStatus({ status: 'idle', current: 0, total: 0, changes: 0, changesList: [] });
    
    const tonePrompt = getTonePrompt(toneSettings, selectedCustomStyle);
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

    const newContents: Record<string, string> = { ...subsectionContents };
    
    await runConcurrent(
      tasks,
      WRITE_CONCURRENCY,
      async (t) => {
        try {
          const content = await callGemini(t.prompt);
          const cleaned = sanitizeManuscript(
            content.replace(/```FACTS_JSON[\s\S]*?```/g, '').trim(),
            { sectionTitle: t.sub.title }
          );
          setSubsectionContents(prev => ({ ...prev, [t.key]: cleaned }));
          newContents[t.key] = cleaned;
        } catch (error) {
          if (isAbortError(error)) throw error;
          setSubsectionContents(prev => ({ ...prev, [t.key]: "[Error generating this section]" }));
        } finally {
          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }
      }
    );

    // 자동 팩트체크
    await autoFactCheck(newContents);
    
    setProgress(prev => ({ ...prev, status: 'done' }));
    setStep('done');
  }, [bookStructure, toneSettings, subsectionContents, writingFeedback, callGemini, autoFactCheck, setShowFeedbackInput, setProgress, setSubsectionContents, setStep, setFactCheckStatus]);

  const stopWriting = useCallback(() => {
    if (writingAbortRef.current) {
      writingAbortRef.current.abort('user-stopped');
    }
    setProgress(prev => ({ ...prev, status: 'stopped' }));
  }, [setProgress]);

  return {
    startDeepWriting,
    resumeDeepWriting,
    continueWritingWithFeedback,
    stopWriting,
    writingAbortRef,
  };
}
