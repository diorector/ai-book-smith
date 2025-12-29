import { TONE_FACTORS, type ToneSettings } from '@/constants/toneFactors';

/**
 * 톤 설정에서 텍스트 프롬프트 생성
 */
export function getTonePrompt(toneSettings: ToneSettings): string {
  const role = TONE_FACTORS.roles.find(r => r.id === toneSettings.role);
  const tone = TONE_FACTORS.tones.find(t => t.id === toneSettings.tone);
  const style = TONE_FACTORS.styles.find(s => s.id === toneSettings.style);

  if (!role || !tone || !style) return '';

  return `
    [화자 설정] ${role.label}: ${role.prompt}
    [어조 설정] ${tone.label}: ${tone.prompt}
    [문체 설정] ${style.label}: ${style.prompt}
  `;
}

/**
 * 톤 설정에서 비주얼 프롬프트 생성
 */
export function getToneVisualPrompt(toneSettings: ToneSettings): string {
  const role = TONE_FACTORS.roles.find(r => r.id === toneSettings.role);
  const tone = TONE_FACTORS.tones.find(t => t.id === toneSettings.tone);

  if (!role || !tone) return '';

  return `${role.visual}, ${tone.visual}`;
}

