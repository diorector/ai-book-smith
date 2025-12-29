export const TONE_FACTORS = {
  roles: [
    { id: 'mentor', label: '멘토 (Mentor)', desc: '지혜롭고 성숙한 조언자', prompt: '인생의 깊은 통찰을 가진 멘토로서 서술하세요.', visual: 'Wise, serene, library background' },
    { id: 'friend', label: '친구 (Friend)', desc: '솔직하고 공감하는 동료', prompt: '같은 눈높이에서 공감하는 친근한 친구로서 서술하세요.', visual: 'Casual, warm, vibrant colors' },
    { id: 'analyst', label: '분석가 (Analyst)', desc: '논리적이고 객관적인 전문가', prompt: '데이터와 논리에 기반한 냉철한 전문가로서 서술하세요.', visual: 'Geometric, abstract, clean lines' },
    { id: 'storyteller', label: '작가 (Storyteller)', desc: '감성적이고 문학적인 서술자', prompt: '풍부한 묘사와 감성을 가진 에세이스트로서 서술하세요.', visual: 'Artistic, watercolor, dreamy' },
    { id: 'coach', label: '코치 (Coach)', desc: '행동을 촉구하는 동기부여가', prompt: '독자의 행동 변화를 강력하게 촉구하는 코치로서 서술하세요.', visual: 'Energetic, bold, sports arena atmosphere' },
    { id: 'philosopher', label: '철학자 (Philosopher)', desc: '본질을 탐구하는 사상가', prompt: '현상의 이면과 본질을 깊이 있게 탐구하는 철학자로서 서술하세요.', visual: 'Deep focus, minimal, starry night' },
    { id: 'journalist', label: '기자 (Journalist)', desc: '사실을 전달하는 관찰자', prompt: '객관적인 사실과 현상을 명료하게 전달하는 기자로서 서술하세요.', visual: 'Newsroom, typewriter, black and white photography' },
    { id: 'debater', label: '논객 (Debater)', desc: '통념에 도전하는 비평가', prompt: '기존 통념에 도전하고 새로운 관점을 제시하는 논객으로서 서술하세요.', visual: 'Podium, spotlight, sharp angles' }
  ],
  tones: [
    { id: 'warm', label: '따뜻한 (Warm)', desc: '위로와 격려', prompt: '어조는 부드럽고 따뜻하며, 독자를 포용하는 태도를 유지하세요.', visual: 'Warm lighting, soft focus, orange and yellow tones' },
    { id: 'critical', label: '비판적 (Critical)', desc: '날카로운 지적', prompt: '어조는 날카롭고 비판적이며, 문제의 본질을 꿰뚫는 태도를 유지하세요.', visual: 'High contrast, cool blue tones, sharp shadows' },
    { id: 'witty', label: '유머러스 (Witty)', desc: '재치와 풍자', prompt: '어조는 유머러스하고 재치가 넘치며, 지루하지 않게 서술하세요.', visual: 'Pop art style, playful elements' },
    { id: 'passionate', label: '열정적 (Passionate)', desc: '강력한 동기부여', prompt: '어조는 열정적이고 힘이 넘치며, 독자를 고무시키는 태도를 유지하세요.', visual: 'Dynamic composition, intense colors' },
    { id: 'calm', label: '차분한 (Calm)', desc: '평온하고 안정적인', prompt: '어조는 차분하고 안정적이며, 독자에게 평온함을 주는 태도를 유지하세요.', visual: 'Minimalist, pastel tones, nature' },
    { id: 'cynical', label: '냉소적 (Cynical)', desc: '회의적이고 풍자적인', prompt: '어조는 다소 냉소적이고 회의적이며, 현실의 부조리를 꼬집는 태도를 유지하세요.', visual: 'Noir style, shadows, muted colors' },
    { id: 'urgent', label: '절박한 (Urgent)', desc: '시급하고 중요한', prompt: '어조는 시급하고 중요하며, 독자의 즉각적인 주의를 요하는 태도를 유지하세요.', visual: 'Red accents, motion blur, alarm' },
    { id: 'nostalgic', label: '회고적 (Nostalgic)', desc: '그리움과 추억', prompt: '어조는 지나간 시절을 그리워하며, 아련한 감성을 자극하는 태도를 유지하세요.', visual: 'Sepia tones, grain, vintage texture' }
  ],
  styles: [
    { id: 'concise', label: '간결체 (Concise)', desc: '짧고 명확한 문장', prompt: '문체는 군더더기 없이 간결하고 명확하게 작성하세요.' },
    { id: 'descriptive', label: '만연체 (Detailed)', desc: '화려하고 상세한 묘사', prompt: '문체는 수식어가 풍부하고 호흡이 긴 만연체로 작성하세요.' },
    { id: 'conversational', label: '구어체 (Spoken)', desc: '말하듯 자연스럽게', prompt: '문체는 실제 대화하듯이 자연스러운 구어체(해요체)를 사용하세요.' },
    { id: 'formal', label: '문어체 (Formal)', desc: '격식 있고 정제된', prompt: '문체는 격식 있고 무게감 있는 문어체(하십시오체/하라체)를 사용하세요.' },
    { id: 'persuasive', label: '설득조 (Persuasive)', desc: '논리적이고 호소력 짙은', prompt: '문체는 독자를 설득하기 위해 논리적이고 호소력 짙은 표현을 사용하세요.' },
    { id: 'didactic', label: '교훈조 (Didactic)', desc: '가르치고 설명하는', prompt: '문체는 독자를 가르치고 이해시키기 위해 친절하고 상세하게 설명하는 방식을 사용하세요.' },
    { id: 'lyrical', label: '서정적 (Lyrical)', desc: '시적이고 운율감 있는', prompt: '문체는 시적 허용과 비유를 적극 활용하여 운율감 있게 작성하세요.' },
    { id: 'dry', label: '건조체 (Dry)', desc: '감정을 배제한 사실 나열', prompt: '문체는 감정적 수식을 철저히 배제하고, 사실 위주로 건조하게 작성하세요.' }
  ]
} as const;

export type ToneRole = typeof TONE_FACTORS.roles[number]['id'];
export type ToneTone = typeof TONE_FACTORS.tones[number]['id'];
export type ToneStyle = typeof TONE_FACTORS.styles[number]['id'];

export interface ToneSettings {
  role: ToneRole;
  tone: ToneTone;
  style: ToneStyle;
}

