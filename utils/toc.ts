import type { BookStructure, TocChapter } from '@/types/book';

/**
 * BookStructure에서 TOC 모델 생성
 */
export function buildTocModel(bookStructure: BookStructure | null): TocChapter[] {
  if (!bookStructure) return [];
  return (bookStructure.chapters || []).map((ch) => ({
    chapter_number: ch.chapter_number,
    title: ch.title,
    subsections: (ch.subsections || []).map((s) => ({
      sub_number: s.sub_number,
      title: s.title,
    })),
  }));
}

/**
 * TOC를 마크다운으로 변환
 */
export function buildTocMarkdown(bookStructure: BookStructure | null): string {
  if (!bookStructure) return "";
  const tocModel = buildTocModel(bookStructure);
  const lines: string[] = [];
  lines.push("## 목차");
  lines.push("");
  for (const ch of tocModel) {
    lines.push(`- CH.${ch.chapter_number} ${ch.title}`);
    for (const sub of ch.subsections) {
      lines.push(`  - ${ch.chapter_number}-${sub.sub_number}. ${sub.title}`);
    }
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  return lines.join("\n");
}

/**
 * 전체 책을 마크다운으로 변환
 */
export function getFullMarkdown(
  bookStructure: BookStructure | null,
  subsectionContents: Record<string, string>
): string {
  if (!bookStructure) return "";
  let md = `# ${bookStructure.title}\n\n`;
  md += `> ${bookStructure.concept}\n\n`;
  md += `${buildTocMarkdown(bookStructure)}`;
  md += `---\n\n`;
  bookStructure.chapters.forEach(ch => {
    md += `# Chapter ${ch.chapter_number}. ${ch.title}\n\n`;
    ch.subsections.forEach(sub => {
      const key = `${ch.chapter_number}_${sub.sub_number}`;
      const content = subsectionContents[key] || '';
      md += `## ${sub.title}\n\n${content}\n\n`;
    });
    md += `---\n`;
  });
  return md;
}

