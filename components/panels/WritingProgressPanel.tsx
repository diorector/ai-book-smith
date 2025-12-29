'use client';

import React from 'react';
import { 
  RotateCcw, CheckCircle, Loader2, ChevronRight, ChevronDown, 
  Image as ImageIcon, Download, FileText, 
  BookOpen, File, Printer, Search, Wand2, PenTool, Square, Play
} from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { BookStructure } from '@/types/book';
import type { Progress } from '@/types/project';

interface FactCheckStatus {
  status: 'idle' | 'checking' | 'done';
  current: number;
  total: number;
  changes: number;
  changesList: Array<{ original: string; corrected: string; reason: string }>;
}

interface ProofreadStatus {
  status: 'idle' | 'proofreading' | 'done';
  current: number;
  total: number;
  changes: number;
  changesList: Array<{ original: string; corrected: string; reason: string; type?: string }>;
}

interface WritingProgressPanelProps {
  theme: Theme;
  step: string;
  bookStructure: BookStructure;
  subsectionContents: Record<string, string>;
  progress: Progress;
  isTestMode: boolean;
  factCheckStatus: FactCheckStatus;
  proofreadStatus: ProofreadStatus;
  showRecoveryBanner: boolean;
  showFeedbackInput: boolean;
  writingFeedback: string;
  setWritingFeedback: (feedback: string) => void;
  activeSectionKey: string | null;
  tocExpandedChapters: Record<number, boolean>;
  setTocExpandedChapters: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
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
  onExportEPUB: () => void;
  onExportDOCX: () => void;
  onExportMarkdown: () => void;
  onPrintPDF: () => void;
  onProofread: () => void;
  setShowRecoveryBanner: (show: boolean) => void;
}

export default function WritingProgressPanel({
  theme,
  step,
  bookStructure,
  subsectionContents,
  progress,
  isTestMode,
  factCheckStatus,
  proofreadStatus,
  showRecoveryBanner,
  showFeedbackInput,
  writingFeedback,
  setWritingFeedback,
  activeSectionKey,
  tocExpandedChapters,
  setTocExpandedChapters,
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
  onExportEPUB,
  onExportDOCX,
  onExportMarkdown,
  onPrintPDF,
  onProofread,
  setShowRecoveryBanner,
}: WritingProgressPanelProps) {
  const toggleTocChapter = (chapterIdx: number) => {
    setTocExpandedChapters(prev => ({ ...prev, [chapterIdx]: !prev[chapterIdx] }));
  };

  const isPreparing = progress.status === 'preparing';
  const isWriting = progress.status === 'writing';
  const isDone = progress.status === 'done' || step === 'done';
  const isStopped = progress.status === 'stopped';

  return (
    <div className="flex-1 flex flex-col bg-[var(--paper)] border border-[var(--stone)] rounded overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--stone)] flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">집필 진행</h2>
          {isPreparing ? (
            <p className="text-xs text-[var(--ink-muted)] mt-0.5 flex items-center gap-1.5">
              <Loader2 size={10} className="animate-spin" />
              AI가 집필을 준비하고 있습니다...
            </p>
          ) : progress.total > 0 ? (
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">
              {progress.current} / {progress.total} 섹션
            </p>
          ) : null}
        </div>
        
        {(isWriting || isPreparing) && (
          <button
            onClick={onStopWriting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
          >
            <Square size={12} />
            중단
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {progress.total > 0 && (
        <div className="px-6 py-3 border-b border-[var(--stone)]">
          <div className="h-1 bg-[var(--stone)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--ink)] transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Fact Check Status */}
      {(factCheckStatus.status !== 'idle' || factCheckStatus.changes > 0) && (
        <div className="px-6 py-3 border-b border-[var(--stone)] bg-[var(--paper-warm)]">
          <div className="flex items-center gap-2 text-xs">
            {factCheckStatus.status === 'checking' ? (
              <>
                <Search size={12} className="text-[var(--ink-muted)] animate-pulse" />
                <span className="text-[var(--ink-muted)]">
                  팩트체크 중 ({factCheckStatus.current}/{factCheckStatus.total})
                </span>
              </>
            ) : (
              <>
                <CheckCircle size={12} className="text-green-600" />
                <span className="text-[var(--ink-muted)]">
                  팩트체크 완료 {factCheckStatus.changes > 0 && `(${factCheckStatus.changes}개 수정)`}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Proofread Status */}
      {(proofreadStatus.status !== 'idle' || proofreadStatus.changes > 0) && (
        <div className="px-6 py-3 border-b border-[var(--stone)] bg-[var(--paper-warm)]">
          <div className="flex items-center gap-2 text-xs">
            {proofreadStatus.status === 'proofreading' ? (
              <>
                <PenTool size={12} className="text-[var(--ink-muted)] animate-pulse" />
                <span className="text-[var(--ink-muted)]">
                  교정 중 ({proofreadStatus.current}/{proofreadStatus.total})
                </span>
              </>
            ) : (
              <>
                <CheckCircle size={12} className="text-green-600" />
                <span className="text-[var(--ink-muted)]">
                  교정 완료 {proofreadStatus.changes > 0 && `(${proofreadStatus.changes}개 수정)`}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Recovery Banner */}
      {showRecoveryBanner && (
        <div className="px-6 py-3 border-b border-[var(--stone)] bg-[var(--paper-warm)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--ink)]">이전 작업을 이어서 하시겠습니까?</span>
            <div className="flex gap-2">
              <button
                onClick={onResumeWriting}
                className="px-2 py-1 text-xs font-medium bg-[var(--ink)] text-white rounded hover:bg-[var(--ink-light)]"
              >
                이어쓰기
              </button>
              <button
                onClick={() => setShowRecoveryBanner(false)}
                className="px-2 py-1 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                무시
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Writing Status */}
      {isWriting && (
        <div className="px-6 py-3 border-b border-[var(--stone)]">
          <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
            <Loader2 size={12} className="animate-spin" />
            <span>집필 중...</span>
          </div>
        </div>
      )}

      {/* Stopped Status */}
      {isStopped && (
        <div className="px-6 py-3 border-b border-[var(--stone)] bg-[var(--paper-warm)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--ink)]">집필이 중단되었습니다</span>
            <div className="flex gap-2">
              <button
                onClick={onResumeWriting}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[var(--ink)] text-white rounded hover:bg-[var(--ink-light)]"
              >
                <Play size={10} />
                이어쓰기
              </button>
              <button
                onClick={onResetWriting}
                className="px-2 py-1 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                처음부터
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Mode Feedback */}
      {showFeedbackInput && isTestMode && (
        <div className="px-6 py-4 border-b border-[var(--stone)] bg-[var(--paper-warm)]">
          <div className="text-xs font-medium text-[var(--ink)] mb-2">샘플 원고 피드백</div>
          <textarea
            value={writingFeedback}
            onChange={(e) => setWritingFeedback(e.target.value)}
            placeholder="문체, 깊이, 예시 등..."
            className="w-full h-16 p-2 text-xs border border-[var(--stone-dark)] rounded resize-none mb-2 bg-[var(--paper)] outline-none focus:border-[var(--ink-muted)]"
          />
          <div className="flex gap-2">
            <button
              onClick={onOpenFeedbackChat}
              className="flex-1 px-2 py-1.5 text-xs font-medium border border-[var(--stone-dark)] rounded hover:border-[var(--ink-muted)]"
            >
              AI와 대화
            </button>
            <button
              onClick={onContinueWithFeedback}
              className="flex-1 px-2 py-1.5 text-xs font-medium bg-[var(--ink)] text-white rounded hover:bg-[var(--ink-light)]"
            >
              반영하기
            </button>
            <button
              onClick={onFinishWithoutFeedback}
              className="px-2 py-1.5 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              스킵
            </button>
          </div>
        </div>
      )}

      {/* Table of Contents */}
      <div className="flex-1 overflow-y-auto">
        {bookStructure.chapters.map((ch, cIdx) => {
          const isExpanded = tocExpandedChapters[cIdx] ?? true;
          const chapterSections = ch.subsections || [];
          const completedCount = chapterSections.filter(
            sub => subsectionContents[`${ch.chapter_number}_${sub.sub_number}`]
          ).length;

          return (
            <div key={cIdx} className="border-b border-[var(--stone)] last:border-b-0">
              <button
                onClick={() => toggleTocChapter(cIdx)}
                className="w-full flex items-center gap-2 px-6 py-3 text-left hover:bg-[var(--paper-warm)] transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="text-[var(--ink-muted)]" />
                ) : (
                  <ChevronRight size={14} className="text-[var(--ink-muted)]" />
                )}
                <span className="flex-1 text-sm font-medium text-[var(--ink)] truncate">
                  {ch.title}
                </span>
                <span className="text-xs text-[var(--ink-faint)]">
                  {completedCount}/{chapterSections.length}
                </span>
              </button>

              {isExpanded && (
                <div className="ml-10 mr-6 pb-2 border-l border-[var(--stone)]">
                  {chapterSections.map((sub) => {
                    const key = `${ch.chapter_number}_${sub.sub_number}`;
                    const hasContent = !!subsectionContents[key];
                    const isActive = activeSectionKey === key;

                    return (
                      <button
                        key={sub.sub_number}
                        onClick={() => onJumpToSection(ch.chapter_number, sub.sub_number)}
                        className={`w-full flex items-center gap-2 px-4 py-1.5 text-left text-xs transition-colors ${
                          isActive 
                            ? 'bg-[var(--stone)] text-[var(--ink)]' 
                            : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--paper-warm)]'
                        }`}
                      >
                        {hasContent ? (
                          <CheckCircle size={10} className="text-green-600 shrink-0" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full border border-[var(--stone-dark)] shrink-0" />
                        )}
                        <span className="truncate">{sub.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Done Actions */}
      {isDone && (
        <div className="px-6 py-4 border-t border-[var(--stone)] space-y-2">
          {/* Proofread */}
          <button
            onClick={onProofread}
            disabled={proofreadStatus.status === 'proofreading'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium border border-[var(--stone-dark)] text-[var(--ink)] hover:border-[var(--ink-muted)] transition-colors disabled:opacity-50"
          >
            {proofreadStatus.status === 'proofreading' ? (
              <><Loader2 size={14} className="animate-spin" /> 교정 중...</>
            ) : (
              <><Wand2 size={14} /> 원고 다듬기</>
            )}
          </button>

          {/* Cover */}
          <button
            onClick={onGenerateCoverConcepts}
            disabled={coverConceptsLoading || generatingCover}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium border border-[var(--stone-dark)] text-[var(--ink)] hover:border-[var(--ink-muted)] transition-colors disabled:opacity-50"
          >
            {coverConceptsLoading || generatingCover ? (
              <><Loader2 size={14} className="animate-spin" /> 표지 생성 중...</>
            ) : (
              <><ImageIcon size={14} /> 표지 생성</>
            )}
          </button>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium bg-[var(--ink)] text-white hover:bg-[var(--ink-light)] transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <><Loader2 size={14} className="animate-spin" /> 내보내는 중...</>
              ) : (
                <><Download size={14} /> 내보내기</>
              )}
            </button>

            {showExportDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-[var(--paper)] border border-[var(--stone)] rounded shadow-lg overflow-hidden z-10">
                <button
                  onClick={() => { onExportEPUB(); setShowExportDropdown(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--paper-warm)] transition-colors"
                >
                  <BookOpen size={14} /> EPUB
                </button>
                <button
                  onClick={() => { onExportDOCX(); setShowExportDropdown(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--paper-warm)] transition-colors"
                >
                  <FileText size={14} /> DOCX
                </button>
                <button
                  onClick={() => { onExportMarkdown(); setShowExportDropdown(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--paper-warm)] transition-colors"
                >
                  <File size={14} /> Markdown
                </button>
                <button
                  onClick={() => { onPrintPDF(); setShowExportDropdown(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--paper-warm)] transition-colors"
                >
                  <Printer size={14} /> PDF 인쇄
                </button>
              </div>
            )}
          </div>

          {/* Reset */}
          <button
            onClick={onResetWriting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-[var(--accent)] hover:bg-[var(--accent-light)] rounded transition-colors"
          >
            <RotateCcw size={12} /> 처음부터 다시 쓰기
          </button>
        </div>
      )}
    </div>
  );
}
