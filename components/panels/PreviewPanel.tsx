'use client';

import React from 'react';
import { FileText, Printer, BookOpen } from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { BookStructure, TocChapter } from '@/types/book';
import type { ToneSettings } from '@/constants/toneFactors';
import { TONE_FACTORS } from '@/constants/toneFactors';
import MarkdownRenderer from '../MarkdownRenderer';

interface PreviewPanelProps {
  theme: Theme;
  step: string;
  bookStructure: BookStructure | null;
  subsectionContents: Record<string, string>;
  coverImage: string | null;
  setCoverImage: (image: string | null) => void;
  toneSettings: ToneSettings;
  progress: { current: number };
  leftPanelHeight: number | null;
  previewScrollRef: React.RefObject<HTMLDivElement>;
  tocModel: TocChapter[];
  onJumpToSection: (chapterNumber: number, subNumber: number) => void;
  onPrintPDF: () => void;
  highlightedSectionKey?: string | null;
}

export default function PreviewPanel({
  theme,
  step,
  bookStructure,
  subsectionContents,
  coverImage,
  setCoverImage,
  toneSettings,
  progress,
  leftPanelHeight,
  previewScrollRef,
  tocModel,
  onJumpToSection,
  onPrintPDF,
  highlightedSectionKey,
}: PreviewPanelProps) {
  if (step === 'interview') return null;

  const roleLabel = TONE_FACTORS.roles.find(r => r.id === toneSettings.role)?.label;

  return (
    <div
      className={`lg:col-span-8 rounded-xl shadow-2xl flex flex-col overflow-hidden border ${theme.previewBg} ${theme.border} ${theme.previewText} animate-fade-in`}
      style={{ height: leftPanelHeight ? `${leftPanelHeight}px` : 'calc(100vh - 100px)', minHeight: 'calc(100vh - 100px)' }}
    >
      <div className={`p-3 border-b flex justify-between items-center sticky top-0 z-10 print:hidden ${theme.border} bg-opacity-90 backdrop-blur ${theme.previewBg}`}>
        <div className="flex items-center gap-2">
          <FileText size={16} className="opacity-50" />
          <span className="font-ui font-semibold text-sm">원고 미리보기</span>
        </div>
        <div className="flex items-center gap-3 text-xs opacity-50">
          {step === 'done' && (
            <button onClick={onPrintPDF} className="flex items-center gap-1 hover:text-[#8C6B5D] font-medium">
              <Printer size={12} /> 인쇄/PDF
            </button>
          )}
          <span className="font-mono">약 {Math.round(progress.current * 0.8)}p</span>
        </div>
      </div>

      <div
        id="printable-area"
        ref={previewScrollRef}
        className={`flex-1 overflow-y-auto px-8 md:px-12 py-14 pb-12 print:p-0 print:overflow-visible ${theme.previewText} font-book`}
      >
        {bookStructure ? (
          <div className="max-w-4xl mx-auto space-y-12 print:max-w-none">
            {coverImage && (
              <div className="mb-12 print:break-after-page flex flex-col items-center">
                <div
                  className="shadow-2xl rounded overflow-hidden w-80 md:w-[420px] border-8 border-white relative"
                  style={{ aspectRatio: '2 / 3' }}
                >
                  <img 
                    src={coverImage} 
                    alt="Book Cover" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("이미지 로딩 실패:", e);
                      alert("표지 이미지를 표시할 수 없습니다.");
                      setCoverImage(null);
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            <div className={`text-center py-24 border-b-2 mb-12 print:py-12 print:break-after-page ${theme.border}`}>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">{bookStructure.title}</h1>
              <p className="text-2xl italic opacity-70 leading-relaxed">{bookStructure.concept}</p>
              <div className="mt-8 flex justify-center gap-2 opacity-50 text-xs font-ui font-bold uppercase tracking-widest text-[#8C6B5D]">
                <span>Written by AI Book Smith</span>
                <span>•</span>
                <span>{roleLabel}</span>
              </div>
            </div>

            <div className={`mb-16 print:break-after-page ${theme.border}`}>
              <div className="text-center mb-8">
                <div className="text-[11px] tracking-[0.35em] uppercase opacity-40 mb-3">Contents</div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">목차</h2>
                <div className="text-sm opacity-60">Chapters & Sections</div>
              </div>
              <div className="space-y-6">
                {tocModel.map((ch) => (
                  <div key={ch.chapter_number} className="space-y-2">
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="font-bold text-lg">
                        CH.{ch.chapter_number} <span className="font-normal opacity-90">{ch.title}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-y-1">
                      {ch.subsections.map((sub) => {
                        const key = `${ch.chapter_number}_${sub.sub_number}`;
                        return (
                          <a
                            key={sub.sub_number}
                            href={`#section-${key}`}
                            onClick={(e) => { e.preventDefault(); onJumpToSection(ch.chapter_number, sub.sub_number); }}
                            className="text-sm opacity-80 hover:opacity-100 underline-offset-4 hover:underline"
                          >
                            {ch.chapter_number}-{sub.sub_number}. {sub.title}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {bookStructure.chapters.map((ch) => (
              <div key={ch.chapter_number} className="chapter-block print:break-before-page">
                <div className="mb-16 mt-8 text-center">
                  <span className={`inline-block text-xs font-bold tracking-[0.3em] uppercase opacity-40 border-b pb-2 mb-4 ${theme.border}`}>Chapter {ch.chapter_number}</span>
                  <h2 className="text-4xl font-bold tracking-tight">{ch.title}</h2>
                </div>

                {ch.subsections.map((sub) => {
                  const key = `${ch.chapter_number}_${sub.sub_number}`;
                  const content = subsectionContents[key];

                  const isHighlighted = highlightedSectionKey === key;
                  
                  return (
                    <div
                      key={sub.sub_number}
                      id={`section-${key}`}
                      className={`mb-12 subsection-block relative group scroll-mt-24 transition-all duration-500 ${
                        isHighlighted 
                          ? 'ring-4 ring-[#8C6B5D]/40 bg-[#8C6B5D]/10 rounded-xl -mx-4 px-4 py-2 shadow-lg shadow-[#8C6B5D]/20' 
                          : ''
                      }`}
                    >
                      <h3 className="text-xl font-bold opacity-90 mb-6 flex items-center gap-3 mt-8">
                        <span className="text-2xl font-normal select-none opacity-30 text-[#8C6B5D]">§</span> {sub.title}
                      </h3>

                      {content ? (
                        <div className="prose prose-lg max-w-none prose-p:leading-loose">
                          <MarkdownRenderer text={content} theme={theme} />
                        </div>
                      ) : (
                        <div className="p-6 border border-dashed rounded text-center opacity-40 text-sm py-12 print:hidden">
                          집필 대기 중... ({sub.title})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-4 print:hidden">
            <BookOpen size={48} />
            <p>왼쪽 패널에서 기획을 시작하면<br />여기에 원고가 실시간으로 표시됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
