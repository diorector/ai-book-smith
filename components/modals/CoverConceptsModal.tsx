'use client';

import React from 'react';
import { Loader2, X, Image as ImageIcon, Type, Palette, Layers } from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { CoverConcepts, CoverConcept } from '@/types/project';

interface CoverConceptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  coverConcepts: CoverConcepts | null;
  generatingCover: boolean;
  generatingCoverOptionId: number | null;
  onGenerateCover: (option: CoverConcept) => void;
}

export default function CoverConceptsModal({
  isOpen,
  onClose,
  theme,
  coverConcepts,
  generatingCover,
  generatingCoverOptionId,
  onGenerateCover,
}: CoverConceptsModalProps) {
  if (!isOpen) return null;

  const optionLabels = ['A', 'B', 'C'];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[var(--paper)] border border-[var(--stone)] rounded shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--stone)] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base text-[var(--ink)] flex items-center gap-2">
              <ImageIcon size={18} className="text-[var(--ink-muted)]" /> 
              표지 컨셉
            </h3>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">
              컨셉을 선택하면 이미지를 생성합니다
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-[var(--stone)] transition-colors"
          >
            <X size={18} className="text-[var(--ink-muted)]" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {!coverConcepts ? (
            <div className="py-12 text-center">
              <ImageIcon size={40} className="mx-auto mb-4 text-[var(--ink-faint)]" />
              <p className="text-sm text-[var(--ink-muted)]">
                컨셉이 없습니다. 표지 컨셉 버튼을 눌러 생성하세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coverConcepts.options?.map((opt, idx) => {
                const isRecommended = coverConcepts.recommendedId === opt.id;
                const isGenerating = generatingCover && generatingCoverOptionId === opt.id;
                const isDisabled = generatingCover && generatingCoverOptionId !== opt.id;

                return (
                  <div 
                    key={opt.id} 
                    className={`rounded border overflow-hidden transition-all ${
                      isRecommended 
                        ? 'border-[var(--accent)] shadow-sm' 
                        : 'border-[var(--stone)]'
                    } ${isDisabled ? 'opacity-50' : ''}`}
                  >
                    {/* Option Header */}
                    <div className={`px-4 py-3 flex items-center justify-between border-b ${
                      isRecommended ? 'bg-[var(--accent-light)] border-[var(--accent)]/20' : 'bg-[var(--paper-warm)] border-[var(--stone)]'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                          isRecommended 
                            ? 'bg-[var(--accent)] text-white' 
                            : 'bg-[var(--stone)] text-[var(--ink-muted)]'
                        }`}>
                          {optionLabels[idx]}
                        </span>
                        <span className="font-medium text-sm text-[var(--ink)]">{opt.conceptName}</span>
                      </div>
                      {isRecommended && (
                        <span className="text-[10px] font-medium text-[var(--accent)]">
                          추천
                        </span>
                      )}
                    </div>

                    {/* Option Content */}
                    <div className="p-4 space-y-3 bg-[var(--paper)]">
                      <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{opt.intentKorean}</p>
                      
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-start gap-2">
                          <Type size={12} className="text-[var(--ink-faint)] mt-0.5 shrink-0" />
                          <span className="text-[var(--ink-muted)]">{opt.typography}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Palette size={12} className="text-[var(--ink-faint)] mt-0.5 shrink-0" />
                          <span className="text-[var(--ink-muted)]">{opt.toneAndManner}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Layers size={12} className="text-[var(--ink-faint)] mt-0.5 shrink-0" />
                          <span className="text-[var(--ink-muted)]">{opt.materiality}</span>
                        </div>
                      </div>

                      {/* Generate Button */}
                      <button
                        onClick={() => onGenerateCover(opt)}
                        disabled={isDisabled}
                        className={`w-full mt-3 py-2.5 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                          isRecommended
                            ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                            : 'bg-[var(--ink)] text-white hover:bg-[var(--ink-light)]'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="animate-spin" size={14} />
                            생성 중...
                          </>
                        ) : (
                          '이 컨셉으로 생성'
                        )}
                      </button>

                      {/* Prompt Details */}
                      <details className="mt-2">
                        <summary className="text-[10px] text-[var(--ink-faint)] cursor-pointer hover:text-[var(--ink-muted)] transition-colors">
                          프롬프트 보기
                        </summary>
                        <div className="mt-2 p-2 text-[10px] rounded bg-[var(--paper-warm)] border border-[var(--stone)] text-[var(--ink-muted)] leading-relaxed whitespace-pre-wrap max-h-24 overflow-y-auto">
                          {opt.promptEnglish}
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
