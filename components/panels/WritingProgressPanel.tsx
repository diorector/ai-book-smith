'use client';

import React from 'react';
import { 
  RefreshCw, CheckCircle, Loader2, ChevronRight, ChevronDown, 
  Image as ImageIcon, Sparkles, Download, FileText, 
  BookOpen, File, Printer, Search, Wand2, PenTool
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

  const isWriting = progress.status === 'writing';
  const isDone = progress.status === 'done' || step === 'done';
  const isStopped = progress.status === 'stopped';

  return (
    <div className={`flex-1 rounded-xl border p-4 flex flex-col ${theme.panel} ${theme.border}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <BookOpen size={20} className="text-amber-600" />
          집필 진행
        </h2>
        
        {/* 진행률 */}
        {progress.total > 0 && (
          <div className="text-sm text-right">
            <span className="font-mono font-bold">{progress.current}</span>
            <span className="opacity-50">/{progress.total}</span>
          </div>
        )}
      </div>

      {/* 진행 바 */}
      {progress.total > 0 && (
        <div className="mb-4">
          <div className="h-2 bg-black/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 팩트체크 상태 - idle이 아니거나 완료 후에도 표시 */}
      {(factCheckStatus.status !== 'idle' || factCheckStatus.changes > 0) && (
        <div className={`mb-4 rounded-xl border overflow-hidden ${
          factCheckStatus.status === 'checking' 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="p-3">
            <div className="flex items-center gap-2 text-sm">
              {factCheckStatus.status === 'checking' ? (
                <>
                  <Search size={14} className="text-blue-500 animate-pulse" />
                  <span className="text-blue-700 font-medium">
                    팩트체크 중... ({factCheckStatus.current}/{factCheckStatus.total})
                  </span>
                </>
            ) : (
              <>
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-green-700 font-medium">
                  팩트체크 완료
                  {factCheckStatus.changes > 0 
                    ? ` - ${factCheckStatus.changes}개 수정됨` 
                    : ' - 문제 없음 ✓'}
                </span>
              </>
            )}
            </div>
            {factCheckStatus.status === 'checking' && (
              <div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(factCheckStatus.current / Math.max(1, factCheckStatus.total)) * 100}%` }}
                />
              </div>
            )}
          </div>
          
          {/* 변경사항 상세 (완료 후) */}
          {factCheckStatus.status === 'done' && factCheckStatus.changesList.length > 0 && (
            <details className="border-t border-green-200">
              <summary className="px-3 py-2 text-xs text-green-700 cursor-pointer hover:bg-green-100/50 transition-colors flex items-center gap-1">
                <ChevronRight size={12} className="transition-transform details-open:rotate-90" />
                변경사항 {factCheckStatus.changesList.length}개 보기
              </summary>
              <div className="px-3 pb-3 max-h-48 overflow-y-auto space-y-2">
                {factCheckStatus.changesList.slice(0, 20).map((change, idx) => (
                  <div key={idx} className="text-xs p-2 rounded-lg bg-white/70 border border-green-100">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium">전</span>
                      <span className="text-gray-600 line-through">{change.original.slice(0, 100)}{change.original.length > 100 ? '...' : ''}</span>
                    </div>
                    <div className="flex items-start gap-2 mb-1">
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-green-100 text-green-600 font-medium">후</span>
                      <span className="text-gray-800">{change.corrected.slice(0, 100)}{change.corrected.length > 100 ? '...' : ''}</span>
                    </div>
                    {change.reason && (
                      <div className="mt-1 text-[10px] text-gray-500 pl-7">💡 {change.reason}</div>
                    )}
                  </div>
                ))}
                {factCheckStatus.changesList.length > 20 && (
                  <div className="text-xs text-center text-gray-400 py-1">
                    ... 외 {factCheckStatus.changesList.length - 20}개 더
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      )}

      {/* 원고 다듬기(교정+윤문) 상태 */}
      {(proofreadStatus.status !== 'idle' || proofreadStatus.changes > 0) && (
        <div className={`mb-4 rounded-xl border overflow-hidden ${
          proofreadStatus.status === 'proofreading' 
            ? 'bg-purple-50 border-purple-200' 
            : 'bg-indigo-50 border-indigo-200'
        }`}>
          <div className="p-3">
            <div className="flex items-center gap-2 text-sm">
              {proofreadStatus.status === 'proofreading' ? (
                <>
                  <PenTool size={14} className="text-purple-500 animate-pulse" />
                  <span className="text-purple-700 font-medium">
                    원고 다듬는 중... ({proofreadStatus.current}/{proofreadStatus.total})
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle size={14} className="text-indigo-500" />
                  <span className="text-indigo-700 font-medium">
                    원고 다듬기 완료
                    {proofreadStatus.changes > 0 
                      ? ` - ${proofreadStatus.changes}개 수정됨` 
                      : ' - 수정 없음 ✓'}
                  </span>
                </>
              )}
            </div>
            {proofreadStatus.status === 'proofreading' && (
              <div className="mt-2 h-1.5 bg-purple-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${(proofreadStatus.current / Math.max(1, proofreadStatus.total)) * 100}%` }}
                />
              </div>
            )}
          </div>
          
          {/* 변경사항 상세 (완료 후) */}
          {proofreadStatus.status === 'done' && proofreadStatus.changesList.length > 0 && (
            <details className="border-t border-indigo-200">
              <summary className="px-3 py-2 text-xs text-indigo-700 cursor-pointer hover:bg-indigo-100/50 transition-colors flex items-center gap-1">
                <ChevronRight size={12} className="transition-transform details-open:rotate-90" />
                변경사항 {proofreadStatus.changesList.length}개 보기
              </summary>
              <div className="px-3 pb-3 max-h-48 overflow-y-auto space-y-2">
                {proofreadStatus.changesList.slice(0, 20).map((change, idx) => (
                  <div key={idx} className="text-xs p-2 rounded-lg bg-white/70 border border-indigo-100">
                    <div className="flex items-start gap-2 mb-1">
                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        change.type === 'proofread' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {change.type === 'proofread' ? '교정' : '윤문'}
                      </span>
                      <span className="text-gray-600 line-through">{change.original.slice(0, 80)}{change.original.length > 80 ? '...' : ''}</span>
                    </div>
                    <div className="flex items-start gap-2 mb-1 pl-10">
                      <span className="text-gray-800">→ {change.corrected.slice(0, 80)}{change.corrected.length > 80 ? '...' : ''}</span>
                    </div>
                    {change.reason && (
                      <div className="mt-1 text-[10px] text-gray-500 pl-10">💡 {change.reason}</div>
                    )}
                  </div>
                ))}
                {proofreadStatus.changesList.length > 20 && (
                  <div className="text-xs text-center text-gray-400 py-1">
                    ... 외 {proofreadStatus.changesList.length - 20}개 더
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      )}

      {/* 복구 배너 */}
      {showRecoveryBanner && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-800">
              <strong>이전 작업 발견!</strong> 이어서 집필하시겠습니까?
            </div>
            <div className="flex gap-2">
              <button
                onClick={onResumeWriting}
                className="px-3 py-1 text-xs font-bold bg-amber-500 text-white rounded hover:bg-amber-600"
              >
                이어쓰기
              </button>
              <button
                onClick={() => setShowRecoveryBanner(false)}
                className="px-3 py-1 text-xs bg-black/10 rounded hover:bg-black/20"
              >
                무시
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상태별 액션 */}
      {isWriting && (
        <div className={`mb-4 p-3 rounded-xl border ${theme.panel} ${theme.border}`}>
          <div className="flex items-center gap-2 text-sm mb-3">
            <Loader2 size={14} className="animate-spin text-amber-600" />
            <span className="text-amber-700 font-medium">집필 중...</span>
          </div>
          <button
            onClick={onStopWriting}
            className="w-full px-3 py-2.5 text-sm font-medium rounded-lg border-2 border-red-300 text-red-600 bg-red-50/50 hover:bg-red-100 hover:border-red-400 transition-all"
          >
            중단
          </button>
        </div>
      )}

      {isStopped && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="text-sm text-amber-700 mb-2">집필이 중단되었습니다.</div>
          <div className="flex gap-2">
            <button
              onClick={onResumeWriting}
              className="flex-1 px-3 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              이어쓰기
            </button>
            <button
              onClick={onResetWriting}
              className="px-3 py-2 text-sm bg-black/10 rounded-lg hover:bg-black/20"
            >
              처음부터
            </button>
          </div>
        </div>
      )}

      {/* 테스트 모드 피드백 */}
      {showFeedbackInput && isTestMode && (
        <div className="mb-4 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
          <div className="text-sm text-indigo-700 mb-2 font-medium">
            샘플 원고를 확인하고 피드백을 남겨주세요
          </div>
          <textarea
            value={writingFeedback}
            onChange={(e) => setWritingFeedback(e.target.value)}
            placeholder="문체, 깊이, 예시 등에 대한 피드백..."
            className="w-full h-20 p-2 text-sm border rounded-lg resize-none mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={onOpenFeedbackChat}
              className="flex-1 px-3 py-2 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              AI와 대화
            </button>
            <button
              onClick={onContinueWithFeedback}
              className="flex-1 px-3 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              피드백 반영
            </button>
            <button
              onClick={onFinishWithoutFeedback}
              className="px-3 py-2 text-sm bg-black/10 rounded-lg hover:bg-black/20"
            >
              그냥 완료
            </button>
          </div>
        </div>
      )}

      {/* 목차 */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {bookStructure.chapters.map((ch, cIdx) => {
          const isExpanded = tocExpandedChapters[cIdx] ?? true;
          const chapterSections = ch.subsections || [];
          const completedCount = chapterSections.filter(
            sub => subsectionContents[`${ch.chapter_number}_${sub.sub_number}`]
          ).length;

          return (
            <div key={cIdx}>
              {/* 챕터 헤더 */}
              <button
                onClick={() => toggleTocChapter(cIdx)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium hover:bg-black/5 transition-colors ${theme.text}`}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="flex-1 truncate">{ch.title}</span>
                <span className="text-xs opacity-50">
                  {completedCount}/{chapterSections.length}
                </span>
              </button>

              {/* 섹션 목록 */}
              {isExpanded && (
                <div className="ml-6 border-l border-black/10 pl-3 space-y-0.5">
                  {chapterSections.map((sub) => {
                    const key = `${ch.chapter_number}_${sub.sub_number}`;
                    const hasContent = !!subsectionContents[key];
                    const isActive = activeSectionKey === key;

                    return (
                      <button
                        key={sub.sub_number}
                        onClick={() => onJumpToSection(ch.chapter_number, sub.sub_number)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${
                          isActive 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'hover:bg-black/5'
                        }`}
                      >
                        {hasContent ? (
                          <CheckCircle size={12} className="text-green-500 shrink-0" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-current opacity-30 shrink-0" />
                        )}
                        <span className="truncate flex-1">{sub.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 완료 상태 액션들 */}
      {isDone && (
        <div className="mt-4 pt-4 border-t border-black/10 space-y-3">
          {/* 원고 다듬기 (교정+윤문) */}
          <button
            onClick={onProofread}
            disabled={proofreadStatus.status === 'proofreading'}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              proofreadStatus.status === 'proofreading'
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md'
            }`}
          >
            {proofreadStatus.status === 'proofreading' ? (
              <><Loader2 size={16} className="animate-spin" /> 다듬는 중...</>
            ) : (
              <><Wand2 size={16} /> 원고 다듬기 (교정+윤문)</>
            )}
          </button>

          {/* 표지 생성 */}
          <button
            onClick={onGenerateCoverConcepts}
            disabled={coverConceptsLoading || generatingCover}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              coverConceptsLoading || generatingCover
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md'
            }`}
          >
            {coverConceptsLoading ? (
              <><Loader2 size={16} className="animate-spin" /> 표지 구상 중...</>
            ) : generatingCover ? (
              <><Loader2 size={16} className="animate-spin" /> 표지 생성 중...</>
            ) : (
              <><ImageIcon size={16} /> 표지 생성</>
            )}
          </button>

          {/* 내보내기 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              disabled={exporting}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                exporting
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : `${theme.button} hover:opacity-90`
              }`}
            >
              {exporting ? (
                <><Loader2 size={16} className="animate-spin" /> 내보내는 중...</>
              ) : (
                <><Download size={16} /> 내보내기</>
              )}
            </button>

            {showExportDropdown && (
              <div className={`absolute bottom-full left-0 right-0 mb-2 rounded-lg shadow-xl border overflow-hidden ${theme.panel} ${theme.border}`}>
                <button
                  onClick={() => { onExportEPUB(); setShowExportDropdown(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                >
                  <BookOpen size={14} /> EPUB
                </button>
                <button
                  onClick={() => { onExportDOCX(); setShowExportDropdown(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                >
                  <FileText size={14} /> DOCX
                </button>
                <button
                  onClick={() => { onExportMarkdown(); setShowExportDropdown(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                >
                  <File size={14} /> Markdown
                </button>
                <button
                  onClick={() => { onPrintPDF(); setShowExportDropdown(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                >
                  <Printer size={14} /> PDF 인쇄
                </button>
              </div>
            )}
          </div>

          {/* 처음부터 다시 */}
          <button
            onClick={onResetWriting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <RefreshCw size={14} /> 처음부터 다시 쓰기
          </button>
        </div>
      )}
    </div>
  );
}
