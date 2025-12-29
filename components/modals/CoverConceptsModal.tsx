'use client';

import React from 'react';
import { Loader2, X, Sparkles, Image as ImageIcon } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className={`w-full max-w-3xl rounded-xl shadow-2xl border overflow-hidden ${theme.panel} ${theme.border}`}>
        <div className={`p-4 border-b flex items-center justify-between ${theme.border}`}>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ImageIcon size={18} className={theme.accent} /> 표지 컨셉 3안
            </h3>
            <p className="text-xs opacity-70 mt-1">하나를 선택하면 즉시 이미지를 생성해서 붙여드립니다. (Gemini 3 Pro Image Preview)</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-black/10"
            title="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {!coverConcepts ? (
            <div className="p-6 text-sm opacity-70">
              아직 컨셉이 없습니다. 왼쪽에서 <b>표지</b> 버튼을 눌러 컨셉을 생성하세요.
            </div>
          ) : (
            <>
              {/* Audit summary */}
              <div className={`p-3 rounded-lg border ${theme.border} ${theme.bg}`}>
                <div className="text-sm font-bold mb-2">STEP 1~2 요약</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs opacity-80">
                  <div>
                    <div className="font-bold mb-1">시장/페르소나</div>
                    <div className="whitespace-pre-wrap">{coverConcepts.auditKorean?.market}</div>
                  </div>
                  <div>
                    <div className="font-bold mb-1">경쟁/트렌드</div>
                    <div className="whitespace-pre-wrap">{coverConcepts.auditKorean?.competition}</div>
                  </div>
                  <div>
                    <div className="font-bold mb-1">방향성</div>
                    <div className="whitespace-pre-wrap">{coverConcepts.auditKorean?.direction}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {coverConcepts.options?.map((opt) => (
                  <div key={opt.id} className={`rounded-xl border overflow-hidden ${theme.border} ${theme.bg}`}>
                    <div className={`p-3 border-b ${theme.border} flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${theme.panel} ${theme.border} border`}>
                          Option {opt.id}
                        </span>
                        <span className="font-bold text-sm">{opt.conceptName}</span>
                      </div>
                      {coverConcepts.recommendedId === opt.id && (
                        <span className="text-[11px] font-bold text-green-400">추천</span>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="text-xs opacity-80 whitespace-pre-wrap">{opt.intentKorean}</p>
                      <div className="text-[11px] opacity-70 space-y-1">
                        <div><b>타이포</b>: {opt.typography}</div>
                        <div><b>톤</b>: {opt.toneAndManner}</div>
                        <div><b>물성</b>: {opt.materiality}</div>
                        <div><b>엣지</b>: {opt.edge}</div>
                      </div>
                      <button
                        onClick={() => onGenerateCover(opt)}
                        disabled={generatingCover && generatingCoverOptionId !== opt.id}
                        className={`w-full mt-2 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${theme.button} disabled:opacity-50`}
                      >
                        {(generatingCover && generatingCoverOptionId === opt.id)
                          ? <Loader2 className="animate-spin" size={16} />
                          : <Sparkles size={16} />}
                        이 컨셉으로 생성
                      </button>
                      <details className="mt-2">
                        <summary className="text-xs opacity-70 cursor-pointer">Used Prompt 보기</summary>
                        <div className={`mt-2 p-2 text-[11px] rounded border ${theme.border} whitespace-pre-wrap`}>
                          {opt.promptEnglish}
                        </div>
                      </details>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

