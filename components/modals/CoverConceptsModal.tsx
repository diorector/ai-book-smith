'use client';

import React from 'react';
import { Loader2, X, Sparkles, Image as ImageIcon, ChevronDown, Star, Palette, Type, Layers, Zap } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden ${theme.panel} ${theme.border}`}>
        {/* 헤더 */}
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
          <div>
            <h3 className="font-bold text-xl flex items-center gap-2 text-amber-900">
              <ImageIcon size={22} className="text-amber-600" /> 
              표지 컨셉 3안
            </h3>
            <p className="text-sm text-amber-700/70 mt-1">
              하나를 선택하면 즉시 이미지를 생성해서 붙여드립니다. (Gemini 3 Pro Image Preview)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/10 transition-colors"
            title="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {!coverConcepts ? (
            <div className="p-8 text-center">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm opacity-70">
                아직 컨셉이 없습니다. <b>표지 컨셉</b> 버튼을 눌러 생성하세요.
              </p>
            </div>
          ) : (
            <>
              {/* 분석 요약 - 접힘 가능 */}
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-amber-800 hover:text-amber-900 transition-colors">
                  <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
                  STEP 1~2 분석 요약
                </summary>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/50 border border-amber-100">
                    <div className="text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1">
                      <Star size={12} /> 시장/페르소나
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{coverConcepts.auditKorean?.market}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/50 border border-amber-100">
                    <div className="text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1">
                      <Zap size={12} /> 경쟁/트렌드
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{coverConcepts.auditKorean?.competition}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/50 border border-amber-100">
                    <div className="text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1">
                      <Palette size={12} /> 방향성
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{coverConcepts.auditKorean?.direction}</p>
                  </div>
                </div>
              </details>

              {/* 옵션 카드들 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coverConcepts.options?.map((opt, idx) => {
                  const isRecommended = coverConcepts.recommendedId === opt.id;
                  const isGenerating = generatingCover && generatingCoverOptionId === opt.id;
                  const isDisabled = generatingCover && generatingCoverOptionId !== opt.id;

                  return (
                    <div 
                      key={opt.id} 
                      className={`rounded-2xl border-2 overflow-hidden transition-all ${
                        isRecommended 
                          ? 'border-amber-400 shadow-lg shadow-amber-100' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isDisabled ? 'opacity-50' : ''}`}
                    >
                      {/* 옵션 헤더 */}
                      <div className={`px-4 py-3 flex items-center justify-between ${
                        isRecommended ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isRecommended 
                              ? 'bg-amber-500 text-white' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {optionLabels[idx]}
                          </span>
                          <span className="font-bold text-sm">{opt.conceptName}</span>
                        </div>
                        {isRecommended && (
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            <Sparkles size={10} /> 추천
                          </span>
                        )}
                      </div>

                      {/* 옵션 내용 */}
                      <div className="p-4 space-y-3 bg-white">
                        <p className="text-xs text-gray-600 leading-relaxed">{opt.intentKorean}</p>
                        
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex items-start gap-2">
                            <Type size={12} className="text-gray-400 mt-0.5 shrink-0" />
                            <div><span className="font-medium text-gray-500">타이포:</span> {opt.typography}</div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Palette size={12} className="text-gray-400 mt-0.5 shrink-0" />
                            <div><span className="font-medium text-gray-500">톤:</span> {opt.toneAndManner}</div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Layers size={12} className="text-gray-400 mt-0.5 shrink-0" />
                            <div><span className="font-medium text-gray-500">물성:</span> {opt.materiality}</div>
                          </div>
                        </div>

                        {/* 생성 버튼 */}
                        <button
                          onClick={() => onGenerateCover(opt)}
                          disabled={isDisabled}
                          className={`w-full mt-3 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                            isRecommended
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              생성 중...
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} />
                              이 컨셉으로 생성
                            </>
                          )}
                        </button>

                        {/* 프롬프트 보기 */}
                        <details className="mt-2">
                          <summary className="text-[11px] text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                            ▶ Used Prompt 보기
                          </summary>
                          <div className="mt-2 p-2.5 text-[10px] rounded-lg bg-gray-50 border border-gray-100 text-gray-500 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                            {opt.promptEnglish}
                          </div>
                        </details>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
