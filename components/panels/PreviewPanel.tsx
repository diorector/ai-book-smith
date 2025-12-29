'use client';

import React from 'react';
import { FileText, Printer, X } from 'lucide-react';
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

  // NOTE: 원고 출력물에는 톤/시점 메타 정보를 노출하지 않음

  return (
    <div
      className="lg:col-span-8 bg-white border border-[var(--stone)] rounded flex flex-col overflow-hidden shadow-sm animate-fade-in"
      style={{ height: leftPanelHeight ? `${leftPanelHeight}px` : 'calc(100vh - 100px)', minHeight: 'calc(100vh - 100px)' }}
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-[var(--stone)] flex justify-between items-center bg-[var(--paper)] print:hidden">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-[var(--ink-muted)]" />
          <span className="text-sm font-medium text-[var(--ink)]">원고 미리보기</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--ink-muted)]">
          {step === 'done' && (
            <button 
              onClick={onPrintPDF} 
              className="flex items-center gap-1.5 hover:text-[var(--ink)] transition-colors"
            >
              <Printer size={12} />
              인쇄
            </button>
          )}
          <span className="font-mono">약 {Math.round(progress.current * 0.8)}p</span>
        </div>
      </div>

      {/* Content */}
      <div
        id="printable-area"
        ref={previewScrollRef}
        className="flex-1 overflow-y-auto px-10 md:px-16 py-16 print:p-0 print:overflow-visible font-manuscript bg-white"
      >
        {bookStructure ? (
          <div className="max-w-3xl mx-auto print:max-w-none">
            {/* Cover Image */}
            {coverImage && (
              <div className="mb-16 print:break-after-page flex flex-col items-center">
                <div
                  className="shadow-lg rounded overflow-hidden w-72 md:w-96 border border-[var(--stone)] relative group"
                  style={{ aspectRatio: '2 / 3' }}
                >
                  <img 
                    src={coverImage} 
                    alt="Book Cover" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("이미지 로딩 실패:", e);
                      setCoverImage(null);
                    }}
                    loading="lazy"
                  />
                  <button
                    onClick={() => setCoverImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Title Page */}
            <div className="text-center py-24 border-b border-[var(--stone)] mb-16 print:py-16 print:break-after-page">
              <h1 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight text-[var(--ink)] font-display">
                {bookStructure.title}
              </h1>
              <p className="text-xl text-[var(--ink-light)] italic leading-relaxed max-w-xl mx-auto">
                {bookStructure.concept}
              </p>
              {/* intentionally empty: no tone/role label in manuscript */}
            </div>

            {/* Table of Contents */}
            <div className="mb-20 print:break-after-page">
              <div className="text-center mb-10">
                <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--ink-faint)]">
                  Contents
                </span>
                <h2 className="text-2xl font-semibold text-[var(--ink)] mt-2 font-display">목차</h2>
              </div>
              <div className="space-y-6">
                {tocModel.map((ch) => (
                  <div key={ch.chapter_number}>
                    <div className="text-base font-medium text-[var(--ink)] mb-2">
                      <span className="text-[var(--ink-muted)] mr-2">{ch.chapter_number}.</span>
                      {ch.title}
                    </div>
                    <div className="pl-6 space-y-1">
                      {ch.subsections.map((sub) => {
                        const key = `${ch.chapter_number}_${sub.sub_number}`;
                        return (
                          <button
                            key={sub.sub_number}
                            onClick={() => onJumpToSection(ch.chapter_number, sub.sub_number)}
                            className="block text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors text-left leading-relaxed"
                          >
                            <span className="text-[var(--ink-faint)] mr-1">{ch.chapter_number}.{sub.sub_number}</span>
                            {sub.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapters */}
            {bookStructure.chapters.map((ch) => (
              <div key={ch.chapter_number} className="chapter-block print:break-before-page mb-16">
                {/* Chapter Title */}
                <div className="mb-12 mt-8 text-center border-b border-[var(--stone)] pb-8">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--ink-faint)] block mb-3">
                    Chapter {ch.chapter_number}
                  </span>
                  <h2 className="text-2xl font-semibold text-[var(--ink)] font-display">
                    {ch.title}
                  </h2>
                </div>

                {/* Sections */}
                {ch.subsections.map((sub) => {
                  const key = `${ch.chapter_number}_${sub.sub_number}`;
                  const content = subsectionContents[key];
                  const isHighlighted = highlightedSectionKey === key;
                  
                  return (
                    <div
                      key={sub.sub_number}
                      id={`section-${key}`}
                      className={`mb-12 subsection-block scroll-mt-24 transition-all duration-300 ${
                        isHighlighted 
                          ? 'bg-[var(--accent-light)] -mx-6 px-6 py-4 rounded border-l-2 border-[var(--accent)]' 
                          : ''
                      }`}
                    >
                      <h3 className="text-lg font-medium text-[var(--ink)] mb-6 flex items-center gap-2 font-display">
                        <span className="text-[var(--ink-faint)]">§</span>
                        {sub.title}
                      </h3>

                      {content ? (
                        <div className="prose prose-lg max-w-none text-[var(--ink-light)] leading-relaxed">
                          <MarkdownRenderer text={content} theme={theme} />
                        </div>
                      ) : (
                        <div className="py-12 text-center text-sm text-[var(--ink-faint)] border border-dashed border-[var(--stone)] rounded print:hidden">
                          집필 대기 중
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[var(--ink-faint)] print:hidden">
            <FileText size={48} strokeWidth={1} className="mb-4" />
            <p className="text-sm text-center leading-relaxed">
              기획이 완료되면<br />원고가 여기에 표시됩니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
