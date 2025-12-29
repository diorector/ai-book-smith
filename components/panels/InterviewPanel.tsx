'use client';

import React, { useRef, useEffect } from 'react';
import { Send, Layers, Loader2, User } from 'lucide-react';
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
  setShowToneSelector: (show: boolean) => void;
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
  setShowToneSelector,
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

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${theme.card}`}>
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-[#D4C5A9] bg-[#EBE5CE]">
        <h2 className="font-semibold flex items-center gap-2 text-[#4A3B32]">
          <User size={18} className="text-[#8C6B5D]" />
          기획 인터뷰
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(m => m.role !== 'system').map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#8C6B5D] text-white rounded-tr-sm shadow-md'
                : 'bg-[#F5F1E8] border border-[#D4C5A9]/50 rounded-tl-sm text-[#4A3B32]'
            }`}>
              <span>
                {msg.role === 'user' ? msg.content : <MarkdownRenderer text={msg.content} theme={theme} />}
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
              customStyles={customStyles}
              onAddCustomStyle={onAddCustomStyle}
              onDeleteCustomStyle={onDeleteCustomStyle}
              selectedCustomStyleId={selectedCustomStyleId}
              onSelectCustomStyle={onSelectCustomStyle}
              onClose={() => setShowToneSelector(false)}
            />
            <button 
              onClick={() => setShowToneSelector(false)} 
              className={`w-full mt-4 py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-[1.02] text-white ${theme.button}`}
            >
              설정 완료 (채팅 계속하기)
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3.5 border-t border-[#D4C5A9] bg-[#EBE5CE]">
        {readyForOutline ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2 pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer transition-opacity hover:opacity-100 text-[#4A3B32] opacity-90">
                <input
                  type="checkbox"
                  checked={includeIntroOutro}
                  onChange={(e) => setIncludeIntroOutro(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D4C5A9] text-[#8C6B5D] focus:ring-[#8C6B5D]"
                />
                서문/결문 포함 (Prologue & Epilogue)
              </label>
            </div>
            <button
              onClick={onGenerateOutline}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-[#6B8E4E] hover:bg-[#5A7A40] text-white shadow-lg hover:shadow-xl"
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
              className={`flex-1 px-4 py-2.5 outline-none transition-all rounded-xl border ${theme.border} ${theme.input} ${theme.text} focus:border-[#8C6B5D]`}
            />
            <button 
              onClick={onSendMessage} 
              disabled={loading} 
              className={`p-2.5 rounded-xl transition-all text-white ${theme.button}`}
            >
              <Send size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
