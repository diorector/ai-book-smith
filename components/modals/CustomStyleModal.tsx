'use client';

import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, Loader2, Sparkles, Check, ChevronRight } from 'lucide-react';
import type { CustomStyle, CustomStyleAnalysis } from '@/types/project';

interface CustomStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (style: CustomStyle) => void;
}

const EMOJI_OPTIONS = ['✍️', '📝', '💡', '🎯', '📚', '🖋️', '💬', '🎨'];
const COLOR_OPTIONS = [
  { id: 'amber', class: 'bg-amber-500' },
  { id: 'rose', class: 'bg-rose-500' },
  { id: 'violet', class: 'bg-violet-500' },
  { id: 'sky', class: 'bg-sky-500' },
  { id: 'emerald', class: 'bg-emerald-500' },
  { id: 'slate', class: 'bg-slate-600' },
];

// 레이더 차트 컴포넌트
function RadarChart({ analysis }: { analysis: CustomStyleAnalysis }) {
  const axes = [
    { key: 'conciseness', label: '간결', labelAlt: '만연' },
    { key: 'formality', label: '격식', labelAlt: '친근' },
    { key: 'emotionality', label: '이성', labelAlt: '감성' },
    { key: 'directness', label: '직설', labelAlt: '우회' },
    { key: 'humor', label: '진지', labelAlt: '유머' },
  ];

  const size = 160;
  const center = size / 2;
  const radius = 60;

  // 각도 계산 (5각형)
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // 배경 그리드
  const gridLevels = [25, 50, 75, 100];
  const gridPaths = gridLevels.map(level => {
    const points = axes.map((_, i) => getPoint(i, level));
    return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
  });

  // 데이터 경로
  const values = axes.map(axis => analysis[axis.key as keyof CustomStyleAnalysis] as number);
  const dataPoints = values.map((v, i) => getPoint(i, v));
  const dataPath = `M ${dataPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* 배경 그리드 */}
        {gridPaths.map((path, i) => (
          <path key={i} d={path} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        ))}
        {/* 축 */}
        {axes.map((_, i) => {
          const p = getPoint(i, 100);
          return (
            <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="1" />
          );
        })}
        {/* 데이터 영역 */}
        <path d={dataPath} fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" strokeWidth="2" />
        {/* 데이터 포인트 */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#f59e0b" />
        ))}
      </svg>
      {/* 레이블 */}
      <div className="flex flex-wrap justify-center gap-2 mt-2 text-[10px] text-stone-500">
        {axes.map((axis, i) => (
          <span key={i}>{axis.label}↔{axis.labelAlt}</span>
        ))}
      </div>
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
  const [selectedColor, setSelectedColor] = useState('amber');
  const [error, setError] = useState('');

  const handleAnalyze = useCallback(async () => {
    if (inputText.length < 100) {
      setError('최소 100자 이상의 텍스트를 입력해주세요.');
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
    // 초기화
    setStep(1);
    setInputText('');
    setAnalysis(null);
    setPrompt('');
    setStyleName('');
  }, [styleName, selectedEmoji, selectedColor, inputText, analysis, prompt, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div>
            <h2 className="font-bold text-stone-800 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              내 스타일 만들기
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
              <span className={step >= 1 ? 'text-amber-600 font-medium' : ''}>1. 글 입력</span>
              <ChevronRight size={12} />
              <span className={step >= 2 ? 'text-amber-600 font-medium' : ''}>2. 분석 확인</span>
              <ChevronRight size={12} />
              <span className={step >= 3 ? 'text-amber-600 font-medium' : ''}>3. 저장</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-stone-400" />
          </button>
        </div>

        <div className="p-5">
          {/* Step 1: 데이터 주입 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-2 block">
                  평소 쓰시는 글을 붙여넣어 주세요
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="일기, 에세이, 블로그 글, 기고문 등 작가님의 평소 말투가 잘 드러난 글일수록 좋습니다..."
                  className="w-full h-48 p-3 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none resize-none text-sm"
                />
                <div className="flex justify-between mt-2 text-xs text-stone-400">
                  <span>최소 100자 권장</span>
                  <span>{inputText.length}자</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-start gap-2 text-xs text-amber-700">
                  <FileText size={14} className="shrink-0 mt-0.5" />
                  <span>
                    <strong>TIP:</strong> 여러 글을 조합해서 넣으면 더 정확한 분석이 가능합니다.
                    형식적인 글보다 자연스러운 글이 좋습니다.
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || inputText.length < 50}
                className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    문체 분석 중...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    문체 분석하기
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: 분석 결과 */}
          {step === 2 && analysis && (
            <div className="space-y-5">
              {/* 레이더 차트 */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                <h3 className="text-sm font-medium text-stone-700 mb-3 text-center">문체 DNA</h3>
                <RadarChart analysis={analysis} />
              </div>

              {/* 키워드 태그 */}
              <div>
                <h3 className="text-sm font-medium text-stone-700 mb-2">발견된 특징</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 샘플 문장 */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-stone-700">이 스타일로 쓰면?</h3>
                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                  <div className="text-[10px] text-amber-600 mb-1">인사말</div>
                  <p className="text-sm text-stone-700 italic">&ldquo;{analysis.sampleGreeting}&rdquo;</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                  <div className="text-[10px] text-violet-600 mb-1">설명문</div>
                  <p className="text-sm text-stone-700 italic">&ldquo;{analysis.sampleExplanation}&rdquo;</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  다시 분석
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  저장하기
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 저장 */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-2 block">
                  이 문체의 이름을 지어주세요
                </label>
                <input
                  type="text"
                  value={styleName}
                  onChange={(e) => setStyleName(e.target.value)}
                  placeholder="예: 나의 에세이 톤, 블로그 글 스타일"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700 mb-2 block">아이콘 선택</label>
                <div className="flex gap-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        selectedEmoji === emoji
                          ? 'bg-amber-100 ring-2 ring-amber-400'
                          : 'bg-stone-100 hover:bg-stone-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700 mb-2 block">컬러 선택</label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-8 h-8 rounded-full ${color.class} transition-all ${
                        selectedColor === color.id
                          ? 'ring-2 ring-offset-2 ring-amber-400'
                          : ''
                      }`}
                    >
                      {selectedColor === color.id && (
                        <Check size={14} className="text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  뒤로
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  스타일 저장
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


