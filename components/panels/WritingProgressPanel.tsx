'use client';

import React from 'react';
import { 
  RefreshCw, CheckCircle, Loader2, Cpu, ChevronRight, ChevronDown, 
  Image as ImageIcon, Sparkles, User, Search, Download, FileText, 
  BookOpen, File, Printer, Sliders
} from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { BookStructure } from '@/types/book';
import type { Progress, AutoFactCheckProgress } from '@/types/project';
import type { FactCheckLog, FactClaim } from '@/types/factCheck';

interface WritingProgressPanelProps {
  theme: Theme;
  step: string;
  bookStructure: BookStructure;
  subsectionContents: Record<string, string>;
  progress: Progress;
  isTestMode: boolean;
  isAutoFactChecking: boolean;
  autoFactCheckProgress: AutoFactCheckProgress;
  showRecoveryBanner: boolean;
  showFeedbackInput: boolean;
  writingFeedback: string;
  setWritingFeedback: (feedback: string) => void;
  activeSectionKey: string | null;
  tocExpandedChapters: Record<number, boolean>;
  setTocExpandedChapters: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  factCheckLogs: Record<string, FactCheckLog>;
  exporting: boolean;
  showExportDropdown: boolean;
  setShowExportDropdown: (show: boolean) => void;
  coverConceptsLoading: boolean;
  generatingCover: boolean;
  onStopWriting: () => void;
  onResumeWriting: () => void;
  onResetWriting: () => void;
  onContinueWithFeedback: () => void;
  onFinishWithoutFeedback: () => void;
  onOpenFeedbackChat: () => void;
  onResetFeedbackChat: () => void;
  onGenerateCoverConcepts: () => void;
  onJumpToSection: (chapterNumber: number, subNumber: number) => void;
  onOpenFactCheckLogModal: (key: string) => void;
  onOpenFactCheckModal: () => void;
  onExportEPUB: () => void;
  onExportDOCX: () => void;
  onExportMarkdown: () => void;
  onPrintPDF: () => void;
  setShowRecoveryBanner: (show: boolean) => void;
}

export default function WritingProgressPanel({
  theme,
  step,
  bookStructure,
  subsectionContents,
  progress,
  isTestMode,
  isAutoFactChecking,
  autoFactCheckProgress,
  showRecoveryBanner,
  showFeedbackInput,
  writingFeedback,
  setWritingFeedback,
  activeSectionKey,
  tocExpandedChapters,
  setTocExpandedChapters,
  factCheckLogs,
  exporting,
  showExportDropdown,
  setShowExportDropdown,
  coverConceptsLoading,
  generatingCover,
  onStopWriting,
  onResumeWriting,
  onResetWriting,
  onContinueWithFeedback,
  onFinishWithoutFeedback,
  onOpenFeedbackChat,
  onResetFeedbackChat,
  onGenerateCoverConcepts,
  onJumpToSection,
  onOpenFactCheckLogModal,
  onOpenFactCheckModal,
  onExportEPUB,
  onExportDOCX,
  onExportMarkdown,
  onPrintPDF,
  setShowRecoveryBanner,
}: WritingProgressPanelProps) {
  const toggleTocChapter = (chapterIdx: number) => {
    setTocExpandedChapters(prev => ({ ...prev, [chapterIdx]: !prev[chapterIdx] }));
  };

  return (
    <div className={`flex-1 rounded-xl border p-4 flex flex-col ${theme.panel} ${theme.border}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold flex items-center gap-2">
          {progress.status === 'writing' ? (
            <RefreshCw className="animate-spin text-indigo-400" />
          ) : progress.status === 'test-complete' ? (
            <CheckCircle className="text-amber-500" />
          ) : (
            <CheckCircle className="text-green-500" />
          )}
          {progress.status === 'test-complete' ? '테스트 집필 완료' : '집필 진행률'}
        </h3>
        <div className="flex items-center gap-2">
          {(step === 'writing' && progress.status === 'writing') && (
            <button
              onClick={onStopWriting}
              className="px-2.5 py-1 rounded text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50"
              title="집필 중지"
            >
              중지
            </button>
          )}
          {(step === 'writing' || progress.status === 'stopped') && (
            <button
              onClick={onResumeWriting}
              className={`px-2.5 py-1 rounded text-xs font-bold border ${theme.border} hover:bg-black/5`}
              title="이미 생성된 섹션은 유지하고, 비어있는 섹션만 이어서 생성합니다."
            >
              이어쓰기
            </button>
          )}
          {bookStructure && (
            <button
              onClick={onResetWriting}
              className={`px-2.5 py-1 rounded text-xs font-bold border ${theme.border} hover:bg-black/5`}
              title="목차는 유지하고 본문/진행률만 초기화합니다."
            >
              본문만 초기화
            </button>
          )}
          <button
            onClick={onGenerateCoverConcepts}
            disabled={coverConceptsLoading || generatingCover}
            className="bg-indigo-800 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
          >
            {(coverConceptsLoading || generatingCover) ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} />}
            표지(컨셉 선택)
          </button>
        </div>
      </div>

      {/* Fact-check 상태 */}
      {(isAutoFactChecking || autoFactCheckProgress.status.includes('완료')) && (
        <div className={`mb-3 px-3 py-2 rounded-lg flex items-center gap-2 text-xs ${isAutoFactChecking ? 'bg-indigo-500/10' : 'bg-green-500/10'}`}>
          {isAutoFactChecking ? <Loader2 size={12} className="animate-spin text-indigo-500" /> : <CheckCircle size={12} className="text-green-600" />}
          <span className={`font-medium ${isAutoFactChecking ? 'text-indigo-600' : 'text-green-700'}`}>
            {isAutoFactChecking ? '팩트체크 중...' : '검증 완료'}
          </span>
          {autoFactCheckProgress.total > 0 && (
            <span className="opacity-50 ml-auto">{autoFactCheckProgress.current}/{autoFactCheckProgress.total}</span>
          )}
        </div>
      )}

      {/* Recovery Banner */}
      {showRecoveryBanner && (step === 'writing' || progress.status === 'stopped') && (
        <div className={`mb-4 p-3 rounded-lg border ${theme.border} ${theme.bg}`}>
          <div className="text-sm font-bold mb-1">중단된 집필을 감지했어요</div>
          <div className="text-xs opacity-70">
            브라우저 새로고침/이동 등으로 집필이 멈춘 상태로 보입니다. 아래에서 복구할 수 있어요.
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                setShowRecoveryBanner(false);
                onResumeWriting();
              }}
              className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${theme.button}`}
            >
              <Cpu size={16} /> 이어쓰기
            </button>
            <button
              onClick={() => {
                setShowRecoveryBanner(false);
                onResetWriting();
              }}
              className={`px-3 py-2 rounded-lg text-sm font-bold border ${theme.border} hover:bg-black/5`}
            >
              본문만 초기화
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="font-semibold opacity-70">진행률</span>
          <span className="font-mono text-[11px] opacity-60">
            {progress.total > 0 ? `${Math.round((progress.current / progress.total) * 100)}%` : '0%'}
          </span>
        </div>
        <div className="w-full bg-black/10 rounded-full h-2 overflow-hidden">
          <div 
            className="h-2 bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* TOC */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold opacity-70">목차</span>
        <span className="text-[10px] opacity-40">{progress.current}/{progress.total} 섹션</span>
      </div>
      <div className={`flex-1 overflow-y-auto space-y-0.5 border-t pt-2 ${theme.border}`}>
        {bookStructure.chapters.map((ch, chIdx) => {
          const isActiveCh = activeSectionKey ? activeSectionKey.startsWith(`${ch.chapter_number}_`) : false;
          const chapterProgress = ch.subsections.filter(sub => !!subsectionContents[`${ch.chapter_number}_${sub.sub_number}`]).length;
          const isComplete = chapterProgress === ch.subsections.length;
          return (
            <div key={ch.chapter_number} id={`left-ch-${ch.chapter_number}`} className="group">
              <button
                onClick={() => toggleTocChapter(chIdx)}
                className={`w-full flex items-center gap-2 px-2 py-2 text-left rounded-lg transition-all ${
                  isActiveCh 
                    ? 'bg-indigo-500/15 border-l-2 border-indigo-500' 
                    : 'hover:bg-black/5 border-l-2 border-transparent'
                }`}
              >
                {tocExpandedChapters[chIdx] ? <ChevronDown size={12} className="opacity-40 shrink-0" /> : <ChevronRight size={12} className="opacity-40 shrink-0" />}
                <span className={`text-xs font-bold ${isActiveCh ? 'text-indigo-600' : 'opacity-50'}`}>{ch.chapter_number}</span>
                <span className={`text-[12px] truncate flex-1 ${isActiveCh ? 'font-semibold' : 'opacity-80'}`}>{ch.title}</span>
                {isComplete ? (
                  <CheckCircle size={12} className="text-green-500 shrink-0" />
                ) : (
                  <span className="text-[10px] opacity-40 shrink-0">{chapterProgress}/{ch.subsections.length}</span>
                )}
              </button>
              
              {tocExpandedChapters[chIdx] && (
                <div className="ml-6 pl-3 border-l border-dashed space-y-0.5 py-1 mb-1">
                  {ch.subsections.map((sub) => {
                    const key = `${ch.chapter_number}_${sub.sub_number}`;
                    const hasContent = !!subsectionContents[key];
                    const isActive = activeSectionKey === key;
                    const factCheckLog = factCheckLogs[key];
                    return (
                      <div key={sub.sub_number} className="relative group/sub">
                        <button
                          onClick={() => onJumpToSection(ch.chapter_number, sub.sub_number)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[11px] transition-all ${
                            isActive 
                              ? 'bg-indigo-500/20 font-semibold text-indigo-700' 
                              : 'hover:bg-black/5 opacity-75 hover:opacity-100'
                          }`}
                        >
                          {hasContent ? (
                            <CheckCircle size={10} className="text-green-500 shrink-0" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full border border-current opacity-30 shrink-0" />
                          )}
                          <span className="truncate flex-1">{sub.title}</span>
                          {factCheckLog && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenFactCheckLogModal(key);
                              }}
                              className="p-1 rounded bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors"
                              title="검증 결과 보기"
                            >
                              <Search size={12} />
                            </button>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Test Mode Feedback Input */}
      {progress.status === 'test-complete' && showFeedbackInput && (
        <div className={`mt-4 p-4 rounded-lg border ${theme.border} ${theme.panel}`}>
          <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-500" /> 테스트 집필 완료
          </h4>
          <p className="text-xs opacity-70 mb-3">
            서문과 처음 2개 챕터가 생성되었습니다. 피드백을 입력하시면 나머지 집필에 반영됩니다.
          </p>
          <div className="flex gap-2 mb-3">
            <button
              onClick={onOpenFeedbackChat}
              className={`px-3 py-2 rounded-lg text-xs font-bold border ${theme.border} hover:bg-black/5 flex items-center gap-2`}
            >
              <User size={14} /> 피드백 대화로 조율
            </button>
            <button
              onClick={onResetFeedbackChat}
              className={`px-3 py-2 rounded-lg text-xs font-bold border ${theme.border} hover:bg-black/5`}
              title="피드백 대화 초기화"
            >
              초기화
            </button>
          </div>
          <textarea
            value={writingFeedback}
            onChange={(e) => setWritingFeedback(e.target.value)}
            placeholder="예: 문체가 너무 딱딱해요. 좀 더 친근하게 써주세요.&#10;또는: 예시를 더 많이 넣어주세요.&#10;또는: 톤을 좀 더 격려하는 느낌으로 바꿔주세요."
            className={`w-full p-3 rounded-lg text-sm min-h-[120px] resize-y ${theme.input} ${theme.border} ${theme.text} outline-none`}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={onContinueWithFeedback}
              disabled={!writingFeedback.trim()}
              className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${theme.button} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Cpu size={16} /> 피드백 반영하여 나머지 집필
            </button>
            <button
              onClick={onFinishWithoutFeedback}
              className={`px-4 py-2 rounded-lg text-sm font-bold border ${theme.border} hover:bg-black/5`}
            >
              피드백 없이 완료
            </button>
          </div>
        </div>
      )}

      {/* Done Step Actions */}
      {step === 'done' && (
        <div className="space-y-2 mt-4">
          <button
            onClick={onOpenFactCheckModal}
            className="w-full py-1.5 rounded-md text-xs flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
            title="검증이 필요한 주장 확인"
          >
            <Sliders size={12} /> 팩트체크 항목 보기
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${theme.button}`}
            >
              {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              내보내기
              <ChevronDown size={14} className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showExportDropdown && (
              <div className={`absolute bottom-full left-0 right-0 mb-1 rounded-lg border shadow-xl overflow-hidden z-20 ${theme.panel} ${theme.border}`}>
                <button
                  onClick={() => { onExportEPUB(); setShowExportDropdown(false); }}
                  disabled={exporting}
                  className="w-full px-3 py-2.5 text-sm text-left hover:bg-black/5 flex items-center gap-2 disabled:opacity-50"
                >
                  <BookOpen size={14} /> EPUB 전자책
                </button>
                <button
                  onClick={() => { onExportDOCX(); setShowExportDropdown(false); }}
                  disabled={exporting}
                  className="w-full px-3 py-2.5 text-sm text-left hover:bg-black/5 flex items-center gap-2 border-t border-black/5 disabled:opacity-50"
                >
                  <File size={14} /> Word (.docx)
                </button>
                <button
                  onClick={() => { onExportMarkdown(); setShowExportDropdown(false); }}
                  className="w-full px-3 py-2.5 text-sm text-left hover:bg-black/5 flex items-center gap-2 border-t border-black/5"
                >
                  <FileText size={14} /> Markdown (.md)
                </button>
                <button
                  onClick={() => { onPrintPDF(); setShowExportDropdown(false); }}
                  className="w-full px-3 py-2.5 text-sm text-left hover:bg-black/5 flex items-center gap-2 border-t border-black/5"
                >
                  <Printer size={14} /> 인쇄 / PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

