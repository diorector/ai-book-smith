'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronRight, ChevronDown, Loader2, Play, Wand2, Trash2, 
  Image as ImageIcon, Zap
} from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { BookStructure } from '@/types/book';

function AutoResizeTextarea({ 
  value, 
  onChange, 
  className, 
  placeholder 
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
  className?: string; 
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(32, textarea.scrollHeight)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e);
        adjustHeight();
      }}
      className={className}
      placeholder={placeholder}
      rows={1}
    />
  );
}

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
    <div className="flex-1 flex flex-col bg-[var(--paper)] border border-[var(--stone)] rounded overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[var(--stone)]">
        <h2 className="text-base font-semibold text-[var(--ink)]">목차 구조</h2>
        <p className="text-xs text-[var(--ink-muted)] mt-1">챕터를 편집하고 집필을 시작하세요</p>
        <div className="mt-4 ed-divider" />
      </div>

      {/* Book Title */}
      <div className="px-6 py-5 border-b border-[var(--stone)]">
        <label className="text-[10px] font-medium uppercase tracking-wide text-[var(--ink-faint)] block mb-2">
          제목
        </label>
        <input
          value={bookStructure.title}
          onChange={(e) => setBookStructure({ ...bookStructure, title: e.target.value })}
          className="w-full bg-transparent text-[18px] font-semibold outline-none placeholder:text-[var(--ink-faint)] text-[var(--ink)] border-b border-transparent hover:border-[var(--stone-dark)] focus:border-[var(--accent)] pb-2 transition-colors"
          placeholder="책 제목"
        />
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-b border-[var(--stone)] flex items-center gap-2">
        <button
          onClick={onGenerateCoverConcepts}
          disabled={coverConceptsLoading || generatingCover}
          className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium border border-[var(--stone-dark)] text-[var(--ink-muted)] hover:border-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--paper-warm)] transition-colors disabled:opacity-50"
        >
          {(coverConceptsLoading || generatingCover) 
            ? <Loader2 className="animate-spin" size={14} /> 
            : <ImageIcon size={14} />
          }
          표지
        </button>
        <button
          onClick={() => onStartWriting(true)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium border border-[var(--stone-dark)] text-[var(--ink-muted)] hover:border-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--paper-warm)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
          테스트
        </button>
        <div className="flex-1" />
        <button
          onClick={() => onStartWriting(false)}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-medium bg-[var(--ink)] text-white hover:bg-[var(--ink-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
          {loading ? '준비 중...' : '집필 시작'}
        </button>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto">
        {bookStructure.chapters.map((ch, chIdx) => {
          const isExpanded = expandedChapters[chIdx] ?? false;

          return (
            <div key={chIdx} className="border-b border-[var(--stone)] last:border-b-0">
              {/* Chapter Header */}
              <div className="group flex items-center gap-2 px-6 py-4 hover:bg-[var(--paper-warm)] transition-colors">
                <button 
                  onClick={() => toggleChapter(chIdx)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown size={14} className="text-[var(--ink-muted)]" />
                  ) : (
                    <ChevronRight size={14} className="text-[var(--ink-muted)]" />
                  )}
                  <span className="text-[10px] font-medium text-[var(--ink-faint)] w-10 uppercase tracking-wide">
                    CH {ch.chapter_number}
                  </span>
                  <span className="text-[15px] font-semibold text-[var(--ink)] flex-1 leading-snug line-clamp-2">
                    {ch.title}
                  </span>
                </button>
                
                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onModifyNode('chapter', chIdx)} 
                    className="p-1.5 rounded hover:bg-[var(--stone)] text-[var(--ink-muted)] transition-colors"
                    title="AI 수정"
                  >
                    <Wand2 size={13} />
                  </button>
                  <button 
                    onClick={() => onDeleteNode('chapter', chIdx)} 
                    className="p-1.5 rounded hover:bg-red-50 text-[var(--ink-muted)] hover:text-red-500 transition-colors"
                    title="삭제"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Sections */}
              {isExpanded && (
                <div className="ml-12 mr-6 pb-4 border-l border-[var(--stone)]">
                  {ch.subsections.map((sub, subIdx) => (
                    <div 
                      key={subIdx}
                      className="group flex items-start gap-2 pl-4 pr-2 py-3 hover:bg-[var(--paper-warm)] transition-colors"
                    >
                      <div className="flex-1">
                        <input
                          value={sub.title}
                          onChange={(e) => updateSubsection(chIdx, subIdx, 'title', e.target.value)}
                          className="w-full bg-transparent text-[13px] font-medium outline-none text-[var(--ink)] placeholder:text-[var(--ink-faint)] border-b border-transparent hover:border-[var(--stone-dark)] focus:border-[var(--accent)] pb-1 transition-colors"
                          placeholder="섹션 제목"
                        />
                        <AutoResizeTextarea
                          value={sub.detail}
                          onChange={(e) => updateSubsection(chIdx, subIdx, 'detail', e.target.value)}
                          className="w-full text-[12px] mt-2 pl-3 py-1.5 border-l border-[var(--stone-dark)] bg-transparent resize-none outline-none text-[var(--ink-muted)] leading-relaxed focus:text-[var(--ink)] focus:border-[var(--accent)] transition-colors overflow-hidden"
                          placeholder="내용 가이드..."
                        />
                      </div>
                      
                      {/* Section Actions */}
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
                        <button 
                          onClick={() => onModifyNode('subsection', chIdx, subIdx)} 
                          className="p-1 rounded hover:bg-[var(--stone)] text-[var(--ink-faint)] hover:text-[var(--ink-muted)] transition-colors"
                          title="AI 수정"
                        >
                          <Wand2 size={12} />
                        </button>
                        <button 
                          onClick={() => onDeleteNode('subsection', chIdx, subIdx)} 
                          className="p-1 rounded hover:bg-red-50 text-[var(--ink-faint)] hover:text-red-500 transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
