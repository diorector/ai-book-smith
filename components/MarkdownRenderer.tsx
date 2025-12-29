'use client';

import React from 'react';
import type { Theme } from '@/constants/themes';

interface MarkdownRendererProps {
  text: string;
  theme: Theme;
}

export default function MarkdownRenderer({ text, theme }: MarkdownRendererProps) {
  if (!text) return null;

  const parseInline = (src: string): React.ReactNode[] => {
    const out: React.ReactNode[] = [];
    let idx = 0;

    const findNext = () => {
      const candidates: Array<{ pos: number; marker: string }> = [];
      const p1 = src.indexOf('**', idx);
      if (p1 !== -1) candidates.push({ pos: p1, marker: '**' });
      const p2 = src.indexOf('__', idx);
      if (p2 !== -1) candidates.push({ pos: p2, marker: '__' });
      const p3 = src.indexOf('*', idx);
      if (p3 !== -1) candidates.push({ pos: p3, marker: '*' });
      const p4 = src.indexOf('_', idx);
      if (p4 !== -1) candidates.push({ pos: p4, marker: '_' });
      if (candidates.length === 0) return null;
      candidates.sort((a, b) => a.pos - b.pos || b.marker.length - a.marker.length);
      return candidates[0];
    };

    const pushText = (t: string) => { if (t) out.push(t); };

    while (idx < src.length) {
      const next = findNext();
      if (!next) { pushText(src.slice(idx)); break; }
      const { pos, marker } = next;
      if (pos > idx) pushText(src.slice(idx, pos));

      if (marker === '*' && src.slice(pos, pos + 2) === '**') { pushText('*'); idx = pos + 1; continue; }
      if (marker === '_' && src.slice(pos, pos + 2) === '__') { pushText('_'); idx = pos + 1; continue; }

      const end = src.indexOf(marker, pos + marker.length);
      if (end === -1) { pushText(marker); idx = pos + marker.length; continue; }
      const inner = src.slice(pos + marker.length, end);

      const key = `inl-${pos}-${end}`;
      if (marker === '**' || marker === '__') {
        out.push(<strong key={key} className="font-semibold">{parseInline(inner)}</strong>);
      } else {
        out.push(<em key={key} className="italic">{parseInline(inner)}</em>);
      }
      idx = end + marker.length;
    }

    return out;
  };

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let inReferences = false;

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const headers = tableBuffer[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());
    let bodyRows = tableBuffer.slice(1);
    if (bodyRows.length > 0 && bodyRows[0].includes('---')) {
      bodyRows = bodyRows.slice(1);
    }
    elements.push(
      <div key={`table-${elements.length}`} className="my-6 overflow-hidden border border-[var(--stone)] rounded">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[var(--paper-warm)] text-[var(--ink)] border-b border-[var(--stone)]">
            <tr>{headers.map((h, i) => <th key={i} className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">{parseInline(h)}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[var(--stone)] bg-[var(--paper)]">
            {bodyRows.map((row, rIdx) => {
              const cells = row.split('|').filter(c => c.trim() !== '').map(c => c.trim());
              return (
                <tr key={rIdx} className="hover:bg-[var(--paper-warm)] transition-colors">
                  {cells.map((c, cIdx) => <td key={cIdx} className="px-4 py-3 whitespace-pre-wrap leading-relaxed text-[var(--ink-light)]">{parseInline(c)}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (/^(References|참고문헌)\s*$/i.test(trimmedLine)) {
      flushTable();
      inReferences = true;
      elements.push(
        <div key={`refs-h-${i}`} className="mt-8 pt-4 border-t border-[var(--stone)]">
          <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--ink-muted)]">{trimmedLine}</h2>
        </div>
      );
      continue;
    }

    if (inReferences) {
      const m = trimmedLine.match(/^\[(\d+)\]\s+(.*?)\s+-\s+(https?:\/\/\S+)\s*$/);
      if (m) {
        const n = m[1];
        const title = m[2];
        const url = m[3];
        elements.push(
          <div key={`ref-${i}`} className="flex items-start gap-2 py-1 text-sm text-[var(--ink-muted)]">
            <span className="font-mono text-xs shrink-0">[{n}]</span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[var(--ink)] transition-colors break-words">
              {title || url}
            </a>
          </div>
        );
        continue;
      }
      if (trimmedLine === '') {
        elements.push(<div key={`ref-sp-${i}`} className="h-2" />);
        continue;
      }
    }

    if (trimmedLine.startsWith('|')) { tableBuffer.push(trimmedLine); continue; }
    flushTable();

    const cleanLine = line
      .replace(/\$\$/g, '')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/([0-9A-Za-z가-힣])_([0-9A-Za-z가-힣])/g, '$1 $2');
    
    const headerMatch = cleanLine.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      inReferences = false;
      const level = headerMatch[1].length;
      const content = headerMatch[2];
      if (level === 1) {
        elements.push(<h1 key={i} className="text-2xl font-semibold mt-8 mb-4 text-[var(--ink)] border-b border-[var(--stone)] pb-2 font-display">{parseInline(content)}</h1>);
      } else if (level === 2) {
        elements.push(<h2 key={i} className="text-xl font-semibold mt-6 mb-3 text-[var(--ink)] font-display">{parseInline(content)}</h2>);
      } else if (level === 3) {
        elements.push(<h3 key={i} className="text-lg font-medium mt-5 mb-2 text-[var(--ink)] flex items-center gap-2 font-display"><span className="text-[var(--ink-faint)]">§</span>{parseInline(content)}</h3>);
      } else {
        elements.push(<h4 key={i} className="text-base font-medium mt-4 mb-2 text-[var(--ink)]">{parseInline(content)}</h4>);
      }
      continue;
    }
    
    if (trimmedLine.match(/^[-*]\s/)) {
      const content = cleanLine.replace(/^[-*]\s/, '');
      elements.push(
        <div key={i} className="flex items-start gap-3 ml-1 mb-1.5 pl-2">
          <span className="mt-2.5 w-1 h-1 rounded-full bg-[var(--ink-faint)] shrink-0" />
          <p className="flex-1 text-[var(--ink-light)] leading-relaxed">{parseInline(content)}</p>
        </div>
      );
      continue;
    }
    
    const orderedListMatch = cleanLine.match(/^\s*(\d+)\.\s(.*)/);
    if (orderedListMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1 mb-1 pl-2">
          <span className="text-sm font-medium mt-0.5 shrink-0 text-[var(--ink-muted)]">{orderedListMatch[1]}.</span>
          <p className="flex-1 text-[var(--ink-light)] leading-relaxed">{parseInline(orderedListMatch[2])}</p>
        </div>
      );
      continue;
    }
    
    if (trimmedLine.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="my-4 pl-4 border-l-2 border-[var(--stone-dark)] italic text-[var(--ink-muted)] py-1">
          {parseInline(cleanLine.replace(/^>\s?/, ''))}
        </blockquote>
      );
      continue;
    }
    
    if (trimmedLine === '') { elements.push(<div key={i} className="h-3" />); continue; }
    elements.push(<p key={i} className="mb-3 text-[15px] leading-[1.8] text-[var(--ink-light)]">{parseInline(cleanLine)}</p>);
  }
  
  flushTable();
  return <>{elements}</>;
}
