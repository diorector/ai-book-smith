'use client';

import React from 'react';
import { RotateCcw, Menu, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  projectName?: string;
  step: string;
  handleReset: () => void;
  onMenuClick?: () => void;
}

function StepIndicator({ step }: { step: string }) {
  const steps = [
    { id: 'interview', label: '기획' },
    { id: 'outline', label: '구조' },
    { id: 'writing', label: '집필' },
  ];

  const currentIndex = steps.findIndex(s => 
    s.id === step || (step === 'done' && s.id === 'writing')
  );

  return (
    <nav className="flex items-center">
      {steps.map((s, idx) => {
        const isActive = idx === currentIndex;
        const isCompleted = idx < currentIndex;

        return (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-2">
              <div className={`
                flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-all
                ${isActive 
                  ? 'bg-[var(--accent)] text-white ring-4 ring-[var(--accent-light)]' 
                  : isCompleted 
                  ? 'bg-[var(--ink)] text-white' 
                  : 'bg-[var(--stone)] text-[var(--ink-faint)]'}
              `}>
                {isCompleted ? <CheckCircle2 size={12} /> : idx + 1}
              </div>
              <span className={`
                text-xs font-medium transition-colors
                ${isActive ? 'text-[var(--ink)]' : 'text-[var(--ink-muted)]'}
              `}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="mx-4 w-8 h-[1px] bg-[var(--stone-dark)]" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default function Header({
  projectName,
  step,
  handleReset,
  onMenuClick,
}: HeaderProps) {
  return (
    <header className="h-16 sm:h-14 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--stone)] bg-[var(--paper)]/80 backdrop-blur-sm sticky top-0 z-30 print:hidden">
      {/* Left: Menu Button (Mobile) + Project Name + Step Indicator */}
      <div className="flex items-center gap-8 min-w-0 flex-1">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-[var(--stone)] text-[var(--ink-muted)] transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu size={20} />
            </button>
          )}
          {projectName && (
            <div className="flex items-center gap-3">
              <h1 className="hidden lg:block text-sm font-bold text-[var(--ink)] truncate max-w-[180px] tracking-tight">
                {projectName}
              </h1>
              <div className="hidden lg:block w-px h-3 bg-[var(--stone-dark)]" />
            </div>
          )}
        </div>
        
        <StepIndicator step={step} />
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border border-[var(--stone)] text-[var(--ink-muted)] hover:border-[var(--ink)] hover:text-[var(--ink)] hover:bg-[var(--paper-warm)] transition-all"
          title="현재 프로젝트 초기화"
        >
          <RotateCcw size={13} />
          <span className="hidden sm:inline uppercase tracking-tighter">Reset</span>
        </button>
      </div>
    </header>
  );
}
