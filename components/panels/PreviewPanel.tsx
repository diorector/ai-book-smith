'use client';

import React from 'react';
import { FileText, Printer, X } from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { BookStructure, TocChapter } from '@/types/book';
import type { ToneSettings } from '@/constants/toneFactors';
import { TONE_FACTORS } from '@/constants/toneFactors';
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
  onUpdateContent?: (key: string, content: string) => void;
}

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, Heading1, Heading2, Heading3, Quote, Table as TableIcon } from 'lucide-react';

// Tiptap Editor Component
const TiptapEditor = ({
  content,
  onUpdate,
  sectionKey,
}: {
  content: string;
  onUpdate: (content: string) => void;
  sectionKey: string;
}) => {
  const [localContent, setLocalContent] = React.useState(content);
  const [showBubbleMenu, setShowBubbleMenu] = React.useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: '내용을 입력하세요...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'manuscript-preview focus:outline-none min-h-[50px] p-2 -m-2 rounded hover:bg-[var(--stone-light)] transition-colors',
      },
    },
    onUpdate: ({ editor }) => {
      const storage = editor.storage as unknown as { markdown?: { getMarkdown?: () => string } };
      const markdown = storage.markdown?.getMarkdown?.() ?? "";
      setLocalContent(markdown);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (hasSelection) {
        setShowBubbleMenu(true);
        setShowFloatingMenu(false);

        // Calculate menu position
        const { view } = editor;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        const editorRect = view.dom.getBoundingClientRect();

        setMenuPosition({
          top: start.top - editorRect.top - 50,
          left: (start.left + end.left) / 2 - editorRect.left,
        });
      } else {
        setShowBubbleMenu(false);

        // Check if current line is empty for floating menu
        const { $from } = editor.state.selection;
        const isEmptyLine = $from.parent.textContent.length === 0;
        setShowFloatingMenu(isEmptyLine);

        if (isEmptyLine) {
          const { view } = editor;
          const coords = view.coordsAtPos(from);
          const editorRect = view.dom.getBoundingClientRect();

          setMenuPosition({
            top: coords.top - editorRect.top,
            left: -60,
          });
        }
      }
    },
    immediatelyRender: false,
  }, [sectionKey]);

  // Debounced update to parent
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localContent !== content) {
        onUpdate(localContent);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [localContent, onUpdate, content]);

  // Effect to sync editor content if changed externally
  React.useEffect(() => {
    const storage = editor?.storage as unknown as { markdown?: { getMarkdown?: () => string } } | undefined;
    const current = storage?.markdown?.getMarkdown?.() ?? "";
    if (editor && content !== current && !editor.isFocused) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      {/* Bubble Menu - appears when text is selected */}
      {showBubbleMenu && (
        <div
          className="absolute z-50 animate-in fade-in duration-100"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center gap-0.5 bg-[var(--ink)] text-white p-1 rounded-lg shadow-xl border border-white/10">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded hover:bg-white/20 transition-colors ${editor.isActive('bold') ? 'bg-white/20' : ''}`}
              title="굵게 (Ctrl+B)"
            >
              <Bold size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded hover:bg-white/20 transition-colors ${editor.isActive('italic') ? 'bg-white/20' : ''}`}
              title="기울임 (Ctrl+I)"
            >
              <Italic size={14} />
            </button>
            <div className="w-px h-4 bg-white/20 mx-0.5" />
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1.5 rounded hover:bg-white/20 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-white/20' : ''}`}
              title="대제목"
            >
              <Heading1 size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded hover:bg-white/20 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white/20' : ''}`}
              title="중제목"
            >
              <Heading2 size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-1.5 rounded hover:bg-white/20 transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-white/20' : ''}`}
              title="소제목"
            >
              <Heading3 size={14} />
            </button>
            <div className="w-px h-4 bg-white/20 mx-0.5" />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded hover:bg-white/20 transition-colors ${editor.isActive('bulletList') ? 'bg-white/20' : ''}`}
              title="목록"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-1.5 rounded hover:bg-white/20 transition-colors ${editor.isActive('blockquote') ? 'bg-white/20' : ''}`}
              title="인용구"
            >
              <Quote size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Menu - appears on empty lines */}
      {showFloatingMenu && (
        <div
          className="absolute z-50 animate-in fade-in duration-100"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <div className="flex items-center gap-0.5 bg-white p-1 rounded-lg shadow-lg border border-[var(--stone)]">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className="p-1.5 rounded hover:bg-[var(--stone-light)] text-[var(--ink-muted)] flex items-center gap-1.5 px-2"
            >
              <Heading1 size={14} />
              <span className="text-[10px] font-medium">대제목</span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className="p-1.5 rounded hover:bg-[var(--stone-light)] text-[var(--ink-muted)] flex items-center gap-1.5 px-2"
            >
              <Heading2 size={14} />
              <span className="text-[10px] font-medium">중제목</span>
            </button>
            <button
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              className="p-1.5 rounded hover:bg-[var(--stone-light)] text-[var(--ink-muted)] flex items-center gap-1.5 px-2"
            >
              <TableIcon size={14} />
              <span className="text-[10px] font-medium">표 삽입</span>
            </button>
          </div>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
};

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
  onUpdateContent,
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
                      className={`mb-12 subsection-block scroll-mt-24 transition-all duration-300 ${isHighlighted
                        ? 'bg-[var(--accent-light)] -mx-6 px-6 py-4 rounded border-l-2 border-[var(--accent)]'
                        : ''
                        }`}
                    >
                      <h3 className="text-lg font-medium text-[var(--ink)] mb-6 flex items-center gap-2 font-display">
                        <span className="text-[var(--ink-faint)]">§</span>
                        {sub.title}
                      </h3>

                      {content ? (
                        <div className="relative group">
                          <TiptapEditor
                            content={content}
                            onUpdate={(newMarkdown) => onUpdateContent?.(key, newMarkdown)}
                            sectionKey={key}
                          />
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
