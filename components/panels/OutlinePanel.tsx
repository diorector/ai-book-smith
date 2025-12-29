'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronRight, ChevronDown, Loader2, Cpu, Wand2, Trash2, 
  Image as ImageIcon, BookOpen, Sparkles 
} from 'lucide-react';
import type { Theme, ThemeKey } from '@/constants/themes';
import type { BookStructure } from '@/types/book';

// 자동 높이 조절 textarea 컴포넌트
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
      textarea.style.height = `${Math.max(40, textarea.scrollHeight)}px`;
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
  currentTheme?: ThemeKey;
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
  currentTheme = 'study',
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
    <div className={`flex-1 rounded-xl border p-4 flex flex-col ${theme.panel} ${theme.border}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <BookOpen size={20} className="text-amber-600" />
            구조 설계 확인
          </h2>
          <p className="text-xs opacity-60 mt-0.5">
            챕터 삭제 및 AI 수정이 가능합니다.
          </p>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onGenerateCoverConcepts}
            disabled={coverConceptsLoading || generatingCover}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
              coverConceptsLoading || generatingCover
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300'
            }`}
          >
            {(coverConceptsLoading || generatingCover) 
              ? <Loader2 className="animate-spin" size={14} /> 
              : <ImageIcon size={14} />
            }
            표지 컨셉
          </button>
          <button
            onClick={() => onStartWriting(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <Sparkles size={14} /> 테스트 집필
          </button>
          <button
            onClick={() => onStartWriting(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            <Cpu size={16} /> 전체 집필 시작
          </button>
        </div>
      </div>

      {/* 책 제목 */}
      <div className="mb-4 p-3 rounded-xl border border-amber-200/50 bg-amber-50/30">
        <label className="text-xs block mb-1.5 opacity-50 font-medium">책 제목</label>
        <input
          value={bookStructure.title}
          onChange={(e) => setBookStructure({ ...bookStructure, title: e.target.value })}
          className="w-full bg-transparent text-lg font-bold outline-none placeholder:opacity-30"
          placeholder="책 제목을 입력하세요"
        />
      </div>

      {/* 챕터 목록 */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {bookStructure.chapters.map((ch, chIdx) => {
          const isExpanded = expandedChapters[chIdx] ?? false;

          return (
            <div key={chIdx}>
              {/* 챕터 헤더 */}
              <div
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm font-medium hover:bg-black/5 transition-colors cursor-pointer group ${theme.text}`}
              >
                <div 
                  onClick={() => toggleChapter(chIdx)}
                  className="flex items-center gap-2 flex-1"
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-700">
                    CH.{ch.chapter_number}
                  </span>
                  <span className="flex-1 truncate">{ch.title}</span>
                </div>
                {/* 액션 버튼들 */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onModifyNode('chapter', chIdx)} 
                    className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors"
                    title="AI 수정"
                  >
                    <Wand2 size={14} />
                  </button>
                  <button 
                    onClick={() => onDeleteNode('chapter', chIdx)} 
                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                    title="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* 섹션 목록 */}
              {isExpanded && (
                <div className="ml-6 border-l border-black/10 pl-3 space-y-1 py-1">
                  {ch.subsections.map((sub, subIdx) => (
                    <div 
                      key={subIdx}
                      className="group flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-black/5 transition-colors"
                    >
                      <div className="flex-1">
                        <input
                          value={sub.title}
                          onChange={(e) => updateSubsection(chIdx, subIdx, 'title', e.target.value)}
                          className="w-full bg-transparent text-sm font-medium outline-none"
                          placeholder="섹션 제목"
                        />
                        <AutoResizeTextarea
                          value={sub.detail}
                          onChange={(e) => updateSubsection(chIdx, subIdx, 'detail', e.target.value)}
                          className="w-full text-xs mt-1 p-2 rounded-lg bg-black/5 resize-none outline-none opacity-70 focus:opacity-100 transition-opacity overflow-hidden"
                          placeholder="내용 가이드..."
                        />
                      </div>
                      {/* 섹션 액션 버튼들 */}
                      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                        <button 
                          onClick={() => onModifyNode('subsection', chIdx, subIdx)} 
                          className="p-1 rounded hover:bg-amber-100 text-amber-600 transition-colors"
                          title="AI 수정"
                        >
                          <Wand2 size={12} />
                        </button>
                        <button 
                          onClick={() => onDeleteNode('subsection', chIdx, subIdx)} 
                          className="p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
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
