'use client';

import React, { useState } from 'react';
import { Check, Plus, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { ToneSettings } from '@/constants/toneFactors';
import type { CustomStyle } from '@/types/project';
import { PRESET_DEFAULTS, AUTHOR_PRESETS, STYLE_DNA } from '@/constants/toneFactors';
import CustomStyleModal from './modals/CustomStyleModal';

interface ToneFactor {
  id: string;
  label: string;
  desc: string;
  prompt: string;
  visual?: string;
  featured?: boolean;
  samplePreview?: string;
}

interface DifficultyLevel {
  id: number;
  label: string;
  desc: string;
  prompt: string;
}

interface ToneSelectorProps {
  toneSettings: ToneSettings;
  setToneSettings: (settings: ToneSettings) => void;
  theme: Theme;
  onClose?: () => void;
  customStyles: CustomStyle[];
  onAddCustomStyle: (style: CustomStyle) => void;
  onDeleteCustomStyle: (id: string) => void;
  selectedCustomStyleId: string | null;
  onSelectCustomStyle: (id: string | null) => void;
  TONE_FACTORS: {
    authorPresets: readonly ToneFactor[];
    difficultyLevels: readonly DifficultyLevel[];
    roles: readonly ToneFactor[];
    tones: readonly ToneFactor[];
    styles: readonly ToneFactor[];
  };
}

export default function ToneSelector({
  toneSettings,
  setToneSettings,
  onClose,
  customStyles,
  onAddCustomStyle,
  onDeleteCustomStyle,
  selectedCustomStyleId,
  onSelectCustomStyle,
  TONE_FACTORS: TF
}: ToneSelectorProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>(
    selectedCustomStyleId ? 'custom' : 'presets'
  );
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showAllPresets, setShowAllPresets] = useState(false);

  const currentPreset = AUTHOR_PRESETS.find(p => p.id === toneSettings.authorPreset);
  const currentDifficulty = TF.difficultyLevels.find(d => d.id === (toneSettings.difficulty || 3));
  const selectedCustomStyle = customStyles.find(s => s.id === selectedCustomStyleId);

  // Featured presets (first 6) vs rest
  const featuredPresets = AUTHOR_PRESETS.slice(0, 6);
  const morePresets = AUTHOR_PRESETS.slice(6);

  const handlePresetChange = (presetId: string) => {
    onSelectCustomStyle(null);
    const defaults = PRESET_DEFAULTS[presetId];
    if (defaults) {
      setToneSettings({
        ...toneSettings,
        authorPreset: presetId as ToneSettings['authorPreset'],
        role: defaults.role as ToneSettings['role'],
        tone: defaults.tone as ToneSettings['tone'],
        style: defaults.style as ToneSettings['style'],
        difficulty: defaults.difficulty as ToneSettings['difficulty'],
      });
    } else {
      setToneSettings({ ...toneSettings, authorPreset: presetId as ToneSettings['authorPreset'] });
    }
  };

  const handleCustomStyleSelect = (styleId: string) => {
    if (selectedCustomStyleId === styleId) {
      onSelectCustomStyle(null);
    } else {
      onSelectCustomStyle(styleId);
      setToneSettings({ ...toneSettings, authorPreset: 'none' as ToneSettings['authorPreset'] });
    }
  };

  const getPresetTags = (presetId: string) => {
    const dna = STYLE_DNA[presetId];
    return dna?.tags?.slice(0, 2) || [];
  };

  const PresetCard = ({ preset, isSelected }: { preset: typeof AUTHOR_PRESETS[number]; isSelected: boolean }) => (
    <button
      onClick={() => handlePresetChange(preset.id)}
      className={`relative p-4 rounded-lg text-left transition-all duration-200 border-2 ${
        isSelected
          ? 'border-[var(--ink)] bg-[var(--stone)] shadow-sm'
          : 'border-transparent bg-[var(--paper-warm)] hover:border-[var(--stone-dark)] hover:shadow-sm'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--ink)] flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
      )}
      <div className="text-sm font-medium text-[var(--ink)] mb-1.5">{preset.label}</div>
      <div className="flex flex-wrap gap-1">
        {getPresetTags(preset.id).map((tag, i) => (
          <span key={i} className="text-[10px] text-[var(--ink-muted)]">
            {tag}
          </span>
        ))}
      </div>
    </button>
  );

  return (
    <>
      <div className="bg-[var(--paper)] border border-[var(--stone)] rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--stone)]">
          <h3 className="text-sm sm:text-base font-semibold text-[var(--ink)]">글쓰기 스타일</h3>
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg hover:bg-[var(--stone)] text-[var(--ink-muted)] transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--stone)]">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
              activeTab === 'presets'
                ? 'text-[var(--ink)] border-b-2 border-[var(--ink)]'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            추천 작가
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
              activeTab === 'custom'
                ? 'text-[var(--ink)] border-b-2 border-[var(--ink)]'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            내 스타일
            {customStyles.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-[var(--ink)] text-white">
                {customStyles.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Presets Tab - Card Grid */}
          {activeTab === 'presets' && (
            <div className="space-y-5">
              {/* Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {featuredPresets.map(preset => (
                  <PresetCard 
                    key={preset.id} 
                    preset={preset} 
                    isSelected={toneSettings.authorPreset === preset.id && !selectedCustomStyleId}
                  />
                ))}
              </div>

              {/* More Presets */}
              {morePresets.length > 0 && (
                <>
                  {showAllPresets && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {morePresets.map(preset => (
                        <PresetCard 
                          key={preset.id} 
                          preset={preset} 
                          isSelected={toneSettings.authorPreset === preset.id && !selectedCustomStyleId}
                        />
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setShowAllPresets(!showAllPresets)}
                    className="w-full py-2.5 text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {showAllPresets ? (
                      <>
                        <ChevronUp size={14} />
                        접기
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} />
                        더보기 ({morePresets.length}명)
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Selected Preview */}
              {currentPreset && !selectedCustomStyleId && currentPreset.id !== 'none' && currentPreset.samplePreview && (
                <div className="p-4 bg-[var(--paper-warm)] border border-[var(--stone)] rounded-lg">
                  <div className="text-[10px] text-[var(--ink-muted)] mb-2 uppercase tracking-wide font-medium">
                    {currentPreset.label} 스타일 예시
                  </div>
                  <p className="text-sm text-[var(--ink-light)] italic leading-relaxed">
                    &ldquo;{currentPreset.samplePreview}&rdquo;
                  </p>
                </div>
              )}

              {/* Direct Settings (when 'none' selected) */}
              {toneSettings.authorPreset === 'none' && !selectedCustomStyleId && (
                <div className="p-4 bg-[var(--paper-warm)] border border-[var(--stone)] rounded-lg space-y-5">
                  <div className="text-[10px] text-[var(--ink-muted)] uppercase tracking-wide font-medium">
                    직접 조합하기
                  </div>
                  
                  {/* Role */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[var(--ink)]">화자</span>
                      <span className="text-[10px] text-[var(--ink-muted)]">
                        {TF.roles.find(r => r.id === toneSettings.role)?.desc}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TF.roles.map(role => (
                        <button
                          key={role.id}
                          onClick={() => setToneSettings({ ...toneSettings, role: role.id as ToneSettings['role'] })}
                          title={role.desc}
                          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                            toneSettings.role === role.id
                              ? 'bg-[var(--ink)] text-white'
                              : 'bg-[var(--stone)] text-[var(--ink-muted)] hover:bg-[var(--stone-dark)]'
                          }`}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tone */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[var(--ink)]">어조</span>
                      <span className="text-[10px] text-[var(--ink-muted)]">
                        {TF.tones.find(t => t.id === toneSettings.tone)?.desc}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TF.tones.map(tone => (
                        <button
                          key={tone.id}
                          onClick={() => setToneSettings({ ...toneSettings, tone: tone.id as ToneSettings['tone'] })}
                          title={tone.desc}
                          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                            toneSettings.tone === tone.id
                              ? 'bg-[var(--ink)] text-white'
                              : 'bg-[var(--stone)] text-[var(--ink-muted)] hover:bg-[var(--stone-dark)]'
                          }`}
                        >
                          {tone.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[var(--ink)]">문체</span>
                      <span className="text-[10px] text-[var(--ink-muted)]">
                        {TF.styles.find(s => s.id === toneSettings.style)?.desc}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TF.styles.map(style => (
                        <button
                          key={style.id}
                          onClick={() => setToneSettings({ ...toneSettings, style: style.id as ToneSettings['style'] })}
                          title={style.desc}
                          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                            toneSettings.style === style.id
                              ? 'bg-[var(--ink)] text-white'
                              : 'bg-[var(--stone)] text-[var(--ink-muted)] hover:bg-[var(--stone-dark)]'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Styles Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              {customStyles.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-[var(--ink-muted)] mb-4">나만의 문체를 학습시켜보세요</p>
                  <button
                    onClick={() => setShowCustomModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--ink)] text-white hover:bg-[var(--ink-light)] transition-colors"
                  >
                    <Plus size={16} />
                    스타일 만들기
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customStyles.map(style => {
                      const isSelected = selectedCustomStyleId === style.id;
                      return (
                        <button
                          key={style.id}
                          onClick={() => handleCustomStyleSelect(style.id)}
                          className={`relative p-4 rounded-lg text-left transition-all duration-200 border-2 ${
                            isSelected
                              ? 'border-[var(--ink)] bg-[var(--stone)] shadow-sm'
                              : 'border-transparent bg-[var(--paper-warm)] hover:border-[var(--stone-dark)]'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--ink)] flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-lg">{style.emoji}</span>
                            <span className="text-sm font-medium text-[var(--ink)]">{style.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {style.analysis.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="text-[10px] text-[var(--ink-muted)]">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteCustomStyle(style.id); }}
                            className="absolute bottom-2 right-2 p-1 rounded text-[var(--ink-faint)] hover:text-[var(--accent)] transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setShowCustomModal(true)}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-[var(--stone-dark)] hover:border-[var(--ink-muted)] text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    <Plus size={16} />
                    스타일 추가
                  </button>
                  
                  {/* Selected Custom Style Preview */}
                  {selectedCustomStyle && (
                    <div className="p-4 bg-[var(--paper-warm)] border border-[var(--stone)] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] text-[var(--ink-muted)] uppercase tracking-wide font-medium">
                          {selectedCustomStyle.emoji} {selectedCustomStyle.name} 스타일
                        </div>
                        <button
                          onClick={() => onDeleteCustomStyle(selectedCustomStyle.id)}
                          className="p-1 rounded text-[var(--ink-faint)] hover:text-[var(--accent)] transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-[var(--ink-light)] leading-relaxed line-clamp-3">
                        {selectedCustomStyle.sampleText.slice(0, 150)}...
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Difficulty - Always visible at bottom */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[var(--stone)] bg-[var(--paper-warm)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--ink)]">난이도</span>
            <span className="text-xs text-[var(--ink-muted)]">
              {currentDifficulty?.label}
            </span>
          </div>
          <div className="flex gap-2">
            {TF.difficultyLevels.map(level => (
              <button
                key={level.id}
                onClick={() => setToneSettings({ ...toneSettings, difficulty: level.id as ToneSettings['difficulty'] })}
                className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                  toneSettings.difficulty === level.id
                    ? 'bg-[var(--ink)] text-white'
                    : 'bg-[var(--stone)] text-[var(--ink-muted)] hover:bg-[var(--stone-dark)]'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Style Modal */}
      <CustomStyleModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSave={onAddCustomStyle}
      />
    </>
  );
}
