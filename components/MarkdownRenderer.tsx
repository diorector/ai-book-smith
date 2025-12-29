'use client';

import React from 'react';
import type { Theme } from '@/constants/themes';

interface MarkdownRendererProps {
  text: string;
  theme: Theme;
  currentTheme: string;
}

export default function MarkdownRenderer({ text, theme, currentTheme }: MarkdownRendererProps) {
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
        out.push(<strong key={key} className="font-bold">{parseInline(inner)}</strong>);
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
      <div key={`table-${elements.length}`} className={`my-8 overflow-hidden border ${theme.border} rounded-sm`}>
        <table className="min-w-full text-sm text-left">
          <thead className={`${currentTheme === 'deepSpace' ? 'bg-gray-800' : 'bg-slate-100'} ${theme.previewText} border-b-2 ${theme.border}`}>
            <tr>{headers.map((h, i) => <th key={i} className="px-6 py-3 font-bold tracking-wider uppercase">{parseInline(h)}</th>)}</tr>
          </thead>
          <tbody className={`divide-y divide-slate-200 ${currentTheme === 'deepSpace' ? 'bg-black' : 'bg-white'}`}>
            {bodyRows.map((row, rIdx) => {
              const cells = row.split('|').filter(c => c.trim() !== '').map(c => c.trim());
              return (
                <tr key={rIdx} className={`hover:bg-indigo-500/5 transition-colors ${theme.previewText}`}>
                  {cells.map((c, cIdx) => <td key={cIdx} className="px-6 py-4 whitespace-pre-wrap leading-relaxed">{parseInline(c)}</td>)}
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
        <div key={`refs-h-${i}`} className={`mt-10 pt-6 border-t ${theme.border}`}>
          <h2 className={`text-base font-bold tracking-wide uppercase opacity-80 ${theme.previewText}`}>{trimmedLine}</h2>
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
          <div key={`ref-${i}`} className={`flex items-start gap-3 py-1 text-sm ${theme.previewText}`}>
            <span className="opacity-60 font-mono shrink-0">[{n}]</span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80 break-words">
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
        elements.push(<h1 key={i} className={`text-2xl font-bold mt-10 mb-6 ${theme.previewText} border-b-2 pb-2 ${theme.border}`}>{parseInline(content)}</h1>);
      } else if (level === 2) {
        elements.push(<h2 key={i} className={`text-xl font-bold mt-8 mb-4 ${theme.previewText} border-b pb-1 ${theme.border}`}>{parseInline(content)}</h2>);
      } else if (level === 3) {
        elements.push(<h3 key={i} className={`text-lg font-bold mt-6 mb-2 ${theme.previewText} flex items-center gap-2`}><span className={`opacity-40 text-xl select-none ${theme.accent}`}>§</span>{parseInline(content)}</h3>);
      } else {
        elements.push(<h4 key={i} className={`text-base font-bold mt-4 mb-2 ${theme.previewText} opacity-90`}>{parseInline(content)}</h4>);
      }
      continue;
    }
    
    if (trimmedLine.match(/^[-*]\s/)) {
      const content = cleanLine.replace(/^[-*]\s/, '');
      elements.push(
        <div key={i} className="flex items-start gap-3 ml-1 mb-2 pl-2">
          <span className={`mt-2 text-[6px] shrink-0 opacity-60 ${theme.previewText}`}>●</span>
          <p className={`flex-1 ${theme.previewText} leading-relaxed`}>{parseInline(content)}</p>
        </div>
      );
      continue;
    }
    
    const orderedListMatch = cleanLine.match(/^\s*(\d+)\.\s(.*)/);
    if (orderedListMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1 mb-1 pl-2">
          <span className={`font-bold text-sm mt-1 shrink-0 ${theme.previewText}`}>{orderedListMatch[1]}.</span>
          <p className={`flex-1 ${theme.previewText} leading-relaxed`}>{parseInline(orderedListMatch[2])}</p>
        </div>
      );
      continue;
    }
    
    if (trimmedLine.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className={`my-6 pl-6 border-l-4 ${theme.accent.replace('text-', 'border-')} italic opacity-80 py-2 pr-2 rounded-r ${theme.previewText}`}>
          {parseInline(cleanLine.replace(/^>\s?/, ''))}
        </blockquote>
      );
      continue;
    }
    
    if (trimmedLine === '') { elements.push(<div key={i} className="h-4" />); continue; }
    elements.push(<p key={i} className={`mb-4 text-[17px] leading-[1.95] ${theme.previewText}`}>{parseInline(cleanLine)}</p>);
  }
  
  flushTable();
  return <>{elements}</>;
}

