'use client';

import React, { useRef, useEffect } from 'react';
import { Send, Layers, Loader2, User } from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { Message } from '@/types/project';
import type { ToneSettings } from '@/constants/toneFactors';
import { TONE_FACTORS } from '@/constants/toneFactors';
import ToneSelector from '../ToneSelector';
import MarkdownRenderer from '../MarkdownRenderer';

interface InterviewPanelProps {
  theme: Theme;
  currentTheme: string;
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
  setShowToneSelector: (show: boolean) => void;
  onSendMessage: () => void;
  onGenerateOutline: () => void;
}

export default function InterviewPanel({
  theme,
  currentTheme,
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
  setShowToneSelector,
  onSendMessage,
  onGenerateOutline,
}: InterviewPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`flex-1 rounded-xl border shadow-xl flex flex-col overflow-hidden ${theme.panel} ${theme.border}`}>
      <div className={`p-4 border-b flex justify-between items-center ${theme.border} bg-black/5`}>
        <h2 className="font-semibold flex items-center gap-2">
          <User size={18} className={theme.accent} />
          기획 인터뷰
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(m => m.role !== 'system').map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? `${theme.button} text-white rounded-tr-none`
                : currentTheme === 'midnight' 
                  ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none' 
                  : currentTheme === 'deepSpace'
                    ? 'bg-gray-900 text-gray-200 border border-gray-800 rounded-tl-none'
                    : `${theme.panel} ${theme.text} border ${theme.border} rounded-tl-none`
            }`}>
              <span className={currentTheme === 'midnight' ? 'text-slate-100' : currentTheme === 'deepSpace' ? 'text-gray-200' : ''}>
                {msg.role === 'user' ? msg.content : <MarkdownRenderer text={msg.content} theme={theme} currentTheme={currentTheme} />}
              </span>
            </div>
          </div>
        ))}
        {showToneSelector && (
          <div className="animate-fade-in">
            <ToneSelector
              toneSettings={toneSettings}
              setToneSettings={setToneSettings}
              theme={theme}
              TONE_FACTORS={TONE_FACTORS}
              onClose={() => setShowToneSelector(false)}
            />
            <button 
              onClick={() => setShowToneSelector(false)} 
              className={`w-full mt-4 py-3 px-4 rounded-lg font-bold text-sm shadow-lg transition-all hover:scale-105 ${theme.button} text-white`}
            >
              설정 완료 (채팅 계속하기)
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={`p-3 border-t ${theme.border} ${theme.bg}`}>
        {readyForOutline ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer opacity-80 hover:opacity-100">
                <input
                  type="checkbox"
                  checked={includeIntroOutro}
                  onChange={(e) => setIncludeIntroOutro(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                서문/결문 포함 (Prologue & Epilogue)
              </label>
            </div>
            <button
              onClick={onGenerateOutline}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 animate-pulse"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Layers />}
              심층 목차 생성하기
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
              disabled={loading}
              placeholder="답변을 입력하세요..."
              className={`flex-1 border rounded-lg px-4 py-2 focus:border-indigo-500 outline-none ${theme.input} ${theme.border} ${theme.text}`}
            />
            <button onClick={onSendMessage} disabled={loading} className={`p-2 rounded-lg text-white ${theme.button}`}>
              <Send size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

