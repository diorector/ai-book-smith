// ============================================================
// 톤앤매너 설정 (MECE하게 정리)
// ============================================================

// 작가 프리셋 - 미리보기 문장 포함
export const AUTHOR_PRESETS = [
  { 
    id: 'none', 
    label: '직접 설정', 
    desc: '아래 옵션을 직접 조합', 
    prompt: '', 
    featured: true,
    samplePreview: '고객의 신뢰를 구축하는 것이 중요하다.',
  },
  { 
    id: 'kimyoojin', 
    label: '김유진', 
    desc: '직설적 · 실용적 · 쉬운 표현', 
    prompt: '김유진의 문체로 작성하세요: 극도로 직설적이고 실용적인 표현을 사용합니다. 자영업자와 소상공인이 바로 이해할 수 있는 쉬운 단어와 짧은 문장을 사용하고, 이론보다 실제 사례와 행동 지침을 중심으로 서술합니다. 독자를 "당신"이라 부르며 1:1 대화하듯 친근하게 조언합니다.', 
    featured: true,
    samplePreview: '장사 잘되려면? 손님이 믿어야 해요. 복잡하게 생각하지 마세요. 믿음 = 재방문입니다.',
  },
  { 
    id: 'gladwell', 
    label: '말콤 글래드웰', 
    desc: '스토리텔링 · 반전 · 일화', 
    prompt: '말콤 글래드웰의 문체로 작성하세요: 흥미로운 일화로 시작해 독자를 끌어들인 뒤, 예상치 못한 통찰로 반전을 줍니다. 학술 연구를 대중이 이해할 수 있는 스토리로 풀어내고, "우리가 알고 있던 것이 틀렸다"는 식의 도발적 구조를 사용합니다.', 
    featured: true,
    samplePreview: '1998년, 무명의 커피숍 점원이 있었습니다. 그녀는 단 한 가지만 다르게 했습니다. 손님의 이름을 기억한 것이죠. 10년 후, 그녀는 스타벅스의 부사장이 됩니다.',
  },
  { 
    id: 'alain', 
    label: '알랭 드 보통', 
    desc: '철학적 사색 · 따뜻한 위안', 
    prompt: '알랭 드 보통의 문체로 작성하세요: 일상 속에서 철학적 의미를 발견하고, 독자에게 위안과 통찰을 동시에 제공합니다. 부드럽고 지적인 어조로 삶의 불안과 고민을 다루며, 예술과 문학을 자연스럽게 인용합니다. 독자를 판단하지 않고 이해하려는 따뜻한 태도를 유지합니다.', 
    featured: true,
    samplePreview: '신뢰란 결국 우리가 타인에게 상처받을 수 있음을 인정하면서도, 기꺼이 그 가능성을 감수하겠다는 조용한 용기일지 모릅니다.',
  },
  { 
    id: 'sinek', 
    label: '사이먼 시넥', 
    desc: 'WHY로 시작 · 리더십 · 명료함', 
    prompt: '사이먼 시넥의 문체로 작성하세요: 항상 "왜(WHY)"에서 시작하여 "어떻게(HOW)", "무엇(WHAT)" 순으로 설명합니다. 리더십과 목적의식을 강조하고, 청중의 심장을 울리는 단순하고 강력한 메시지를 전달합니다. 반복과 리듬감 있는 문장 구조를 사용합니다.',
    featured: true,
    samplePreview: '사람들은 당신이 무엇을 하는지에 돈을 내지 않습니다. 왜 하는지에 돈을 냅니다. 고객의 신뢰? 그건 당신의 "왜"에서 시작됩니다.',
  },
  { 
    id: 'clear', 
    label: '제임스 클리어', 
    desc: '실용적 조언 · 1% 개선 · 시스템', 
    prompt: '제임스 클리어의 문체로 작성하세요: 복잡한 개념을 작고 실행 가능한 단위로 쪼갭니다. "1%씩 개선"이라는 철학으로 목표보다 시스템을 강조하고, 구체적인 예시와 과학적 근거를 바탕으로 설명합니다. 깔끔하고 실용적인 문장을 사용합니다.',
    featured: false,
    samplePreview: '신뢰는 하루아침에 만들어지지 않습니다. 매일 1%씩. 약속을 지키고, 응답 시간을 줄이고, 기대보다 조금 더 주세요. 365일 후, 당신은 37배 더 신뢰받습니다.',
  },
  { 
    id: 'yuval', 
    label: '유발 하라리', 
    desc: '거시적 역사 · 도발적 질문', 
    prompt: '유발 하라리의 문체로 작성하세요: 거시적 역사 관점에서 현상을 분석하고, 인류 전체의 맥락에서 통찰을 제시하며, 독자에게 도발적인 질문을 던지는 방식으로 서술합니다. 복잡한 개념을 명확한 비유로 설명하고, "왜?"라는 근본적 물음을 끊임없이 제기합니다.', 
    featured: false,
    samplePreview: '7만 년 전, 사피엔스는 낯선 무리와 협력하기 위해 "신뢰"라는 허구를 발명했습니다. 오늘날 당신의 브랜드도 마찬가지입니다. 고객이 믿는 건 제품이 아니라 이야기입니다.',
  },
  { 
    id: 'haruki', 
    label: '무라카미 하루키', 
    desc: '담담한 1인칭 · 감각적 디테일', 
    prompt: '무라카미 하루키의 문체로 작성하세요: 담담하고 건조한 1인칭 시점으로 서술하며, 일상적 장면에서 초현실적 분위기를 자아냅니다. 음악, 음식, 술 같은 감각적 디테일을 섬세하게 묘사하고, 독특한 비유와 은유를 사용합니다. 결론을 서두르지 않고 여백을 남깁니다.', 
    featured: false,
    samplePreview: '그날도 평소처럼 손님은 거의 없었다. 나는 카운터에서 재즈를 틀고 맥주를 마시고 있었다. 신뢰라는 건, 어쩌면 오래된 레코드판 같은 것인지도 모른다.',
  },
  { 
    id: 'nassim', 
    label: '나심 탈레브', 
    desc: '도발적 비판 · 반권위적', 
    prompt: '나심 탈레브의 문체로 작성하세요: 기존 권위와 전문가에 대해 도발적으로 비판하며, 불확실성과 리스크에 대한 통찰을 날카롭게 제시합니다. 자신감 넘치고 때로는 거만해 보일 정도로 단정적인 어조를 사용하고, 고전 인용을 즐깁니다.', 
    featured: false,
    samplePreview: '컨설턴트들은 "신뢰 구축"을 가르칩니다. 웃기는 일이죠. 신뢰는 구축하는 게 아닙니다. 위기에서 살아남아야 증명되는 겁니다. 스킨 인 더 게임.',
  },
  {
    id: 'dobelli',
    label: '롤프 도벨리',
    desc: '명료한 사고 · 인지편향 · 실용',
    prompt: '롤프 도벨리의 문체로 작성하세요: 복잡한 심리학과 철학 개념을 짧고 명료한 에세이로 풀어냅니다. 각 챕터는 독립적이고, 핵심 메시지가 명확합니다. 인지 편향과 오류를 지적하며, 독자가 더 나은 결정을 내리도록 돕는 실용적 조언을 제공합니다.',
    featured: false,
    samplePreview: '우리는 한 번 신뢰한 사람을 계속 신뢰하려 합니다(확증 편향). 하지만 고객은 다릅니다. 그들은 매 순간 당신을 재평가합니다. 착각하지 마세요.',
  },
  {
    id: 'jaeseung',
    label: '정재승',
    desc: '뇌과학 · 유쾌한 설명 · 호기심',
    prompt: '정재승의 문체로 작성하세요: 과학적 사실을 일상의 언어로 유쾌하게 풀어냅니다. "왜 그럴까요?"라는 질문으로 호기심을 자극하고, 뇌과학/심리학 연구 결과를 친근한 예시와 함께 설명합니다. 학술적이면서도 재미있는 균형을 유지합니다.',
    featured: false,
    samplePreview: '뇌는 불확실성을 싫어합니다. 고객의 뇌가 "이 사람 믿어도 되나?"라고 물으면, 당신의 일관된 행동이 "응, 괜찮아"라고 대답해줘야 해요.',
  },
  {
    id: 'brene',
    label: '브레네 브라운',
    desc: '취약함 · 용기 · 진정성',
    prompt: '브레네 브라운의 문체로 작성하세요: 취약함과 용기의 연결을 강조하며, 개인적인 이야기와 연구 데이터를 함께 엮습니다. 수치심과 두려움을 정면으로 다루면서도 희망적인 메시지를 전달합니다. 따뜻하지만 강단 있는 어조를 유지합니다.',
    featured: false,
    samplePreview: '신뢰를 원하세요? 먼저 취약해지세요. "모르겠어요"라고 말하는 용기, 실수를 인정하는 용기. 완벽함은 연결을 만들지 못합니다.',
  },
] as const;

// 프리셋별 추천 설정 매핑
export const PRESET_DEFAULTS: Record<string, { role: string; tone: string; style: string; difficulty: number }> = {
  none: { role: 'mentor', tone: 'warm', style: 'concise', difficulty: 3 },
  kimyoojin: { role: 'friend', tone: 'direct', style: 'casual', difficulty: 2 },
  gladwell: { role: 'storyteller', tone: 'curious', style: 'narrative', difficulty: 3 },
  alain: { role: 'mentor', tone: 'warm', style: 'literary', difficulty: 3 },
  sinek: { role: 'mentor', tone: 'passionate', style: 'concise', difficulty: 2 },
  clear: { role: 'expert', tone: 'direct', style: 'concise', difficulty: 2 },
  yuval: { role: 'expert', tone: 'provocative', style: 'formal', difficulty: 4 },
  haruki: { role: 'storyteller', tone: 'calm', style: 'literary', difficulty: 3 },
  nassim: { role: 'expert', tone: 'provocative', style: 'formal', difficulty: 4 },
  dobelli: { role: 'mentor', tone: 'direct', style: 'concise', difficulty: 3 },
  jaeseung: { role: 'friend', tone: 'curious', style: 'casual', difficulty: 2 },
  brene: { role: 'mentor', tone: 'warm', style: 'narrative', difficulty: 2 },
};

// 스타일 DNA (시각화용)
export const STYLE_DNA: Record<string, { conciseness: number; formality: number; emotionality: number; directness: number; tags: string[] }> = {
  none: { conciseness: 50, formality: 50, emotionality: 50, directness: 50, tags: ['#균형잡힌', '#중립적'] },
  kimyoojin: { conciseness: 85, formality: 15, emotionality: 40, directness: 95, tags: ['#직설적', '#실용', '#친근'] },
  gladwell: { conciseness: 40, formality: 50, emotionality: 70, directness: 30, tags: ['#스토리', '#반전', '#일화'] },
  alain: { conciseness: 35, formality: 45, emotionality: 85, directness: 40, tags: ['#철학적', '#사색', '#위안'] },
  sinek: { conciseness: 75, formality: 55, emotionality: 80, directness: 70, tags: ['#WHY', '#리더십', '#명료'] },
  clear: { conciseness: 90, formality: 40, emotionality: 30, directness: 85, tags: ['#1%', '#시스템', '#실용'] },
  yuval: { conciseness: 45, formality: 75, emotionality: 25, directness: 55, tags: ['#거시적', '#역사', '#도발'] },
  haruki: { conciseness: 55, formality: 50, emotionality: 75, directness: 25, tags: ['#담담함', '#감각적', '#여백'] },
  nassim: { conciseness: 60, formality: 70, emotionality: 20, directness: 90, tags: ['#도발', '#반권위', '#날카로움'] },
  dobelli: { conciseness: 85, formality: 55, emotionality: 25, directness: 80, tags: ['#명료', '#편향', '#실용'] },
  jaeseung: { conciseness: 65, formality: 35, emotionality: 60, directness: 65, tags: ['#뇌과학', '#유쾌', '#호기심'] },
  brene: { conciseness: 55, formality: 40, emotionality: 90, directness: 75, tags: ['#취약함', '#용기', '#진정성'] },
};

// ============================================================
// 화자 (페르소나) - MECE하게 4개
// ============================================================
const ROLES = [
  { 
    id: 'mentor', 
    label: '멘토', 
    desc: '경험에서 우러나온 지혜로 이끌어주는 조언자', 
    prompt: '인생의 깊은 통찰을 가진 멘토로서, 따뜻하게 조언하듯 서술하세요.',
  },
  { 
    id: 'friend', 
    label: '친구', 
    desc: '같은 눈높이에서 공감하며 대화하는 동료', 
    prompt: '친한 친구처럼 편하게 대화하듯, 솔직하고 친근하게 서술하세요.',
  },
  { 
    id: 'expert', 
    label: '전문가', 
    desc: '객관적 근거와 데이터로 설명하는 권위자', 
    prompt: '해당 분야의 전문가로서, 근거에 기반해 신뢰감 있게 서술하세요.',
  },
  { 
    id: 'storyteller', 
    label: '이야기꾼', 
    desc: '생생한 묘사와 서사로 풀어내는 작가', 
    prompt: '이야기를 들려주듯, 장면과 감정을 생생하게 묘사하며 서술하세요.',
  },
] as const;

// ============================================================
// 어조 (감정적 뉘앙스) - MECE하게 6개
// ============================================================
const TONES = [
  { 
    id: 'warm', 
    label: '따뜻한', 
    desc: '공감하고 격려하는 포용적인 태도', 
    prompt: '독자를 이해하고 포용하는 따뜻한 어조를 유지하세요.',
  },
  { 
    id: 'direct', 
    label: '직설적', 
    desc: '핵심을 바로 말하는 솔직한 태도', 
    prompt: '돌려말하지 않고 핵심을 직접적으로 전달하세요.',
  },
  { 
    id: 'curious', 
    label: '호기심', 
    desc: '질문을 던지며 함께 탐구하는 태도', 
    prompt: '"왜 그럴까요?"처럼 질문을 던지며 호기심을 자극하세요.',
  },
  { 
    id: 'calm', 
    label: '차분한', 
    desc: '조용하고 안정감 있는 담담한 태도', 
    prompt: '감정적으로 흔들리지 않고 차분하게 서술하세요.',
  },
  { 
    id: 'passionate', 
    label: '열정적', 
    desc: '강한 확신과 동기부여를 전달하는 태도', 
    prompt: '열정과 확신을 담아 독자를 고무시키세요.',
  },
  { 
    id: 'provocative', 
    label: '도발적', 
    desc: '통념에 도전하고 날카롭게 질문하는 태도', 
    prompt: '기존 상식에 도전하는 날카로운 시각을 유지하세요.',
  },
] as const;

// ============================================================
// 문체 (문장 구조) - MECE하게 6개
// ============================================================
const STYLES = [
  { 
    id: 'concise', 
    label: '간결체', 
    desc: '군더더기 없는 짧고 명확한 문장', 
    prompt: '한 문장에 하나의 생각만. 군더더기 없이 간결하게 작성하세요.',
  },
  { 
    id: 'narrative', 
    label: '서사체', 
    desc: '이야기 구조로 풀어가는 문장', 
    prompt: '시작-전개-결말 구조로 이야기를 들려주듯 서술하세요.',
  },
  { 
    id: 'casual', 
    label: '구어체', 
    desc: '말하듯 자연스러운 대화형 문장', 
    prompt: '실제로 말하듯 자연스럽게, "~해요" 체로 친근하게 작성하세요.',
  },
  { 
    id: 'formal', 
    label: '문어체', 
    desc: '격식 있고 정제된 문장', 
    prompt: '"~합니다/~입니다" 체로 격식 있고 무게감 있게 작성하세요.',
  },
  { 
    id: 'literary', 
    label: '문학체', 
    desc: '비유와 은유가 풍부한 시적 문장', 
    prompt: '비유와 은유를 적극 활용해 문학적 깊이를 더하세요.',
  },
  { 
    id: 'analytical', 
    label: '분석체', 
    desc: '논리적 구조로 설명하는 문장', 
    prompt: '"첫째, 둘째" 혹은 "왜냐하면"처럼 논리 구조를 명확히 드러내세요.',
  },
] as const;

// ============================================================
// 난이도 레벨
// ============================================================
const DIFFICULTY_LEVELS = [
  { id: 1, label: '매우 쉬움', desc: '초등학생도 OK', prompt: '난이도: 매우 쉬움. 초등학생도 이해할 수 있도록 작성하세요. 3음절 이하의 쉬운 단어만 사용하고, 한 문장은 15단어 이내로 짧게 끊으세요. 전문 용어는 절대 사용하지 마세요.' },
  { id: 2, label: '쉬움', desc: '일반 대중', prompt: '난이도: 쉬움. 자영업자와 일반 대중이 편하게 읽을 수 있도록 작성하세요. 한자어보다 순우리말을 우선하고, 문장은 20단어 이내로 유지하세요. 전문 용어가 필요하면 바로 옆에 쉬운 설명을 붙이세요.' },
  { id: 3, label: '보통', desc: '대학생/직장인', prompt: '난이도: 보통. 대학생과 직장인이 편하게 읽을 수 있는 수준으로 작성하세요. 적절한 전문 용어 사용이 허용되며, 논리적 구조를 갖추되 지나치게 학술적이지 않게 유지하세요.' },
  { id: 4, label: '어려움', desc: '전문가 대상', prompt: '난이도: 어려움. 전문가와 학술적 독자를 대상으로 작성하세요. 정확한 전문 용어를 사용하고, 복잡한 개념도 단순화하지 않고 그대로 다루세요. 논리적 엄밀성을 중시하세요.' },
  { id: 5, label: '매우 어려움', desc: '학술 논문 수준', prompt: '난이도: 매우 어려움. 학술 논문 수준의 엄밀함으로 작성하세요. 전문 용어, 복잡한 문장 구조, 학술적 인용 형식을 사용하세요.' },
] as const;

// ============================================================
// TONE_FACTORS 통합 export
// ============================================================
export const TONE_FACTORS = {
  authorPresets: AUTHOR_PRESETS,
  difficultyLevels: DIFFICULTY_LEVELS,
  roles: ROLES,
  tones: TONES,
  styles: STYLES,
} as const;

// ============================================================
// 타입 정의
// ============================================================
export type ToneRole = typeof ROLES[number]['id'];
export type ToneTone = typeof TONES[number]['id'];
export type ToneStyle = typeof STYLES[number]['id'];
export type AuthorPreset = typeof AUTHOR_PRESETS[number]['id'];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]['id'];

export interface ToneSettings {
  role: ToneRole;
  tone: ToneTone;
  style: ToneStyle;
  authorPreset: AuthorPreset;
  difficulty: DifficultyLevel;
}
