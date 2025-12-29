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
  const isStudyTheme = currentTheme === 'study';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${
      isStudyTheme 
        ? 'crystal-card' 
        : `rounded-xl border shadow-xl ${theme.panel} ${theme.border}`
    }`}>
      {/* Header */}
      <div className={`p-4 flex justify-between items-center ${
        isStudyTheme 
          ? 'border-b border-[var(--glass-border)] bg-[var(--glass-warm)]' 
          : `border-b ${theme.border} bg-black/5`
      }`}>
        <h2 className={`font-semibold flex items-center gap-2 ${isStudyTheme ? 'text-ink-deep' : ''}`}>
          <User size={18} className={isStudyTheme ? 'text-antique-gold' : theme.accent} />
          기획 인터뷰
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(m => m.role !== 'system').map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? isStudyTheme
                  ? 'bg-gradient-to-r from-[var(--antique-gold)] to-[var(--antique-gold-dim)] text-white rounded-tr-sm shadow-md'
                  : `${theme.button} text-white rounded-tr-none`
                : isStudyTheme
                  ? 'crystal-card-flat rounded-tl-sm text-ink-medium'
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
              className={`w-full mt-4 py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-[1.02] ${
                isStudyTheme ? 'crystal-btn-primary' : `${theme.button} text-white`
              }`}
            >
              설정 완료 (채팅 계속하기)
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-3.5 ${
        isStudyTheme 
          ? 'border-t border-[var(--glass-border)] bg-[var(--glass-warm)]' 
          : `border-t ${theme.border} ${theme.bg}`
      }`}>
        {readyForOutline ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2 pb-1">
              <label className={`flex items-center gap-2 text-sm cursor-pointer transition-opacity hover:opacity-100 ${
                isStudyTheme ? 'text-ink-medium opacity-90' : 'opacity-80'
              }`}>
                <input
                  type="checkbox"
                  checked={includeIntroOutro}
                  onChange={(e) => setIncludeIntroOutro(e.target.checked)}
                  className={`w-4 h-4 rounded ${
                    isStudyTheme 
                      ? 'border-[var(--glass-border-strong)] text-[var(--antique-gold)] focus:ring-[var(--antique-gold)]' 
                      : 'border-gray-300 text-indigo-600 focus:ring-indigo-500'
                  }`}
                />
                서문/결문 포함 (Prologue & Epilogue)
              </label>
            </div>
            <button
              onClick={onGenerateOutline}
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isStudyTheme 
                  ? 'bg-gradient-to-r from-[var(--forest-green)] to-[var(--forest-green-soft)] text-white shadow-lg hover:shadow-xl' 
                  : 'bg-green-600 hover:bg-green-500 text-white animate-pulse'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Layers />}
              심층 목차 생성하기
            </button>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
              disabled={loading}
              placeholder="답변을 입력하세요..."
              className={`flex-1 px-4 py-2.5 outline-none transition-all ${
                isStudyTheme 
                  ? 'crystal-input rounded-xl' 
                  : `border rounded-lg focus:border-indigo-500 ${theme.input} ${theme.border} ${theme.text}`
              }`}
            />
            <button 
              onClick={onSendMessage} 
              disabled={loading} 
              className={`p-2.5 rounded-xl transition-all ${
                isStudyTheme 
                  ? 'crystal-btn-primary' 
                  : `text-white ${theme.button}`
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

