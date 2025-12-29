'use client';

import React, { useState, useCallback } from 'react';
import { X, FileText, Loader2, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import type { CustomStyle, CustomStyleAnalysis } from '@/types/project';

interface CustomStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (style: CustomStyle) => void;
}

const EMOJI_OPTIONS = ['✍️', '📝', '💡', '🎯', '📚', '🖋️', '💬', '🎨'];
const COLOR_OPTIONS = [
  { id: 'ink', class: 'bg-[var(--ink)]' },
  { id: 'accent', class: 'bg-[var(--accent)]' },
  { id: 'stone', class: 'bg-[var(--stone-dark)]' },
  { id: 'blue', class: 'bg-blue-600' },
  { id: 'green', class: 'bg-green-600' },
  { id: 'purple', class: 'bg-purple-600' },
];

// Simple Bar Chart for Analysis
function AnalysisBars({ analysis }: { analysis: CustomStyleAnalysis }) {
  const bars = [
    { key: 'conciseness', label: '간결함' },
    { key: 'formality', label: '격식' },
    { key: 'emotionality', label: '감성' },
    { key: 'directness', label: '직설' },
    { key: 'humor', label: '유머' },
  ];

  return (
    <div className="space-y-2">
      {bars.map(bar => {
        const value = analysis[bar.key as keyof CustomStyleAnalysis] as number;
        return (
          <div key={bar.key} className="flex items-center gap-3">
            <span className="text-xs text-[var(--ink-muted)] w-14">{bar.label}</span>
            <div className="flex-1 h-1.5 bg-[var(--stone)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--ink)] rounded-full transition-all"
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="text-xs text-[var(--ink-faint)] w-8 text-right">{value}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function CustomStyleModal({ isOpen, onClose, onSave }: CustomStyleModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CustomStyleAnalysis | null>(null);
  const [prompt, setPrompt] = useState('');
  const [styleName, setStyleName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✍️');
  const [selectedColor, setSelectedColor] = useState('ink');
  const [error, setError] = useState('');

  const handleAnalyze = useCallback(async () => {
    if (inputText.length < 100) {
      setError('최소 100자 이상 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const res = await fetch('/api/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '분석 실패');
      }

      const data = await res.json();
      setAnalysis(data.analysis);
      setPrompt(data.prompt);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText]);

  const handleSave = useCallback(() => {
    if (!styleName.trim()) {
      setError('스타일 이름을 입력해주세요.');
      return;
    }
    if (!analysis) return;

    const newStyle: CustomStyle = {
      id: `custom-${Date.now()}`,
      name: styleName.trim(),
      emoji: selectedEmoji,
      color: selectedColor,
      sourceText: inputText.slice(0, 500),
      analysis,
      prompt,
      createdAt: Date.now(),
    };

    onSave(newStyle);
    onClose();
    // Reset
    setStep(1);
    setInputText('');
    setAnalysis(null);
    setPrompt('');
    setStyleName('');
  }, [styleName, selectedEmoji, selectedColor, inputText, analysis, prompt, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-[var(--paper)] border border-[var(--stone)] rounded shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--stone)] flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm text-[var(--ink)]">내 스타일 만들기</h2>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--ink-muted)]">
              <span className={step >= 1 ? 'text-[var(--ink)]' : ''}>1. 입력</span>
              <span>→</span>
              <span className={step >= 2 ? 'text-[var(--ink)]' : ''}>2. 분석</span>
              <span>→</span>
              <span className={step >= 3 ? 'text-[var(--ink)]' : ''}>3. 저장</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-[var(--stone)] transition-colors">
            <X size={16} className="text-[var(--ink-muted)]" />
          </button>
        </div>

        <div className="p-5">
          {/* Step 1: Input */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--ink)] mb-2 block">
                  평소 쓰시는 글을 붙여넣어 주세요
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="일기, 에세이, 블로그 글 등..."
                  className="w-full h-40 p-3 rounded border border-[var(--stone-dark)] bg-[var(--paper)] focus:border-[var(--ink-muted)] outline-none resize-none text-sm"
                />
                <div className="flex justify-between mt-1.5 text-[10px] text-[var(--ink-faint)]">
                  <span>최소 100자</span>
                  <span>{inputText.length}자</span>
                </div>
              </div>

              <div className="p-3 rounded bg-[var(--paper-warm)] border border-[var(--stone)]">
                <div className="flex items-start gap-2 text-xs text-[var(--ink-muted)]">
                  <FileText size={14} className="shrink-0 mt-0.5" />
                  <span>자연스러운 글일수록 분석이 정확합니다.</span>
                </div>
              </div>

              {error && <p className="text-xs text-[var(--accent)]">{error}</p>}

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || inputText.length < 50}
                className="w-full py-3 rounded font-medium text-white bg-[var(--ink)] hover:bg-[var(--ink-light)] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    문체 분석
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Analysis Result */}
          {step === 2 && analysis && (
            <div className="space-y-5">
              <div className="p-4 rounded bg-[var(--paper-warm)] border border-[var(--stone)]">
                <h3 className="text-xs font-medium text-[var(--ink)] mb-3">문체 분석</h3>
                <AnalysisBars analysis={analysis} />
              </div>

              <div>
                <h3 className="text-xs font-medium text-[var(--ink)] mb-2">발견된 특징</h3>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 rounded text-[10px] bg-[var(--stone)] text-[var(--ink-muted)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-medium text-[var(--ink)]">예시 문장</h3>
                <div className="p-3 rounded bg-[var(--paper-warm)] border border-[var(--stone)]">
                  <p className="text-xs text-[var(--ink-muted)] italic">&ldquo;{analysis.sampleGreeting}&rdquo;</p>
                </div>
                <div className="p-3 rounded bg-[var(--paper-warm)] border border-[var(--stone)]">
                  <p className="text-xs text-[var(--ink-muted)] italic">&ldquo;{analysis.sampleExplanation}&rdquo;</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded border border-[var(--stone-dark)] text-[var(--ink-muted)] hover:bg-[var(--stone)] transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft size={14} />
                  다시
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 rounded font-medium text-white bg-[var(--ink)] hover:bg-[var(--ink-light)] transition-colors flex items-center justify-center gap-1"
                >
                  저장
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Save */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--ink)] mb-2 block">
                  스타일 이름
                </label>
                <input
                  type="text"
                  value={styleName}
                  onChange={(e) => setStyleName(e.target.value)}
                  placeholder="예: 나의 에세이 톤"
                  className="w-full px-3 py-2.5 rounded border border-[var(--stone-dark)] bg-[var(--paper)] focus:border-[var(--ink-muted)] outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--ink)] mb-2 block">아이콘</label>
                <div className="flex gap-1.5">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-9 h-9 rounded flex items-center justify-center text-lg transition-all ${
                        selectedEmoji === emoji
                          ? 'bg-[var(--ink)] text-white'
                          : 'bg-[var(--stone)] hover:bg-[var(--stone-dark)]'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--ink)] mb-2 block">컬러</label>
                <div className="flex gap-1.5">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-7 h-7 rounded-full ${color.class} transition-all ${
                        selectedColor === color.id ? 'ring-2 ring-offset-2 ring-[var(--ink)]' : ''
                      }`}
                    >
                      {selectedColor === color.id && <Check size={12} className="text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-[var(--accent)]">{error}</p>}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 rounded border border-[var(--stone-dark)] text-[var(--ink-muted)] hover:bg-[var(--stone)] transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft size={14} />
                  뒤로
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded font-medium text-white bg-[var(--ink)] hover:bg-[var(--ink-light)] transition-colors flex items-center justify-center gap-1"
                >
                  <Check size={14} />
                  저장
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
