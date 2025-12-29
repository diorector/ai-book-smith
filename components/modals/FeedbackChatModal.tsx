'use client';

import React from 'react';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { FeedbackChatMessage } from '@/types/project';
import MarkdownRenderer from '../MarkdownRenderer';

interface FeedbackChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  messages: FeedbackChatMessage[];
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  onSend: () => void;
  onFinalize: () => void;
}

export default function FeedbackChatModal({
  isOpen,
  onClose,
  theme,
  messages,
  input,
  setInput,
  isLoading,
  onSend,
  onFinalize,
}: FeedbackChatModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[var(--paper)] border border-[var(--stone)] rounded shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--stone)] flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[var(--ink)]">피드백 대화</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[var(--stone)] transition-colors"
          >
            <X size={16} className="text-[var(--ink-muted)]" />
          </button>
        </div>

        {/* Messages */}
        <div className="p-5 max-h-[55vh] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className="ed-message">
              <div className="ed-message-label">
                {m.role === 'user' ? '작가' : '에디터'}
              </div>
              <div className={`ed-message-content ${m.role === 'user' ? 'ed-message-user' : ''}`}>
                <MarkdownRenderer text={m.content} theme={theme} />
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-[var(--stone)] bg-[var(--paper-warm)]">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
              disabled={isLoading}
              placeholder="피드백을 입력하세요..."
              className="ed-input flex-1"
            />
            <button
              onClick={onSend}
              disabled={isLoading || !input.trim()}
              className="px-3 py-2 rounded bg-[var(--ink)] text-white hover:bg-[var(--ink-light)] transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
            </button>
            <button
              onClick={onFinalize}
              disabled={isLoading || messages.length < 2}
              className="px-4 py-2 rounded font-medium border border-[var(--stone-dark)] text-[var(--ink)] hover:bg-[var(--stone)] transition-colors disabled:opacity-50"
            >
              확정
            </button>
          </div>
          <p className="mt-2 text-[10px] text-[var(--ink-muted)]">
            대화 후 확정을 누르면 집필 지침으로 반영됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
