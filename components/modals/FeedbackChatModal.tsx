'use client';

import React from 'react';
import { X, Send, Loader2, User } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-xl shadow-2xl border overflow-hidden ${theme.panel} ${theme.border}`}>
        <div className={`p-3 border-b flex items-center justify-between ${theme.border}`}>
          <div className="font-bold text-sm flex items-center gap-2 text-[#4A3B32]">
            <User size={16} className="text-[#8C6B5D]" /> 피드백 대화
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-[#D4C5A9]/50"
            title="닫기"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                ? 'bg-[#8C6B5D] text-white rounded-tr-none'
                : 'bg-[#F5F1E8] text-[#4A3B32] rounded-tl-none border border-[#D4C5A9]'
              }`}>
                <MarkdownRenderer text={m.content} theme={theme} />
              </div>
            </div>
          ))}
        </div>
        <div className={`p-3 border-t ${theme.border} ${theme.bg}`}>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSend()}
              disabled={isLoading}
              placeholder="피드백을 적고 Enter..."
              className={`flex-1 border rounded-lg px-3 py-2 outline-none ${theme.input} ${theme.border} ${theme.text} focus:border-[#8C6B5D]`}
            />
            <button
              onClick={onSend}
              disabled={isLoading || !input.trim()}
              className={`px-3 py-2 rounded-lg text-white font-bold ${theme.button} disabled:opacity-50`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </button>
            <button
              onClick={onFinalize}
              disabled={isLoading || messages.length < 2}
              className={`px-3 py-2 rounded-lg font-bold border ${theme.border} hover:bg-[#EBE5CE] disabled:opacity-50`}
              title="대화 내용을 지침으로 확정"
            >
              확정
            </button>
          </div>
          <div className="mt-2 text-[11px] opacity-70">
            팁: 여러 번 왔다갔다 한 뒤 <b>확정</b>을 누르면, 현재 대화를 집필 지침으로 요약해 자동 반영합니다.
          </div>
        </div>
      </div>
    </div>
  );
}
