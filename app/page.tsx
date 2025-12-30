'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Wand2 } from 'lucide-react';

// Constants
import { THEMES, SYSTEM_PROMPTS, TONE_FACTORS } from '@/constants';
import type { ToneSettings } from '@/constants/toneFactors';

// Hooks
import { useAPI, useProjectManagement, useBookWriting } from '@/hooks';

// Utils
import { getTonePrompt } from '@/utils/tonePrompt';
import { buildTocModel, getFullMarkdown } from '@/utils/toc';
import { extractDraftFeedbackBlock, sanitizeManuscript } from '@/utils/manuscript';
import { loadScript } from '@/utils/helpers';

// Components
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { InterviewPanel, OutlinePanel, WritingProgressPanel, PreviewPanel } from '@/components/panels';
import { CoverConceptsModal, FeedbackChatModal } from '@/components/modals';

// Types
import type { CoverConcept, CustomStyle } from '@/types/project';


export default function BookSmithAI() {
  // Project management hook
  const project = useProjectManagement();
  const {
    projects, currentProjectId, showProjectSelector, editingProjectId, editingProjectName,
    setShowProjectSelector, createNewProject, switchProject, deleteProject,
    startEditingProject, saveProjectName, cancelEditingProject, setEditingProjectName,
    updateProjectName, handleReset,
    step, setStep, messages, setMessages, readyForOutline, setReadyForOutline,
    hasConfirmedStyle, setHasConfirmedStyle,
    toneSettings, setToneSettings, customStyles, setCustomStyles,
    selectedCustomStyleId, setSelectedCustomStyleId, bookStructure, setBookStructure,
    subsectionContents, setSubsectionContents, factClaimsBySection, setFactClaimsBySection,
    progress, setProgress, coverImage, setCoverImage, coverConcepts, setCoverConcepts,
    coverPromptUsed, setCoverPromptUsed, currentTheme, setCurrentTheme,
    includeIntroOutro, setIncludeIntroOutro, isTestMode, setIsTestMode,
    writingFeedback, setWritingFeedback, showFeedbackInput, setShowFeedbackInput,
    feedbackChatMessages, setFeedbackChatMessages, showDetailedToc, setShowDetailedToc,
    tocExpandedChapters, setTocExpandedChapters, autoFactCheckProgress, setAutoFactCheckProgress,
    factCheckLogs, setFactCheckLogs, showRecoveryBanner, setShowRecoveryBanner,
    saveProjectState,
  } = project;

  // API hook
  const { callGemini, callGeminiStream, generateImage, generateCoverConcepts: apiGenerateCoverConcepts, proofread } = useAPI();

  // Local UI state
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const showToneSelector = step === 'interview' && !hasConfirmedStyle;
  const [input, setInput] = useState('');
  const [generatingCover, setGeneratingCover] = useState(false);
  const [generatingCoverOptionId, setGeneratingCoverOptionId] = useState<number | null>(null);
  const [coverConceptsLoading, setCoverConceptsLoading] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [activeSectionKey, setActiveSectionKey] = useState<string | null>(null);
  const [leftPanelHeight, setLeftPanelHeight] = useState<number | null>(null);
  const [isFeedbackChatOpen, setIsFeedbackChatOpen] = useState(false);
  const [feedbackChatInput, setFeedbackChatInput] = useState('');
  const [isFeedbackChatLoading, setIsFeedbackChatLoading] = useState(false);
  const [modifyingNode, setModifyingNode] = useState<{ type: 'chapter' | 'subsection'; cIdx: number; sIdx?: number } | null>(null);
  const [modificationInput, setModificationInput] = useState('');
  const [highlightedSectionKey, setHighlightedSectionKey] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 팩트체크(교열) 상태
  const [factCheckStatus, setFactCheckStatus] = useState<{
    status: 'idle' | 'checking' | 'done';
    current: number;
    total: number;
    changes: number;
    changesList: Array<{ original: string; corrected: string; reason: string }>;
  }>({ status: 'idle', current: 0, total: 0, changes: 0, changesList: [] });

  // 원고 다듬기(교정+윤문) 상태
  const [proofreadStatus, setProofreadStatus] = useState<{
    status: 'idle' | 'proofreading' | 'done';
    current: number;
    total: number;
    changes: number;
    changesList: Array<{ original: string; corrected: string; reason: string; type?: string }>;
  }>({ status: 'idle', current: 0, total: 0, changes: 0, changesList: [] });

  // Refs
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Theme - always use editorial
  const theme = THEMES.editorial;

  // Book writing hook
  const bookWriting = useBookWriting({
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
  });

  // Scroll sync
  useEffect(() => {
    if (!bookStructure) return;
    const scroller = previewScrollRef.current;
    if (!scroller) return;

    let raf = 0;
    const rebuildIndex = () => {
      const ids: Array<{ key: string; top: number }> = [];
      try {
        bookStructure.chapters.forEach((ch) => {
          (ch.subsections || []).forEach((sub) => {
            const key = `${ch.chapter_number}_${sub.sub_number}`;
            const el = document.getElementById(`section-${key}`);
            if (!el) return;
            ids.push({ key, top: (el as HTMLElement).offsetTop || 0 });
          });
        });
      } catch { }
      ids.sort((a, b) => a.top - b.top);
      return ids;
    };

    let index = rebuildIndex();
    const pickActiveKey = () => {
      const y = scroller.scrollTop + 120;
      let lo = 0, hi = index.length - 1, ans = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (index[mid].top <= y) { ans = mid; lo = mid + 1; } else { hi = mid - 1; }
      }
      const key = ans >= 0 ? index[ans].key : (index[0]?.key || null);
      if (key) setActiveSectionKey(prev => (prev === key ? prev : key));
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        pickActiveKey();
      });
    };

    const onResize = () => { index = rebuildIndex(); pickActiveKey(); };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    onResize();

    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [bookStructure, step]);

  // Left panel height measurement
  useEffect(() => {
    const measure = () => {
      if (leftPanelRef.current) {
        const h = leftPanelRef.current.scrollHeight;
        setLeftPanelHeight(h > 0 ? h : null);
      }
    };
    measure();
    let ro: ResizeObserver | null = null;
    if (leftPanelRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(leftPanelRef.current);
    }
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [step, tocExpandedChapters, bookStructure]);

  // Jump to section with highlight
  const jumpToSection = (chapterNumber: number, subNumber: number) => {
    const key = `${chapterNumber}_${subNumber}`;
    const el = document.getElementById(`section-${key}`);
    const container = previewScrollRef.current;

    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const scrollTop = container.scrollTop + (elRect.top - containerRect.top) - 80;

      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
      setHighlightedSectionKey(key);
      setTimeout(() => setHighlightedSectionKey(null), 2500);
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightedSectionKey(key);
      setTimeout(() => setHighlightedSectionKey(null), 2500);
    }
  };

  // TOC toggle
  const toggleDetailedToc = () => {
    const next = !showDetailedToc;
    if (next && bookStructure && Object.keys(tocExpandedChapters || {}).length === 0) {
      const initial: Record<number, boolean> = {};
      bookStructure.chapters.forEach((_, i) => (initial[i] = i === 0));
      setTocExpandedChapters(initial);
    }
    setShowDetailedToc(next);
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    if (messages.filter(m => m.role === 'user').length === 0) {
      extractProjectName(input, newMessages).catch(() => { });
    }

    try {
      const selectedCustomStyle = selectedCustomStyleId
        ? customStyles.find(s => s.id === selectedCustomStyleId) || null
        : null;
      const tonePrompt = getTonePrompt(toneSettings, selectedCustomStyle);
      setMessages(prev => [...prev, { role: 'assistant' as const, content: '' }]);

      const finalResponse = await callGeminiStream(
        [...messages, userMsg],
        SYSTEM_PROMPTS.interviewer(tonePrompt),
        (currentText) => {
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1].content = currentText;
            return newMsgs;
          });
        }
      );
      const isReady = finalResponse.includes("[READY_FOR_OUTLINE]");
      const cleanResponse = finalResponse.replace("[READY_FOR_OUTLINE]", "").trim();
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].content = cleanResponse;
        return newMsgs;
      });
      if (isReady) setReadyForOutline(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert("Error: " + errorMessage);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  // Extract project name
  const extractProjectName = async (userMessage: string, allMessages: Array<{ role: string; content: string }>) => {
    try {
      if (allMessages.filter(m => m.role === 'user').length === 1) {
        const prompt = `다음 사용자 메시지에서 책의 주제나 키워드를 추출하여 짧은 프로젝트 이름(최대 20자)을 만들어주세요. 
책 제목이 명시되어 있으면 그것을 사용하고, 없으면 주제를 요약해서 만들어주세요.
출력은 이름만 출력하세요. 설명이나 다른 텍스트는 포함하지 마세요.

사용자 메시지: "${userMessage}"`;

        const projectName = await callGemini(prompt);
        const cleanName = projectName.trim().replace(/^["']|["']$/g, '').substring(0, 20);

        if (cleanName) {
          updateProjectName(cleanName);
        }
      }
    } catch (e) {
      console.error("프로젝트 이름 추출 실패:", e);
    }
  };

  // Generate outline
  const generateOutline = async () => {
    setLoading(true);
    try {
      const historyText = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
      const response = await callGemini(
        `인터뷰 내용을 바탕으로 2단계(Chapter -> Subsection) 목차 JSON을 생성하세요.
${includeIntroOutro ? "반드시 책의 맨 앞에는 '서문(Prologue)'을, 맨 뒤에는 '결문(Epilogue)'을 별도 챕터로 포함시키세요." : ""} 

출력 규칙: 오직 JSON 객체만. 코드블록/설명/마크다운 금지.

${historyText}`,
        SYSTEM_PROMPTS.architect
      );

      const extractFirstJsonObject = (src: string): string | null => {
        if (!src) return null;
        // 코드블록 우선 제거
        const codeBlockMatch = src.match(/```(?:json)?\s*([\s\S]*?)```/);
        const text = (codeBlockMatch ? codeBlockMatch[1] : src).trim();

        // 균형 괄호 기반으로 첫 JSON 객체를 찾는다 (문자열/이스케이프 고려)
        let inString = false;
        let escape = false;
        let depth = 0;
        let start = -1;

        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (escape) { escape = false; continue; }
          if (ch === '\\\\') { if (inString) escape = true; continue; }
          if (ch === '"') { inString = !inString; continue; }
          if (inString) continue;
          if (ch === '{') {
            if (depth === 0) start = i;
            depth++;
          } else if (ch === '}') {
            depth--;
            if (depth === 0 && start !== -1) {
              return text.slice(start, i + 1);
            }
          }
        }
        return null;
      };

      const jsonStr = extractFirstJsonObject(response);
      if (!jsonStr) {
        console.error("JSON 추출 실패. 원본 응답:", response);
        throw new Error("응답에서 JSON 객체를 찾을 수 없습니다. 다시 시도해 주세요.");
      }
      type OutlineJson = Record<string, unknown> & {
        title?: unknown;
        chapters?: Array<Record<string, unknown> & {
          chapter_number?: unknown;
          title?: unknown;
          subsections?: Array<Record<string, unknown> & { sub_number?: unknown; title?: unknown }>;
        }>;
      };
      let parsed: OutlineJson | undefined;

      const cleaningStrategies = [
        (s: string) => s,
        (s: string) => s.replace(/,(\s*[\]}])/g, '$1'),
        (s: string) => s.replace(/\r?\n/g, ' ').replace(/\t/g, ' ').replace(/,(\s*[\]}])/g, '$1'),
        (s: string) => s.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/,(\s*[\]}])/g, '$1'),
        (s: string) => s.replace(/[\x00-\x1F\x7F]/g, ' ')
          .replace(/,(\s*[\]}])/g, '$1')
          .replace(/:\s*"([^"]*)"([^,}\]]*)"([^"]*?)"/g, ': "$1\\"$2\\"$3"'),
      ];

      for (let i = 0; i < cleaningStrategies.length; i++) {
        try {
          const cleaned = cleaningStrategies[i](jsonStr);
          parsed = JSON.parse(cleaned) as OutlineJson;
          break;
        } catch (e) {
          if (i === cleaningStrategies.length - 1) {
            console.error("모든 JSON 파싱 전략 실패. 정제된 문자열:", jsonStr.substring(0, 1500));
            throw new Error("AI 응답의 JSON 형식이 올바르지 않습니다. 다시 시도해 주세요.");
          }
        }
      }

      if (!parsed || !parsed.chapters) {
        throw new Error("목차 구조가 올바르지 않습니다. chapters 배열이 없습니다.");
      }

      // 최소 보정: 번호 누락/타입 불일치 정리
      if (Array.isArray(parsed.chapters)) {
        parsed.chapters = parsed.chapters.map((c, idx) => {
          const chapter_number = typeof c.chapter_number === 'number' ? c.chapter_number : idx + 1;
          const subsectionsRaw = Array.isArray(c.subsections) ? c.subsections : [];
          const subsections = subsectionsRaw.map((s, sIdx) => ({
            ...s,
            sub_number: typeof s.sub_number === 'number' ? s.sub_number : sIdx + 1,
          }));
          return { ...c, chapter_number, subsections };
        });
      }

      setBookStructure(parsed as unknown as BookStructure);
      setStep('outline');

      if (parsed.title) {
        updateProjectName(parsed.title.substring(0, 30));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("목차 생성 오류:", error);
      alert("목차 생성 실패: " + errorMessage + "\n\n다시 시도해 주세요.\n(팁: 답변을 조금 더 구체적으로 적으면 JSON 품질이 좋아집니다.)");
    } finally {
      setLoading(false);
    }
  };

  // Modify node handlers
  const handleDeleteNode = (type: 'chapter' | 'subsection', cIdx: number, sIdx?: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?") || !bookStructure) return;
    const newBook = { ...bookStructure };
    if (type === 'chapter') {
      newBook.chapters.splice(cIdx, 1);
      newBook.chapters = newBook.chapters.map((c, i) => ({ ...c, chapter_number: i + 1 }));
    } else if (sIdx !== undefined) {
      newBook.chapters[cIdx].subsections.splice(sIdx, 1);
      newBook.chapters[cIdx].subsections = newBook.chapters[cIdx].subsections.map((s, i) => ({ ...s, sub_number: i + 1 }));
    }
    setBookStructure(newBook);
  };

  const openModificationModal = (type: 'chapter' | 'subsection', cIdx: number, sIdx?: number) => {
    setModifyingNode({ type, cIdx, sIdx });
    setModificationInput('');
  };

  const submitModification = async () => {
    if (!modificationInput.trim() || !modifyingNode || !bookStructure) return;
    setLoading(true);
    try {
      const targetNode = modifyingNode.type === 'chapter'
        ? bookStructure.chapters[modifyingNode.cIdx]
        : bookStructure.chapters[modifyingNode.cIdx].subsections[modifyingNode.sIdx!];
      const context = modifyingNode.type === 'chapter'
        ? `Current Chapter: ${JSON.stringify(targetNode)}`
        : `Parent Chapter: ${bookStructure.chapters[modifyingNode.cIdx].title}. Current Subsection: ${JSON.stringify(targetNode)}`;
      const prompt = `[Context] ${context} [User Instruction] "${modificationInput}" Modify the node based on instruction. Return ONLY JSON.`;
      const result = await callGemini(prompt, SYSTEM_PROMPTS.outlineModifier);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const newBook = { ...bookStructure };
        if (modifyingNode.type === 'chapter') {
          newBook.chapters[modifyingNode.cIdx] = { ...newBook.chapters[modifyingNode.cIdx], ...parsed };
        } else {
          newBook.chapters[modifyingNode.cIdx].subsections[modifyingNode.sIdx!] = {
            ...newBook.chapters[modifyingNode.cIdx].subsections[modifyingNode.sIdx!],
            ...parsed
          };
        }
        setBookStructure(newBook);
        setModifyingNode(null);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      alert("수정 실패: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cover generation
  const handleGenerateCoverConcepts = async () => {
    if (!bookStructure) return;
    setCoverConceptsLoading(true);
    try {
      const data = await apiGenerateCoverConcepts(
        bookStructure.title,
        bookStructure.concept,
        bookStructure.target_audience || ''
      );
      setCoverConcepts(data);
      setIsCoverModalOpen(true);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      alert("표지 컨셉 생성 실패: " + errorMessage);
      console.error(e);
    } finally {
      setCoverConceptsLoading(false);
    }
  };

  const handleGenerateCoverImage = async (option: CoverConcept) => {
    if (!option?.promptEnglish) return;

    setGeneratingCover(true);
    setGeneratingCoverOptionId(option.id);

    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      timeoutId = setTimeout(() => {
        controller.abort();
      }, 60000);

      const imageUrl = await generateImage(option.promptEnglish, controller.signal);

      setCoverImage(imageUrl);
      setCoverPromptUsed(option.promptEnglish);
      setIsCoverModalOpen(false);

      saveProjectState();
    } catch (e: unknown) {
      let errorMessage = "알 수 없는 오류가 발생했습니다.";

      if (e instanceof Error) {
        if (e.name === 'AbortError' || e.message?.includes('aborted')) {
          errorMessage = "요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.";
        } else {
          errorMessage = e.message;
        }
      }

      console.error("이미지 생성 오류:", e);
      alert(`이미지 생성 실패\n\n${errorMessage}`);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setGeneratingCover(false);
      setGeneratingCoverOptionId(null);
    }
  };

  // Feedback chat
  const sendFeedbackChat = async () => {
    if (!feedbackChatInput.trim() || isFeedbackChatLoading) return;
    const userMsg = { role: 'user' as const, content: feedbackChatInput.trim() };
    setFeedbackChatInput('');
    setIsFeedbackChatLoading(true);

    const next = [...feedbackChatMessages, userMsg, { role: 'assistant' as const, content: '' }];
    setFeedbackChatMessages(next);

    try {
      const selectedCustomStyle = selectedCustomStyleId
        ? customStyles.find(s => s.id === selectedCustomStyleId) || null
        : null;
      const tonePrompt = getTonePrompt(toneSettings, selectedCustomStyle);
      const history = [...feedbackChatMessages, userMsg];

      const finalResponse = await callGeminiStream(
        history,
        SYSTEM_PROMPTS.feedbackCoach(tonePrompt),
        (currentText) => {
          setFeedbackChatMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0) updated[lastIdx] = { ...updated[lastIdx], content: currentText };
            return updated;
          });
        }
      );

      const draft = extractDraftFeedbackBlock(finalResponse);
      if (draft) setWritingFeedback(draft);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류';
      console.error("피드백 채팅 실패:", e);
      alert(`피드백 대화 실패: ${errorMessage}`);
      setFeedbackChatMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsFeedbackChatLoading(false);
    }
  };

  const finalizeFeedbackFromChat = async () => {
    if (isFeedbackChatLoading) return;
    setIsFeedbackChatLoading(true);
    try {
      const convo = feedbackChatMessages
        .map((m) => `${m.role === 'user' ? 'User' : 'Editor'}: ${m.content}`)
        .join('\n');

      const prompt = `아래 '피드백 대화'를 바탕으로, 앞으로 생성될 나머지 원고에 적용할 '집필 지침'을 만들어주세요.\n\n요구사항:\n- 5~10개의 불릿\n- 각 불릿은 실행 가능한 지시문(예: \"사례를 매 섹션마다 2개 이상\")\n- 너무 길면 안 됨(총 800자 이내)\n- 출력은 지침만 (설명 금지)\n\n[피드백 대화]\n${convo}`;

      const guidance = await callGemini(prompt);
      const clean = guidance.trim();
      if (clean) setWritingFeedback(clean);
      setIsFeedbackChatOpen(false);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류';
      console.error("피드백 확정 실패:", e);
      alert(`피드백 확정 실패: ${errorMessage}`);
    } finally {
      setIsFeedbackChatLoading(false);
    }
  };

  // Reset writing
  const resetWritingKeepOutline = () => {
    if (!window.confirm("목차는 유지하고, 본문/진행률만 초기화한 뒤 다시 집필하시겠습니까?")) return;
    bookWriting.stopWriting();
    setSubsectionContents({});
    setProgress({ total: 0, current: 0, status: 'idle' });
    setIsTestMode(true);
    setFactCheckStatus({ status: 'idle', current: 0, total: 0, changes: 0, changesList: [] });
    setWritingFeedback('');
    setShowFeedbackInput(false);
    setIsFeedbackChatOpen(false);
    setFeedbackChatMessages([{ role: 'assistant', content: '샘플 원고를 보고 느낀 점을 알려주세요. (문체/구성/깊이/예시/독자 난이도 등)' }]);
    setFeedbackChatInput('');
    setIsFeedbackChatLoading(false);
    setStep('outline');
  };

  // Export functions
  const handlePrintPDF = () => { window.print(); };

  const downloadBook = () => {
    if (!bookStructure) return;
    const md = getFullMarkdown(bookStructure, subsectionContents);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookStructure.title}.md`;
    a.click();
  };

  // 원고 다듬기 (교정 + 윤문)
  const handleProofread = async () => {
    if (!bookStructure) return;

    const keys = Object.keys(subsectionContents).filter(k =>
      subsectionContents[k] && subsectionContents[k].length > 100
    );

    if (keys.length === 0) {
      setProofreadStatus({ status: 'done', current: 0, total: 0, changes: 0, changesList: [] });
      return;
    }

    setProofreadStatus({ status: 'proofreading', current: 0, total: keys.length, changes: 0, changesList: [] });

    let totalChanges = 0;
    const allChanges: Array<{ original: string; corrected: string; reason: string; type?: string }> = [];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      setProofreadStatus(prev => ({ ...prev, current: i + 1 }));

      try {
        const result = await proofread(subsectionContents[key], 'full');

        if (result.changes && result.changes.length > 0) {
          totalChanges += result.changes.length;
          allChanges.push(...result.changes);
          setSubsectionContents(prev => ({ ...prev, [key]: result.revised }));
        }
      } catch (e) {
        console.warn(`[원고다듬기] §${key} 실패:`, e);
      }
    }

    setProofreadStatus({ status: 'done', current: keys.length, total: keys.length, changes: totalChanges, changesList: allChanges });
  };

  // 수동 팩트체크 (교열)
  const handleManualFactCheck = async () => {
    if (!bookStructure) return;

    const keys = Object.keys(subsectionContents).filter(k =>
      subsectionContents[k] && subsectionContents[k].length > 200
    );

    if (keys.length === 0) {
      setFactCheckStatus({ status: 'done', current: 0, total: 0, changes: 0, changesList: [] });
      return;
    }

    setFactCheckStatus({ status: 'checking', current: 0, total: keys.length, changes: 0, changesList: [] });
  };

  const handleExportEPUB = async () => {
    if (!bookStructure) return;
    setExporting(true);
    try {
      await Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js')
      ]);

      // @ts-expect-error - JSZip is loaded dynamically
      const JSZip = window.JSZip;
      // @ts-expect-error - saveAs is loaded dynamically
      const saveAs = window.saveAs;

      const zip = new JSZip();
      const title = bookStructure.title;
      const author = "AI Book Smith";
      const uuid = "urn:uuid:" + new Date().getTime();

      zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
      zip.folder("META-INF").file("container.xml", `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);

      const oebps = zip.folder("OEBPS");
      let manifestItems = "", spineItems = "", navMapItems = "";
      let playOrder = 1;

      if (coverImage) {
        const imgData = coverImage.split(',')[1];
        oebps.file("cover.png", imgData, { base64: true });
        manifestItems += `<item id="cover-image" href="cover.png" media-type="image/png"/>\n`;
        const coverPageContent = `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Cover</title></head><body style="margin:0; padding:0; text-align:center;"><div style="height:100vh; display:flex; justify-content:center; align-items:center;"><img src="cover.png" alt="Cover" style="max-height:100%; max-width:100%;"/></div></body></html>`;
        oebps.file("cover.xhtml", coverPageContent);
        manifestItems += `<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>\n`;
        spineItems += `<itemref idref="cover"/>\n`;
      }

      const titlePageContent = `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body><div style="text-align:center; margin-top: 20%;"><h1>${title}</h1><h3>${bookStructure.concept}</h3><p>Generated by AI Book Smith</p></div></body></html>`;
      oebps.file("title.xhtml", titlePageContent);
      manifestItems += `<item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>\n`;
      spineItems += `<itemref idref="title"/>\n`;
      navMapItems += `<navPoint id="navPoint-title" playOrder="${playOrder++}"><navLabel><text>${title}</text></navLabel><content src="title.xhtml"/></navPoint>`;

      bookStructure.chapters.forEach((ch, idx) => {
        const chFilename = `chapter${idx + 1}.xhtml`;
        let chContent = `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${ch.title}</title><style>body { font-family: serif; line-height: 1.6; }</style></head><body><h1>Chapter ${ch.chapter_number}. ${ch.title}</h1>`;
        ch.subsections.forEach(sub => {
          const key = `${ch.chapter_number}_${sub.sub_number}`;
          const rawContent = subsectionContents[key] || "";
          const cleanedContent = rawContent.replace(/\$\$/g, '').replace(/\\text\{([^}]+)\}/g, '$1').replace(/\\[a-zA-Z]+/g, '');
          const htmlContent = cleanedContent.replace(/^### (.*$)/gim, '<h3>$1</h3>').replace(/^## (.*$)/gim, '<h2>$1</h2>').replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>').replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>').replace(/\n/gim, '<br/>');
          chContent += `<h2 id="c${ch.chapter_number}-s${sub.sub_number}">§ ${sub.title}</h2><div>${htmlContent}</div><hr/>`;
        });
        chContent += `</body></html>`;
        oebps.file(chFilename, chContent);
        const id = `ch${idx + 1}`;
        manifestItems += `<item id="${id}" href="${chFilename}" media-type="application/xhtml+xml"/>\n`;
        spineItems += `<itemref idref="${id}"/>\n`;
        navMapItems += `<navPoint id="navPoint-${idx + 1}" playOrder="${playOrder++}"><navLabel><text>${ch.title}</text></navLabel><content src="${chFilename}"/></navPoint>`;
      });

      const contentOpf = `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf"><dc:title>${title}</dc:title><dc:creator opf:role="aut">${author}</dc:creator><dc:language>ko</dc:language><dc:identifier id="BookId" opf:scheme="UUID">${uuid}</dc:identifier>${coverImage ? '<meta name="cover" content="cover-image"/>' : ''}</metadata><manifest><item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>${manifestItems}</manifest><spine toc="ncx">${spineItems}</spine></package>`;
      oebps.file("content.opf", contentOpf);

      const tocNcx = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd"><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="${uuid}"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>${title}</text></docTitle><navMap>${navMapItems}</navMap></ncx>`;
      oebps.file("toc.ncx", tocNcx);

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `${title.replace(/\s+/g, '_')}.epub`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert("EPUB 생성 중 오류가 발생했습니다: " + errorMessage);
    } finally {
      setExporting(false);
    }
  };

  const handleExportDOCX = async () => {
    if (!bookStructure) return;
    setExporting(true);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js');
      // @ts-expect-error - saveAs is loaded dynamically
      const saveAs = window.saveAs;

      const docx = await import('docx');
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, LevelFormat } = docx;

      const safeText = (s: unknown) => (s ?? '').toString();

      const children: InstanceType<typeof Paragraph>[] = [];
      const numberingConfig = [
        {
          reference: 'abs-numbered',
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.START }],
        },
        {
          reference: 'abs-bullets',
          levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.START }],
        },
      ];

      // Title page
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [new TextRun({ text: safeText(bookStructure.title), bold: true, size: 56 })],
        })
      );
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: safeText(bookStructure.concept), size: 28 })],
        })
      );
      children.push(new Paragraph({ children: [new PageBreak()] }));

      // Chapters
      bookStructure.chapters.forEach((ch, idx) => {
        if (idx > 0) children.push(new Paragraph({ children: [new PageBreak()] }));
        children.push(new Paragraph({ text: `Chapter ${ch.chapter_number}. ${safeText(ch.title)}`, heading: HeadingLevel.HEADING_1 }));

        ch.subsections.forEach((sub) => {
          const key = `${ch.chapter_number}_${sub.sub_number}`;
          const rawContent = subsectionContents[key] || '';
          children.push(new Paragraph({ text: `§ ${safeText(sub.title)}`, heading: HeadingLevel.HEADING_2 }));

          const clean = safeText(rawContent).replace(/\$\$/g, '').replace(/\\text\{([^}]+)\}/g, '$1').replace(/\\[a-zA-Z]+/g, '');
          clean.split(/\n\n+/).forEach((block) => {
            const trimmed = block.trim();
            if (!trimmed) return;
            children.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 }, children: [new TextRun({ text: trimmed })] }));
          });
        });
      });

      const doc = new Document({
        numbering: { config: numberingConfig },
        sections: [{ children }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${bookStructure.title}.docx`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert("DOCX 생성 실패: " + errorMessage);
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const canShowDetailedToc = !!bookStructure && (progress.status === 'done' || progress.status === 'test-complete' || step === 'done');

  const currentProject = projects.find(p => p.id === currentProjectId);

  return (
    <div className="min-h-screen flex bg-[var(--paper)] text-[var(--ink)]">
      {/* Sidebar - Hidden on mobile, shown on md+ */}
      <Sidebar
        projects={projects}
        currentProjectId={currentProjectId}
        editingProjectId={editingProjectId}
        editingProjectName={editingProjectName}
        setEditingProjectName={setEditingProjectName}
        createNewProject={createNewProject}
        switchProject={switchProject}
        deleteProject={deleteProject}
        startEditingProject={startEditingProject}
        saveProjectName={saveProjectName}
        cancelEditingProject={cancelEditingProject}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Modals */}
        <CoverConceptsModal
          isOpen={isCoverModalOpen}
          onClose={() => setIsCoverModalOpen(false)}
          theme={theme}
          coverConcepts={coverConcepts}
          generatingCover={generatingCover}
          generatingCoverOptionId={generatingCoverOptionId}
          onGenerateCover={handleGenerateCoverImage}
        />

        <FeedbackChatModal
          isOpen={isFeedbackChatOpen}
          onClose={() => setIsFeedbackChatOpen(false)}
          theme={theme}
          messages={feedbackChatMessages}
          input={feedbackChatInput}
          setInput={setFeedbackChatInput}
          isLoading={isFeedbackChatLoading}
          onSend={sendFeedbackChat}
          onFinalize={finalizeFeedbackFromChat}
        />

        {/* Modification Modal */}
        {modifyingNode && bookStructure && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-md p-6 bg-[var(--paper)] border border-[var(--stone)] rounded shadow-lg">
              <h3 className="font-semibold text-base mb-4 flex items-center gap-2 text-[var(--ink)]">
                <Wand2 size={18} className="text-[var(--ink-muted)]" />
                AI 구조 변경
              </h3>
              <p className="text-sm mb-3 text-[var(--ink-muted)]">
                {modifyingNode.type === 'chapter' ? '챕터' : '섹션'}를 어떻게 바꿀까요?
              </p>
              <textarea
                value={modificationInput}
                onChange={(e) => setModificationInput(e.target.value)}
                className="w-full h-24 p-3 text-sm mb-4 outline-none border border-[var(--stone-dark)] rounded bg-[var(--paper)] focus:border-[var(--ink-muted)]"
                placeholder="예: '더 실용적인 관점으로' 또는 '제목을 더 명확하게'"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModifyingNode(null)}
                  className="px-4 py-2 rounded text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--stone)] transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={submitModification}
                  disabled={loading}
                  className="px-4 py-2 rounded text-sm font-medium bg-[var(--ink)] text-white hover:bg-[var(--ink-light)] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : null}
                  적용
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <Header
          projectName={currentProject?.name}
          step={step}
          handleReset={handleReset}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        {/* Main Content */}
        <main className="flex-1 px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Left Panel */}
          <div
            ref={leftPanelRef}
            className={`sidebar-panel flex flex-col min-h-[calc(100vh-120px)] gap-5 ${step === 'interview'
                ? 'lg:col-span-12 max-w-2xl mx-auto w-full'
                : 'lg:col-span-4'
              } ${step === 'done' ? 'hidden lg:flex' : ''}`}
          >
            {step === 'interview' && (
              <InterviewPanel
                theme={theme}
                messages={messages}
                input={input}
                setInput={setInput}
                loading={loading}
                readyForOutline={readyForOutline}
                includeIntroOutro={includeIntroOutro}
                setIncludeIntroOutro={setIncludeIntroOutro}
                toneSettings={toneSettings}
                setToneSettings={setToneSettings}
                showToneSelector={showToneSelector}
                onConfirmStyle={() => setHasConfirmedStyle(true)}
                customStyles={customStyles}
                onAddCustomStyle={(style) => setCustomStyles((prev: CustomStyle[]) => [...prev, style])}
                onDeleteCustomStyle={(id) => setCustomStyles((prev: CustomStyle[]) => prev.filter((s: CustomStyle) => s.id !== id))}
                selectedCustomStyleId={selectedCustomStyleId}
                onSelectCustomStyle={setSelectedCustomStyleId}
                onSendMessage={handleSendMessage}
                onGenerateOutline={generateOutline}
              />
            )}

            {step === 'outline' && bookStructure && (
              <OutlinePanel
                theme={theme}
                bookStructure={bookStructure}
                setBookStructure={setBookStructure}
                loading={loading}
                coverConceptsLoading={coverConceptsLoading}
                generatingCover={generatingCover}
                onStartWriting={bookWriting.startDeepWriting}
                onGenerateCoverConcepts={handleGenerateCoverConcepts}
                onModifyNode={openModificationModal}
                onDeleteNode={handleDeleteNode}
              />
            )}

            {(step === 'writing' || step === 'done' || progress.status === 'test-complete') && bookStructure && (
              <WritingProgressPanel
                theme={theme}
                step={step}
                bookStructure={bookStructure}
                subsectionContents={subsectionContents}
                progress={progress}
                isTestMode={isTestMode}
                factCheckStatus={factCheckStatus}
                proofreadStatus={proofreadStatus}
                showRecoveryBanner={showRecoveryBanner}
                showFeedbackInput={showFeedbackInput}
                writingFeedback={writingFeedback}
                setWritingFeedback={setWritingFeedback}
                activeSectionKey={activeSectionKey}
                tocExpandedChapters={tocExpandedChapters}
                setTocExpandedChapters={setTocExpandedChapters}
                exporting={exporting}
                showExportDropdown={showExportDropdown}
                setShowExportDropdown={setShowExportDropdown}
                coverConceptsLoading={coverConceptsLoading}
                generatingCover={generatingCover}
                onStopWriting={bookWriting.stopWriting}
                onResumeWriting={bookWriting.resumeDeepWriting}
                onResetWriting={resetWritingKeepOutline}
                onContinueWithFeedback={bookWriting.continueWritingWithFeedback}
                onFinishWithoutFeedback={() => {
                  setShowFeedbackInput(false);
                  setProgress(prev => ({ ...prev, status: 'done' }));
                  setStep('done');
                }}
                onOpenFeedbackChat={() => setIsFeedbackChatOpen(true)}
                onResetFeedbackChat={() => setFeedbackChatMessages([{ role: 'assistant', content: '샘플 원고를 보고 느낀 점을 알려주세요. (문체/구성/깊이/예시/독자 난이도 등)' }])}
                onGenerateCoverConcepts={handleGenerateCoverConcepts}
                onJumpToSection={jumpToSection}
                onExportEPUB={handleExportEPUB}
                onExportDOCX={handleExportDOCX}
                onExportMarkdown={downloadBook}
                onPrintPDF={handlePrintPDF}
                onProofread={handleProofread}
                setShowRecoveryBanner={setShowRecoveryBanner}
              />
            )}
          </div>

          {/* Right Panel: Preview */}
          <PreviewPanel
            theme={theme}
            step={step}
            bookStructure={bookStructure}
            subsectionContents={subsectionContents}
            coverImage={coverImage}
            setCoverImage={setCoverImage}
            toneSettings={toneSettings}
            progress={progress}
            leftPanelHeight={leftPanelHeight}
            previewScrollRef={previewScrollRef as React.RefObject<HTMLDivElement>}
            tocModel={buildTocModel(bookStructure)}
            onJumpToSection={jumpToSection}
            onPrintPDF={handlePrintPDF}
            highlightedSectionKey={highlightedSectionKey}
            onUpdateContent={(key, content) => {
              setSubsectionContents(prev => ({ ...prev, [key]: content }));
            }}
          />
        </main>
      </div>
    </div>
  );
}
