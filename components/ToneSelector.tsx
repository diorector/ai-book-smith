'use client';

import React from 'react';
import { Sliders } from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { ToneSettings } from '@/constants/toneFactors';

interface ToneFactor {
    id: string;
    label: string;
    desc: string;
    prompt: string;
    visual?: string;
}

interface ToneSelectorProps {
    toneSettings: ToneSettings;
    setToneSettings: (settings: ToneSettings) => void;
    theme: Theme;
    onClose?: () => void;
    TONE_FACTORS: {
        roles: readonly ToneFactor[];
        tones: readonly ToneFactor[];
        styles: readonly ToneFactor[];
    };
}

export default function ToneSelector({
    toneSettings,
    setToneSettings,
    theme,
    onClose,
    TONE_FACTORS
}: ToneSelectorProps) {
    return (
        <div className={`p-4 rounded-xl border space-y-4 ${theme.panel} ${theme.border}`}>
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm flex items-center gap-2">
                    <Sliders size={16} /> 톤앤매너 상세 설정
                </h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-xs opacity-50 hover:opacity-100"
                    >
                        닫기
                    </button>
                )}
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-xs opacity-70 block mb-1">화자 (Role)</label>
                    <div className="grid grid-cols-2 gap-1">
                        {TONE_FACTORS.roles.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setToneSettings({ ...toneSettings, role: t.id as ToneSettings['role'] })}
                                className={`text-xs p-2 rounded border text-left transition-colors ${toneSettings.role === t.id
                                        ? `${theme.button} border-transparent`
                                        : `hover:bg-black/5 ${theme.border}`
                                    }`}
                            >
                                <div className="font-bold">{t.label}</div>
                                <div className="opacity-70 scale-90 origin-left">{t.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-xs opacity-70 block mb-1">어조 (Tone)</label>
                    <div className="grid grid-cols-2 gap-1">
                        {TONE_FACTORS.tones.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setToneSettings({ ...toneSettings, tone: t.id as ToneSettings['tone'] })}
                                className={`text-xs p-2 rounded border text-left transition-colors ${toneSettings.tone === t.id
                                        ? `${theme.button} border-transparent`
                                        : `hover:bg-black/5 ${theme.border}`
                                    }`}
                            >
                                <div className="font-bold">{t.label}</div>
                                <div className="opacity-70 scale-90 origin-left">{t.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-xs opacity-70 block mb-1">문체 (Style)</label>
                    <div className="grid grid-cols-2 gap-1">
                        {TONE_FACTORS.styles.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setToneSettings({ ...toneSettings, style: t.id as ToneSettings['style'] })}
                                className={`text-xs p-2 rounded border text-left transition-colors ${toneSettings.style === t.id
                                        ? `${theme.button} border-transparent`
                                        : `hover:bg-black/5 ${theme.border}`
                                    }`}
                            >
                                <div className="font-bold">{t.label}</div>
                                <div className="opacity-70 scale-90 origin-left">{t.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
