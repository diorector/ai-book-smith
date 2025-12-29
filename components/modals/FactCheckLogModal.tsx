'use client';

import React from 'react';
import { X, History, CheckCircle, ArrowRight, ExternalLink, AlertCircle, Search } from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { FactCheckLog } from '@/types/factCheck';

interface FactCheckLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  selectedKey: string | null;
  factCheckLogs: Record<string, FactCheckLog>;
}

export default function FactCheckLogModal({
  isOpen,
  onClose,
  theme,
  selectedKey,
  factCheckLogs,
}: FactCheckLogModalProps) {
  if (!isOpen || !selectedKey || !factCheckLogs[selectedKey]) return null;

  const log = factCheckLogs[selectedKey];

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4 print:hidden">
      <div className={`w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${theme.panel} ${theme.border}`}>
        <div className={`p-4 border-b flex items-center justify-between ${theme.border}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <History size={20} className="text-indigo-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">팩트체크 검증 내역</h3>
              <p className="text-xs opacity-60">섹션: {selectedKey}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-black/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left: Evaluations */}
          <div className={`w-full md:w-80 border-r overflow-y-auto p-4 space-y-3 ${theme.border} bg-black/5`}>
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-50 mb-4">검증 결과 (Evaluations)</h4>
            {log.evaluations.length === 0 ? (
              <div className="text-sm opacity-50 italic text-center py-10">검증된 주장이 없습니다.</div>
            ) : (
              log.evaluations.map((ev, idx) => (
                <div key={idx} className={`p-3 rounded-xl border text-xs space-y-2 ${
                  ev.verdict === 'supported' ? 'bg-green-500/5 border-green-500/20' : 
                  ev.verdict === 'contradicted' ? 'bg-red-500/5 border-red-500/20' : 
                  'bg-amber-500/5 border-amber-500/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ev.verdict === 'supported' ? 'bg-green-500 text-white' : 
                      ev.verdict === 'contradicted' ? 'bg-red-500 text-white' : 
                      'bg-amber-500 text-white'
                    }`}>
                      {ev.verdict}
                    </span>
                    <span className="opacity-40 font-mono text-[9px]">Conf: {ev.confidence}</span>
                  </div>
                  <div className="font-bold leading-relaxed">&quot;{ev.claim}&quot;</div>
                  {ev.corrected_claim && (
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-700 font-medium">
                      <ArrowRight size={10} className="inline mr-1" /> {ev.corrected_claim}
                    </div>
                  )}
                  {ev.notes && <div className="opacity-60 leading-snug">{ev.notes}</div>}
                  {ev.citations && ev.citations.length > 0 && (
                    <div className="pt-2 border-t border-black/5 space-y-1">
                      {ev.citations.map((cite, cIdx) => (
                        <a 
                          key={cIdx} 
                          href={cite.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1 text-indigo-500 hover:underline truncate"
                        >
                          <ExternalLink size={10} className="shrink-0" /> {cite.title || cite.url}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right: Text Comparison */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
              {/* Original */}
              <div className="flex flex-col border-r border-black/5">
                <div className="p-2 text-[10px] font-bold uppercase tracking-widest opacity-40 bg-black/5 flex items-center gap-2">
                  <AlertCircle size={10} /> Original Manuscript
                </div>
                <div className={`flex-1 overflow-y-auto p-6 font-serif text-sm leading-relaxed whitespace-pre-wrap opacity-60 ${theme.bg}`}>
                  {log.original}
                </div>
              </div>
              {/* Rewritten */}
              <div className="flex flex-col">
                <div className="p-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-500/5 flex items-center gap-2">
                  <CheckCircle size={10} /> Fact-Checked &amp; Polished
                </div>
                <div className={`flex-1 overflow-y-auto p-6 font-serif text-sm leading-relaxed whitespace-pre-wrap ${theme.bg}`}>
                  {log.rewritten}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 border-t flex justify-between items-center bg-black/5 ${theme.border}`}>
          <div className="text-[11px] opacity-40 flex items-center gap-2">
            <Search size={12} /> Tavily &amp; Gemini 2.5 Flash 기반 자동 검증 완료
          </div>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-xl font-bold text-sm ${theme.button}`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

