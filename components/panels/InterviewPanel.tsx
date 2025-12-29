'use client';

import React, { useRef, useEffect } from 'react';
import { ArrowRight, Layers, Loader2 } from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { Message, CustomStyle } from '@/types/project';
import type { ToneSettings } from '@/constants/toneFactors';
import { TONE_FACTORS } from '@/constants/toneFactors';
import ToneSelector from '../ToneSelector';
import MarkdownRenderer from '../MarkdownRenderer';

interface InterviewPanelProps {
  theme: Theme;
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  loading: boolean;
  readyForOutline: boolean;
  includeIntroOutro: boolean;
  setIncludeIntroOutro: (include: boolean) => void;
  toneSettings: ToneSettings;
  setToneSettings: (settings: ToneSettings) => void;
  showToneSelector: boolean;
  onConfirmStyle: () => void;
  customStyles: CustomStyle[];
  onAddCustomStyle: (style: CustomStyle) => void;
  onDeleteCustomStyle: (id: string) => void;
  selectedCustomStyleId: string | null;
  onSelectCustomStyle: (id: string | null) => void;
  onSendMessage: () => void;
  onGenerateOutline: () => void;
}

export default function InterviewPanel({
  theme,
  messages,
  input,
  setInput,
  loading,
  readyForOutline,
  includeIntroOutro,
  setIncludeIntroOutro,
  toneSettings,
  setToneSettings,
  showToneSelector,
  onConfirmStyle,
  customStyles,
  onAddCustomStyle,
  onDeleteCustomStyle,
  selectedCustomStyleId,
  onSelectCustomStyle,
  onSendMessage,
  onGenerateOutline,
}: InterviewPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 스타일 선택 단계일 때는 ToneSelector만 보여줌
  if (showToneSelector) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[var(--paper)] border border-[var(--stone)] rounded">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--stone)]">
          <h2 className="text-sm sm:text-base font-semibold text-[var(--ink)]">글쓰기 스타일 선택</h2>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">어떤 톤으로 책을 쓸지 정해주세요</p>
        </div>

        {/* Tone Selector */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ToneSelector
            toneSettings={toneSettings}
            setToneSettings={setToneSettings}
            theme={theme}
            TONE_FACTORS={TONE_FACTORS}
            customStyles={customStyles}
            onAddCustomStyle={onAddCustomStyle}
            onDeleteCustomStyle={onDeleteCustomStyle}
            selectedCustomStyleId={selectedCustomStyleId}
            onSelectCustomStyle={onSelectCustomStyle}
          />
        </div>

        {/* Confirm Button */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[var(--stone)] bg-[var(--paper-warm)]">
          <button 
            onClick={onConfirmStyle} 
            className="w-full py-3 sm:py-3.5 px-4 rounded-lg text-sm font-medium bg-[var(--ink)] text-white hover:bg-[var(--ink-light)] transition-colors"
          >
            <span className="hidden sm:inline">설정 완료 → </span>기획 인터뷰 시작
          </button>
        </div>
      </div>
    );
  }

  // 스타일 선택 완료 후 인터뷰 UI
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--paper)] border border-[var(--stone)] rounded">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--stone)]">
        <h2 className="text-sm sm:text-base font-semibold text-[var(--ink)]">기획 인터뷰</h2>
        <p className="text-xs text-[var(--ink-muted)] mt-0.5">책의 방향성을 함께 잡아갑니다</p>
      </div>

      {/* Messages - Editorial Style */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
        {messages.filter(m => m.role !== 'system').map((msg, idx) => (
          <div key={idx} className="ed-message">
            <div className="ed-message-label">
              {msg.role === 'user' ? '작가' : '에디터'}
            </div>
            <div className={`ed-message-content ${msg.role === 'user' ? 'ed-message-user' : ''}`}>
              {msg.role === 'user' ? (
                <span>{msg.content}</span>
              ) : (
                <MarkdownRenderer text={msg.content} theme={theme} />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[var(--stone)] bg-[var(--paper-warm)]">
        {readyForOutline ? (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-[var(--ink-light)]">
              <input
                type="checkbox"
                checked={includeIntroOutro}
                onChange={(e) => setIncludeIntroOutro(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--stone-dark)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              서문/결문 포함
            </label>
            <button
              onClick={onGenerateOutline}
              disabled={loading}
              className="w-full py-3 rounded text-sm font-medium flex items-center justify-center gap-2 bg-[var(--ink)] text-white hover:bg-[var(--ink-light)] transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Layers size={16} />}
              목차 생성
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSendMessage()}
              disabled={loading}
              placeholder="답변을 입력하세요..."
              className="ed-input flex-1"
            />
            <button 
              onClick={onSendMessage} 
              disabled={loading || !input.trim()} 
              className="px-4 py-2 rounded bg-[var(--ink)] text-white hover:bg-[var(--ink-light)] transition-colors disabled:opacity-50"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
