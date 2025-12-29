'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Loader2, Cpu, Wand2, Trash2, Sparkles, Image as ImageIcon } from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { BookStructure } from '@/types/book';

interface OutlinePanelProps {
  theme: Theme;
  bookStructure: BookStructure;
  setBookStructure: (structure: BookStructure | null) => void;
  loading: boolean;
  coverConceptsLoading: boolean;
  generatingCover: boolean;
  onStartWriting: (testMode: boolean) => void;
  onGenerateCoverConcepts: () => void;
  onModifyNode: (type: 'chapter' | 'subsection', cIdx: number, sIdx?: number) => void;
  onDeleteNode: (type: 'chapter' | 'subsection', cIdx: number, sIdx?: number) => void;
}

export default function OutlinePanel({
  theme,
  bookStructure,
  setBookStructure,
  loading,
  coverConceptsLoading,
  generatingCover,
  onStartWriting,
  onGenerateCoverConcepts,
  onModifyNode,
  onDeleteNode,
}: OutlinePanelProps) {
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({ 0: true });

  const toggleChapter = (idx: number) => {
    setExpandedChapters(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const updateSubsection = (chIdx: number, subIdx: number, field: 'title' | 'detail', value: string) => {
    const newStruct = { ...bookStructure };
    newStruct.chapters[chIdx].subsections[subIdx][field] = value;
    setBookStructure(newStruct);
  };

  return (
    <div className={`flex-1 rounded-xl border shadow-xl flex flex-col overflow-hidden relative ${theme.panel} ${theme.border}`}>
      <div className={`p-4 border-b flex justify-between items-center ${theme.border}`}>
        <div>
          <h2 className="font-bold text-lg">구조 설계 확인</h2>
          <p className="text-xs opacity-60">챕터 삭제 및 AI 수정이 가능합니다.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onGenerateCoverConcepts}
            disabled={coverConceptsLoading || generatingCover}
            className="bg-indigo-800 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
          >
            {(coverConceptsLoading || generatingCover) ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} />}
            표지 컨셉
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onStartWriting(true)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border ${theme.border} hover:bg-black/5 flex items-center gap-2`}
            >
              <Cpu size={14} /> 테스트 집필 (서문+2챕터)
            </button>
            <button
              onClick={() => onStartWriting(false)}
              className={`px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 ${theme.button}`}
            >
              <Cpu size={16} /> 전체 집필 시작
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <div className={`p-3 rounded border mb-4 ${theme.bg} ${theme.border}`}>
          <label className="text-xs opacity-50 block mb-1">책 제목</label>
          <input
            value={bookStructure.title}
            onChange={(e) => setBookStructure({ ...bookStructure, title: e.target.value })}
            className="w-full bg-transparent text-lg font-bold outline-none"
          />
        </div>
        {bookStructure.chapters.map((ch, chIdx) => (
          <div key={chIdx} className={`border rounded-lg overflow-hidden ${theme.border} bg-black/5`}>
            <div className="flex items-center gap-2 p-3 cursor-pointer select-none hover:bg-black/5 group">
              <div onClick={() => toggleChapter(chIdx)} className="flex items-center gap-2 flex-1">
                {expandedChapters[chIdx] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${theme.bg} ${theme.accent}`}>CH.{ch.chapter_number}</span>
                <span className="font-semibold text-sm truncate">{ch.title}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onModifyNode('chapter', chIdx)} className="p-1.5 hover:bg-indigo-500/20 rounded text-indigo-400" title="AI 수정"><Wand2 size={14} /></button>
                <button onClick={() => onDeleteNode('chapter', chIdx)} className="p-1.5 hover:bg-red-500/20 rounded text-red-400" title="삭제"><Trash2 size={14} /></button>
              </div>
            </div>

            {expandedChapters[chIdx] && (
              <div className={`p-2 space-y-2 border-t ${theme.border} ${theme.bg}`}>
                {ch.subsections.map((sub, subIdx) => (
                  <div key={subIdx} className="flex gap-2 pl-4 relative group items-start">
                    <div className={`absolute left-1 top-3 w-2 h-2 border-l border-b ${theme.border} rounded-bl`}></div>
                    <div className="flex-1">
                      <input
                        value={sub.title}
                        onChange={(e) => updateSubsection(chIdx, subIdx, 'title', e.target.value)}
                        className="w-full bg-transparent text-sm outline-none border-b border-transparent hover:border-slate-600 mb-1"
                      />
                      <textarea
                        value={sub.detail}
                        onChange={(e) => updateSubsection(chIdx, subIdx, 'detail', e.target.value)}
                        className={`w-full text-xs p-2 rounded resize-none outline-none h-16 opacity-70 focus:opacity-100 ${theme.input}`}
                        placeholder="내용 가이드..."
                      />
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onModifyNode('subsection', chIdx, subIdx)} className="p-1 hover:bg-indigo-500/20 rounded text-indigo-400"><Wand2 size={12} /></button>
                      <button onClick={() => onDeleteNode('subsection', chIdx, subIdx)} className="p-1 hover:bg-red-500/20 rounded text-red-400"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI 수정 모달은 부모에서 처리 */}
    </div>
  );
}

