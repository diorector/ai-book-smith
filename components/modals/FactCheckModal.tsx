'use client';

import React from 'react';
import { X, Sliders } from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { FactClaim } from '@/types/factCheck';
import { openWebSearch } from '@/utils/helpers';

interface FactCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  factClaimsBySection: Record<string, FactClaim[]>;
  onJumpToSection: (chapterNumber: number, subNumber: number) => void;
  onFactCheckRewrite: (key: string) => void;
}

export default function FactCheckModal({
  isOpen,
  onClose,
  theme,
  factClaimsBySection,
  onJumpToSection,
  onFactCheckRewrite,
}: FactCheckModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 print:hidden">
      <div className={`w-full max-w-4xl rounded-xl shadow-2xl border overflow-hidden ${theme.panel} ${theme.border}`}>
        <div className={`p-3 border-b flex items-center justify-between ${theme.border}`}>
          <div className="font-bold text-sm flex items-center gap-2">
            <Sliders size={16} className={theme.accent} /> 팩트체크(검증 필요 항목)
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-black/10"
            title="닫기"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
          {Object.keys(factClaimsBySection || {}).length === 0 ? (
            <div className="text-sm opacity-70">
              아직 수집된 검증 항목이 없습니다. (새로 생성된 원고부터 FACTS_JSON이 누적됩니다)
            </div>
          ) : (
            Object.entries(factClaimsBySection)
              .sort(([a], [b]) => a.localeCompare(b, 'en'))
              .map(([key, claims]) => (
                <div key={key} className={`rounded-lg border ${theme.border} ${theme.bg}`}>
                  <div className="flex items-center justify-between px-3 py-2 border-b border-black/10">
                    <div className="text-sm font-bold">
                      섹션 {key} <span className="opacity-60 font-normal text-xs">({claims.length}개)</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const [ch, sub] = key.split('_').map(Number);
                          onJumpToSection(ch, sub);
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-bold border ${theme.border} hover:bg-black/5`}
                        title="우측 원고로 이동"
                      >
                        이동
                      </button>
                      <button
                        onClick={() => onFactCheckRewrite(key)}
                        className={`px-2.5 py-1 rounded text-xs font-bold ${theme.button}`}
                        title="검증이 어려운 단정 표현을 보수적으로 완화/수정합니다."
                      >
                        팩트체크 윤문
                      </button>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    {claims.slice(0, 50).map((c, idx) => {
                      const q = (c?.suggested_query || c?.claim || '').toString();
                      return (
                        <div key={idx} className={`p-3 rounded border ${theme.border} bg-black/5`}>
                          <div className="text-xs opacity-70 mb-1 flex items-center justify-between gap-2">
                            <span>confidence: <b>{c?.confidence || 'unknown'}</b></span>
                            <button
                              onClick={() => openWebSearch(q)}
                              className={`px-2 py-1 rounded text-[11px] font-bold border ${theme.border} hover:bg-black/5`}
                              title="구글 검색 열기"
                            >
                              검색
                            </button>
                          </div>
                          <div className="text-sm font-semibold mb-1">{c?.claim || '(claim 없음)'}</div>
                          {(c?.note || '').toString().trim() && (
                            <div className="text-xs opacity-70">{c.note}</div>
                          )}
                          {(c?.suggested_query || '').toString().trim() && (
                            <div className="text-[11px] opacity-60 mt-2 font-mono">query: {c.suggested_query}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
          )}
        </div>
        <div className={`p-3 border-t ${theme.border} ${theme.bg} text-[11px] opacity-70`}>
          팁: 현재는 Tavily로 자동 검색→근거 수집→수정(출처 포함)까지 진행됩니다. (키 미설정/실패 시 웹 없이 보수적 안정화로 자동 대체)
        </div>
      </div>
    </div>
  );
}

