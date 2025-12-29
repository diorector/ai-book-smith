'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, Sparkles, Settings2, Plus, Trash2, X, Loader2 } from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { ToneSettings } from '@/constants/toneFactors';
import type { CustomStyle } from '@/types/project';
import { PRESET_DEFAULTS, STYLE_DNA, AUTHOR_PRESETS } from '@/constants/toneFactors';
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

// DNA 미니 바 (study 테마에 맞춤)
function StyleDNAMini({ authorId }: { authorId: string }) {
    const dna = STYLE_DNA[authorId] || STYLE_DNA.none;
    
    const bars = [
        { label: '간결', value: dna.conciseness },
        { label: '격식', value: dna.formality },
        { label: '감성', value: dna.emotionality },
        { label: '직설', value: dna.directness },
    ];

    return (
        <div className="flex gap-4">
            {bars.map((bar, i) => (
                <div key={i} className="flex-1">
                    <div className="flex justify-between text-[9px] text-[var(--ink-muted)] mb-0.5">
                        <span>{bar.label}</span>
                        <span>{bar.value}%</span>
                    </div>
                    <div className="h-1.5 bg-[var(--paper-warm)] rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[var(--antique-gold)] rounded-full transition-all"
                            style={{ width: `${bar.value}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// 옵션 선택 컴포넌트
function OptionSelector({ 
    label, 
    value, 
    options, 
    onChange,
}: { 
    label: string;
    value: string;
    options: readonly ToneFactor[];
    onChange: (id: string) => void;
}) {
    const selected = options.find(o => o.id === value);
    
    return (
        <div className="space-y-2">
            <label className="text-[11px] font-medium text-[var(--ink-medium)] flex items-center justify-between">
                <span>{label}</span>
                {selected && (
                    <span className="text-[10px] text-[var(--antique-gold)] font-normal">{selected.label}</span>
                )}
            </label>
            <div className="flex flex-wrap gap-1.5">
                {options.map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] transition-all border ${
                            value === opt.id
                                ? 'bg-[var(--antique-gold)] text-white border-[var(--antique-gold)] shadow-sm'
                                : 'bg-[var(--paper-warm)] text-[var(--ink-medium)] border-[var(--glass-border)] hover:border-[var(--antique-gold-dim)]'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
            {selected && (
                <p className="text-[10px] text-[var(--ink-light)] pl-0.5">
                    → {selected.desc}
                </p>
            )}
        </div>
    );
}

// 컬러 클래스 매핑
const colorClasses: Record<string, string> = {
    amber: 'bg-[var(--antique-gold)]',
    rose: 'bg-[var(--burgundy)]',
    violet: 'bg-violet-500',
    sky: 'bg-sky-500',
    emerald: 'bg-[var(--forest-green)]',
    slate: 'bg-[var(--ink-medium)]',
};

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
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showAllPresets, setShowAllPresets] = useState(false);
    const [showCustomModal, setShowCustomModal] = useState(false);
    
    const featuredPresets = AUTHOR_PRESETS.filter(p => p.featured);
    const morePresets = AUTHOR_PRESETS.filter(p => !p.featured);
    const displayPresets = showAllPresets ? AUTHOR_PRESETS : featuredPresets;

    const currentPreset = AUTHOR_PRESETS.find(p => p.id === toneSettings.authorPreset);
    const currentDna = STYLE_DNA[toneSettings.authorPreset] || STYLE_DNA.none;

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

    const currentDifficulty = TF.difficultyLevels.find(d => d.id === (toneSettings.difficulty || 3));

    return (
        <>
            {/* 메인 컨테이너 - study 테마에 녹아들도록 */}
            <div className="crystal-card rounded-2xl overflow-visible">
                {/* 헤더 - 심플하게 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)]">
                    <h3 className="font-bold text-[var(--ink-deep)] flex items-center gap-2">
                        <Sparkles size={16} className="text-[var(--antique-gold)]" />
                        글쓰기 스타일
                    </h3>
                    {onClose && (
                        <button 
                            onClick={onClose} 
                            className="p-1.5 rounded-lg hover:bg-[var(--paper-warm)] text-[var(--ink-light)] transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* 탭 - 테마에 맞게 */}
                <div className="flex border-b border-[var(--glass-border)]">
                    <button
                        onClick={() => setActiveTab('presets')}
                        className={`flex-1 py-2.5 text-xs font-medium transition-all ${
                            activeTab === 'presets'
                                ? 'text-[var(--antique-gold)] border-b-2 border-[var(--antique-gold)]'
                                : 'text-[var(--ink-light)] hover:text-[var(--ink-medium)]'
                        }`}
                    >
                        추천 작가
                    </button>
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`flex-1 py-2.5 text-xs font-medium transition-all relative ${
                            activeTab === 'custom'
                                ? 'text-[var(--antique-gold)] border-b-2 border-[var(--antique-gold)]'
                                : 'text-[var(--ink-light)] hover:text-[var(--ink-medium)]'
                        }`}
                    >
                        내 스타일
                        {customStyles.length > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[var(--antique-gold)] text-white text-[9px]">
                                {customStyles.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* 추천 작가 탭 */}
                    {activeTab === 'presets' && (
                        <>
                            {/* 작가 선택 그리드 */}
                            <div className="grid grid-cols-2 gap-2">
                                {displayPresets.map(preset => (
                                    <button
                                        key={preset.id}
                                        onClick={() => handlePresetChange(preset.id)}
                                        className={`relative p-3 rounded-xl text-left transition-all border ${
                                            toneSettings.authorPreset === preset.id && !selectedCustomStyleId
                                                ? 'bg-[var(--paper-warm)] border-[var(--antique-gold)] shadow-sm'
                                                : 'bg-transparent border-[var(--glass-border)] hover:border-[var(--antique-gold-dim)] hover:bg-[var(--paper-warm)]/50'
                                        }`}
                                    >
                                        {toneSettings.authorPreset === preset.id && !selectedCustomStyleId && (
                                            <Check size={14} className="absolute top-2 right-2 text-[var(--antique-gold)]" />
                                        )}
                                        <div className="font-medium text-xs text-[var(--ink-deep)]">{preset.label}</div>
                                        <div className="text-[10px] text-[var(--ink-light)] mt-0.5 line-clamp-1">{preset.desc}</div>
                                    </button>
                                ))}
                            </div>

                            {morePresets.length > 0 && (
                                <button
                                    onClick={() => setShowAllPresets(!showAllPresets)}
                                    className="w-full py-1.5 text-[11px] text-[var(--antique-gold)] hover:text-[var(--leather-brown)] flex items-center justify-center gap-1 transition-colors"
                                >
                                    {showAllPresets ? '접기' : `+${morePresets.length}명 더 보기`}
                                    <ChevronDown size={12} className={`transition-transform ${showAllPresets ? 'rotate-180' : ''}`} />
                                </button>
                            )}

                            {/* 선택된 작가 정보 */}
                            {toneSettings.authorPreset !== 'none' && !selectedCustomStyleId && currentPreset && (
                                <div className="p-4 rounded-xl bg-[var(--paper-warm)]/50 border border-[var(--glass-border)] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-medium text-[var(--ink-medium)]">
                                            ✦ {currentPreset.label} 스타일
                                        </span>
                                        <div className="flex gap-1">
                                            {currentDna.tags.map((tag, i) => (
                                                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--antique-gold)]/10 text-[var(--antique-gold)] border border-[var(--antique-gold)]/20">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <StyleDNAMini authorId={toneSettings.authorPreset} />
                                    
                                    {/* 미리보기 */}
                                    <div className="p-3 rounded-lg bg-[var(--paper-cream)] border border-[var(--glass-border)]">
                                        <div className="text-[10px] text-[var(--antique-gold)] mb-1.5 font-medium">💬 예시 문장</div>
                                        <p className="text-[11px] text-[var(--ink-medium)] italic leading-relaxed">
                                            "{currentPreset.samplePreview}"
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* 내 스타일 탭 */}
                    {activeTab === 'custom' && (
                        <div className="space-y-2">
                            {customStyles.length === 0 ? (
                                <div className="py-8 text-center">
                                    <div className="w-12 h-12 rounded-full bg-[var(--paper-warm)] flex items-center justify-center mx-auto mb-3">
                                        <Sparkles size={20} className="text-[var(--antique-gold)]" />
                                    </div>
                                    <p className="text-xs text-[var(--ink-light)] mb-4">나만의 문체를 학습시켜보세요</p>
                                    <button
                                        onClick={() => setShowCustomModal(true)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-[var(--antique-gold)] hover:bg-[var(--leather-brown)] transition-colors"
                                    >
                                        <Plus size={14} />
                                        만들기
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {customStyles.map(style => (
                                        <div
                                            key={style.id}
                                            onClick={() => handleCustomStyleSelect(style.id)}
                                            className={`relative p-3 rounded-xl cursor-pointer transition-all border ${
                                                selectedCustomStyleId === style.id
                                                    ? 'bg-[var(--paper-warm)] border-[var(--antique-gold)]'
                                                    : 'bg-transparent border-[var(--glass-border)] hover:border-[var(--antique-gold-dim)]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-9 h-9 rounded-lg ${colorClasses[style.color] || 'bg-[var(--antique-gold)]'} flex items-center justify-center text-base shadow-sm`}>
                                                    {style.emoji}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-xs text-[var(--ink-deep)]">{style.name}</div>
                                                    <div className="flex gap-1 mt-0.5">
                                                        {style.analysis.tags.slice(0, 2).map((tag, i) => (
                                                            <span key={i} className="text-[9px] px-1 py-0.5 rounded bg-[var(--paper-warm)] text-[var(--ink-light)]">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {selectedCustomStyleId === style.id && (
                                                    <Check size={16} className="text-[var(--antique-gold)]" />
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDeleteCustomStyle(style.id); }}
                                                className="absolute top-2 right-2 p-1 rounded text-[var(--ink-light)] hover:text-[var(--burgundy)] hover:bg-[var(--burgundy)]/10 transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setShowCustomModal(true)}
                                        className="w-full p-3 rounded-xl border border-dashed border-[var(--glass-border)] hover:border-[var(--antique-gold)] text-[var(--ink-light)] hover:text-[var(--antique-gold)] flex items-center justify-center gap-1.5 text-xs transition-colors"
                                    >
                                        <Plus size={14} />
                                        추가
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* 난이도 */}
                    <div className="pt-4 border-t border-[var(--glass-border)]">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-[var(--ink-medium)]">난이도</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--antique-gold)]/10 text-[var(--antique-gold)] border border-[var(--antique-gold)]/20">
                                {currentDifficulty?.label} — {currentDifficulty?.desc}
                            </span>
                        </div>
                        <div className="relative">
                            <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 bg-[var(--paper-warm)] rounded-full" />
                            <div 
                                className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 bg-[var(--antique-gold)] rounded-full transition-all"
                                style={{ width: `${((toneSettings.difficulty || 3) - 1) / 4 * 100}%` }}
                            />
                            <input
                                type="range"
                                min={1}
                                max={5}
                                value={toneSettings.difficulty || 3}
                                onChange={(e) => setToneSettings({ ...toneSettings, difficulty: parseInt(e.target.value) as ToneSettings['difficulty'] })}
                                className="relative w-full h-5 bg-transparent appearance-none cursor-pointer z-10
                                    [&::-webkit-slider-thumb]:appearance-none
                                    [&::-webkit-slider-thumb]:w-5
                                    [&::-webkit-slider-thumb]:h-5
                                    [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:bg-white
                                    [&::-webkit-slider-thumb]:border-2
                                    [&::-webkit-slider-thumb]:border-[var(--antique-gold)]
                                    [&::-webkit-slider-thumb]:shadow-md
                                    [&::-webkit-slider-thumb]:transition-transform
                                    [&::-webkit-slider-thumb]:hover:scale-110"
                            />
                        </div>
                        <div className="flex justify-between text-[9px] text-[var(--ink-light)] mt-1.5">
                            <span>쉬움</span>
                            <span>어려움</span>
                        </div>
                    </div>

                    {/* 상세 설정 */}
                    {activeTab === 'presets' && (
                        <div className="pt-4 border-t border-[var(--glass-border)]">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="w-full flex items-center justify-between py-2 text-xs text-[var(--ink-light)] hover:text-[var(--ink-medium)] transition-colors"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Settings2 size={14} />
                                    상세 설정 (화자 · 어조 · 문체)
                                </span>
                                <ChevronDown size={14} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                            </button>

                            {showAdvanced && (
                                <div className="mt-4 space-y-5 p-4 rounded-xl bg-[var(--paper-warm)]/30 border border-[var(--glass-border)]">
                                    <OptionSelector
                                        label="화자 (글쓴이 페르소나)"
                                        value={toneSettings.role}
                                        options={TF.roles}
                                        onChange={(id) => setToneSettings({ ...toneSettings, role: id as ToneSettings['role'] })}
                                    />
                                    <OptionSelector
                                        label="어조 (감정적 뉘앙스)"
                                        value={toneSettings.tone}
                                        options={TF.tones}
                                        onChange={(id) => setToneSettings({ ...toneSettings, tone: id as ToneSettings['tone'] })}
                                    />
                                    <OptionSelector
                                        label="문체 (문장 구조)"
                                        value={toneSettings.style}
                                        options={TF.styles}
                                        onChange={(id) => setToneSettings({ ...toneSettings, style: id as ToneSettings['style'] })}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 커스텀 스타일 모달 */}
            <CustomStyleModal
                isOpen={showCustomModal}
                onClose={() => setShowCustomModal(false)}
                onSave={onAddCustomStyle}
            />
        </>
    );
}
