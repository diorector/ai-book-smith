import { TONE_FACTORS, type ToneSettings } from '@/constants/toneFactors';
import type { CustomStyle } from '@/types/project';

/**
 * 톤 설정에서 텍스트 프롬프트 생성
 * @param toneSettings 톤 설정
 * @param customStyle 선택된 커스텀 스타일 (있는 경우)
 */
export function getTonePrompt(toneSettings: ToneSettings, customStyle?: CustomStyle | null): string {
  const role = TONE_FACTORS.roles.find(r => r.id === toneSettings.role);
  const tone = TONE_FACTORS.tones.find(t => t.id === toneSettings.tone);
  const style = TONE_FACTORS.styles.find(s => s.id === toneSettings.style);
  const authorPreset = TONE_FACTORS.authorPresets.find(a => a.id === toneSettings.authorPreset);
  const difficulty = TONE_FACTORS.difficultyLevels.find(d => d.id === toneSettings.difficulty);

  if (!role || !tone || !style) return '';

  let prompt = `
    [화자 설정] ${role.label}: ${role.prompt}
    [어조 설정] ${tone.label}: ${tone.prompt}
    [문체 설정] ${style.label}: ${style.prompt}
  `;

  // 커스텀 스타일이 선택된 경우 (최우선)
  if (customStyle && customStyle.prompt) {
    prompt = `
    [사용자 정의 문체 - 최우선 적용] "${customStyle.name}"
    ${customStyle.prompt}
    
    특징 키워드: ${customStyle.analysis.tags.join(', ')}
    `;
  }
  // 작가 프리셋이 선택된 경우
  else if (authorPreset && authorPreset.id !== 'none' && authorPreset.prompt) {
    prompt = `
    [작가 문체 프리셋 - 최우선 적용] ${authorPreset.label}
    ${authorPreset.prompt}
    
    위 작가의 문체를 기반으로 하되, 아래 설정을 보조적으로 참고하세요:
    [화자 설정] ${role.label}: ${role.prompt}
    [어조 설정] ${tone.label}: ${tone.prompt}
    [문체 설정] ${style.label}: ${style.prompt}
    `;
  }

  // 난이도 설정 추가
  if (difficulty && difficulty.prompt) {
    prompt += `\n    [글 난이도] ${difficulty.label}: ${difficulty.prompt}`;
  }

  return prompt;
}


