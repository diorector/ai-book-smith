// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Send, Edit3, CheckCircle, FileText, Download, Cpu, Loader2, Settings, ChevronRight, ChevronDown, RefreshCw, Layers, User, Printer, File, Image as ImageIcon, Wand2, X, Sparkles, Trash2, Palette, Save, PlusCircle, Sliders } from 'lucide-react';
import ToneSelector from '@/components/ToneSelector';
import { deleteProjectState, getProjectState, migrateLocalStorageProjectStateIfNeeded, setProjectState } from '@/lib/projectStorage';

// --- Constants & Options ---

const THEMES = {
  midnight: {
    name: 'Midnight',
    bg: 'bg-slate-900',
    text: 'text-slate-100',
    panel: 'bg-slate-800',
    border: 'border-slate-700',
    input: 'bg-slate-800 text-slate-100',
    accent: 'text-indigo-400',
    button: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    previewBg: 'bg-white',
    previewText: 'text-slate-900'
  },
  paper: {
    name: 'Paper',
    bg: 'bg-stone-100',
    text: 'text-stone-800',
    panel: 'bg-white',
    border: 'border-stone-300',
    input: 'bg-stone-50',
    accent: 'text-orange-600',
    button: 'bg-orange-600 hover:bg-orange-500',
    previewBg: 'bg-white',
    previewText: 'text-stone-900'
  },
  coffee: {
    name: 'Coffee',
    bg: 'bg-[#F5F1E8]',
    text: 'text-[#4A3B32]',
    panel: 'bg-[#EBE5CE]',
    border: 'border-[#D4C5A9]',
    input: 'bg-[#F5F1E8]',
    accent: 'text-[#8C6B5D]',
    button: 'bg-[#8C6B5D] hover:bg-[#7A5A4C] text-white',
    previewBg: 'bg-[#FAF7F0]',
    previewText: 'text-[#5C4B41]'
  },
  deepSpace: {
    name: 'Deep Space',
    bg: 'bg-black',
    text: 'text-gray-200',
    panel: 'bg-gray-900',
    border: 'border-gray-800',
    input: 'bg-gray-900 text-gray-200',
    accent: 'text-cyan-400',
    button: 'bg-cyan-700 hover:bg-cyan-600 text-white',
    previewBg: 'bg-gray-100',
    previewText: 'text-black'
  }
};

// New Granular Tone Factors
const TONE_FACTORS = {
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
};

const SYSTEM_PROMPTS = {
  interviewer: (tonePrompt: string) => `
  당신은 전문 출판 기획자입니다. 
  [중요: 절대 사용자 역할을 대신하여 답변을 지어내지 마세요. 오직 당신의 질문만 출력하고 멈추세요.] 
  [현재 설정된 집필 톤앤매너]
  ${tonePrompt}
  
  사용자와의 대화를 통해 책의 기획을 구체화하세요. 다음 핵심 요소들을 반드시 확인해야 합니다:
  1. **주제 및 기획 의도**: 무엇을, 왜 쓰려고 하는가?
  2. **타겟 독자 및 난이도**: 누가 읽는가? (입문자/중급자/전문가)
  3. **책의 목표**: 독자에게 어떤 변화를 주고 싶은가? (정보/설득/감동/재미)
  4. **차별점(USP)**: 기존 도서와 무엇이 다른가?
  5. **구성 방식**: 이론 중심인가, 사례 중심인가? (스토리텔링, Q&A 등)

  [질문 가이드라인]
  - **객관식 보기 제공:** 사용자가 고민하지 않고 쉽게 고를 수 있도록, 질문마다 **3~4개의 매력적인 선택지(번호)**를 함께 제시하세요.
  - **주관식 허용:** "물론 직접 자유롭게 적어주셔도 됩니다"라고 덧붙여 열린 답변도 유도하세요.
  - **친절한 리드:** 사용자의 짧은 답변도 찰떡같이 알아듣고 구체화해서 정리해주세요.

  사용자가 충분히 답변하여 위 요소들이 모두 명확해졌다고 판단되면, 대화 끝에 "[READY_FOR_OUTLINE]" 태그를 붙이세요.
  답변할 때는 가독성을 위해 단락을 나누고, 중요한 키워드는 **굵게** 표시하며, 번호 매기기나 소제목(###)을 적극 활용하세요.
  비교나 정리가 필요한 내용은 마크다운 표(| Header | Header |)를 사용하여 보여주세요.
  `,

  architect: `당신은 대하 소설이나 전문 서적을 집필하는 구조 설계자입니다.
  단행본 1권 분량(약 10만 자 이상)을 확보하기 위해, 목차를 반드시 '2단계(Chapter -> Subsection)'로 아주 상세하게 쪼개야 합니다.
  
  [필수 조건]
  1. Chapter는 7~10개 내외로 구성.
  2. **각 Chapter마다 반드시 5~8개의 Subsection(소주제)을 포함할 것.** (분량 확보를 위한 핵심 장치)
  3. 각 Subsection은 독립적인 에세이나 칼럼 한 편 분량이 나올 수 있도록 구체적인 'detail'을 포함해야 함.

  Output Format (JSON only):
  {
    "title": "책 제목",
    "target_audience": "타겟 독자",
    "concept": "컨셉",
    "keywords": ["핵심 키워드1", "핵심 키워드2", ...],
    "chapters": [
      {
        "chapter_number": 1,
        "title": "챕터 제목",
        "subsections": [
          {
            "sub_number": 1,
            "title": "소제목 (예: 욕망의 삼각형과 나)",
            "detail": "이 소제목에서 다룰 구체적 사건, 예시, 논리 전개 방향 (상세히)"
          },
          ...
        ]
      },
      ...
    ]
  }`,

  outlineModifier: `
  당신은 편집장입니다. 사용자의 요청에 따라 책의 특정 챕터나 소제목의 내용을 수정해야 합니다.
  입력받은 JSON 구조의 일부를 수정하여, **수정된 해당 부분의 JSON 객체만** 반환하세요.
  `,

  writer: (bookInfo: any, chapter: any, subsection: any, prevContext: string, tonePrompt: string, bookSummary: string = "") => `
  당신은 베스트셀러 작가입니다.

  [책 정보]
  - 제목: ${bookInfo.title}
  - 챕터: ${chapter.chapter_number}. ${chapter.title}

  - 챕터 개요: ${chapter.subsections.map((s, i) => `${i+1}. ${s.title}`).join(', ')}
  - 핵심 키워드: ${bookInfo.keywords?.join(', ') || ''}

  ${bookSummary ? `[책 전체 핵심 요약]\n${bookSummary}\n\n` : ''} 

  [톤앤매너 지침]
  ${tonePrompt}
  
  [현재 집필 구간]
  - 소제목: ${chapter.chapter_number}-${subsection.sub_number}. ${subsection.title}
  - 가이드: ${subsection.detail}
  
  [이전 내용 맥락]
  ${prevContext ? `(직전 섹션 마지막 문단): ...${prevContext}` : '(챕터의 시작입니다)'}

  [집필 필수 규칙 - 매우 중요]
  1. **목표 분량: 공백 포함 2,000자 이상.** 하지만 같은 말을 반복해서 늘리지 말고, 반드시 '새 정보/새 사례/새 관점'으로 분량을 채우세요.
     - 분량이 부족하면: (a) 구체 사례 1개 추가 (b) 체크리스트/프레임워크 1개 추가 (c) 흔한 오해/반론과 반박 1개 추가 중에서 선택하세요.
     - 금지: 앞 문단을 다른 말로 다시 말하기, 결론을 여러 번 되풀이하기, “결국/요컨대/다시 말해”의 남발.
  2. **챕터 내 일관성:** 이 챕터의 다른 섹션들(${chapter.subsections.filter(s => s.sub_number !== subsection.sub_number).map(s => s.title).join(', ')})과 논리적으로 이어지도록 작성하세요.
  3. **사족(Meta-text) 절대 금지:** 글의 시작이나 끝에 "[2000자 충족함]", "(현재 분량: ...)", "다음 챕터에서는...", "이상으로..." 같은 시스템 메시지나 작가의 말을 절대 포함하지 마세요. **오직 순수한 원고 본문만 출력하세요.**
  4. **LaTeX 수식 금지:** $$...$$나 \\text{} 같은 수식 코드를 절대 사용하지 마세요. 모든 수식이나 도식은 '글(텍스트)'로 풀어서 설명하세요.
  5. **코드 블록 금지:** 원고 본문에는 \`\`\` 사용 금지. 단, 맨 마지막에 FACTS_JSON 블록 1개만 예외로 허용됩니다.
  6. Markdown 형식을 사용하되, 최상위 제목(#)은 쓰지 마세요. 소제목은 ###를 사용하세요.
  7. **용어 통일:** 핵심 키워드는 반드시 원래 용어를 그대로 사용하고, 동의어나 다른 표현으로 바꾸지 마세요.

  [팩트체크 출력 - 반드시 포함]
  - 원고 본문을 모두 출력한 뒤, 맨 마지막에 아래 코드 펜스를 **그대로** 붙이세요.
  - claims에는 “검색/검증이 필요한 단정적 사실 주장”만 담으세요. (숫자/연도/인용/연구결과/법·제도/특정 인물·기관·사건 등)
  - 확신이 없으면 confidence를 낮추고, 본문 표현도 단정 대신 완화(가능하다/경향이 있다)하세요.
  
  \`\`\`FACTS_JSON
  {
    "claims": [
      { "claim": "검증이 필요한 주장(원문 그대로)", "confidence": "low|medium|high", "suggested_query": "검색어(한 줄)", "note": "왜 검증이 필요한지/어떤 부분이 불확실한지" }
    ]
  }
  \`\`\`
  `,

  editor: (originalText: string, instruction: string, tonePrompt: string) => `
  당신은 전문 교정 교열자이자 윤문 전문가입니다.
  
  [톤앤매너 지침]
  ${tonePrompt}

  [수정 지침]
  ${instruction}

  [원본 텍스트]
  ${originalText}

  [임무]
  위 원본 텍스트를 수정 지침에 맞게 다시 작성하세요. 
  Markdown 형식을 유지하세요. 
  **절대 LaTeX 수식($$..$$)을 사용하지 마세요.** 텍스트로 풀어 쓰세요.
  오직 수정된 본문만 출력하세요. (사족 금지)
  `
  ,

  feedbackCoach: (tonePrompt: string) => `
  당신은 '책 집필 피드백을 정리해주는 편집자'입니다.
  사용자는 이미 샘플 원고(서문+1~2챕터)를 보고 있으며, 이제 나머지 집필 전에 피드백을 대화로 주고받고 싶어 합니다.

  [목표]
  - 사용자의 피드백을 '나머지 원고에 적용 가능한 지침'으로 구체화합니다.
  - 모호하면 1~2개의 짧은 확인 질문을 합니다.

  [현재 톤앤매너 설정]
  ${tonePrompt}

  [대화 규칙]
  - 너무 길게 쓰지 말고, 질문은 최대 2개.
  - 사용자의 요구를 3~6개의 불릿으로 정리해 주세요.
  - 마지막에는 항상 아래 포맷으로 '초안 지침'을 포함하세요.

  [출력 포맷 - 반드시 포함]
  <DRAFT_FEEDBACK>
  - ...
  </DRAFT_FEEDBACK>
  `,
};

// Helper to load external scripts dynamically
const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(undefined);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(undefined);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

export default function BookSmithAI() {
  const [step, setStep] = useState('interview');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);

  const [polishProgress, setPolishProgress] = useState({ current: 0, total: 0 });
  const [polishStatus, setPolishStatus] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const writingAbortRef = useRef<AbortController | null>(null);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
  const [showPersonaChat, setShowPersonaChat] = useState(false);
  const [personaChatMessages, setPersonaChatMessages] = useState<{ role: string, content: string }[]>([]);
  const [personaChatInput, setPersonaChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('coffee');

  // Theme Styles
  const theme = THEMES[currentTheme];

  // Interview & Persona
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "안녕하세요! 어떤 책을 쓰고 싶으신가요? 책의 주제나 키워드를 알려주세요." }
  ]);
  const [input, setInput] = useState('');
  const [readyForOutline, setReadyForOutline] = useState(false);

  // Granular Tone State
  const [toneSettings, setToneSettings] = useState({
    role: 'mentor',
    tone: 'warm',
    style: 'concise'
  });
  const [showToneSelector, setShowToneSelector] = useState(true); // Initially true for interview
  const [isToneModalOpen, setIsToneModalOpen] = useState(false); // For global settings

  const [includeIntroOutro, setIncludeIntroOutro] = useState(false);

  // Outline (Deep Structure)
  const [bookStructure, setBookStructure] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [modifyingNode, setModifyingNode] = useState(null);
  const [modificationInput, setModificationInput] = useState('');

  // Writing State
  const [subsectionContents, setSubsectionContents] = useState({});
  const [factClaimsBySection, setFactClaimsBySection] = useState<Record<string, any[]>>({});
  const [progress, setProgress] = useState({ total: 0, current: 0, status: 'idle' });
  const [isTestMode, setIsTestMode] = useState(true); // 테스트 모드 기본값
  const [isAutoFactChecking, setIsAutoFactChecking] = useState(false);
  const [autoFactCheckProgress, setAutoFactCheckProgress] = useState({ current: 0, total: 0, status: '' });
  const [factCheckMode, setFactCheckMode] = useState<'off' | 'fast' | 'web'>('fast'); // OFF | 웹 없이(빠름) | 웹 검색+출처(정확, 느림/유료화 대상)
  const [writingFeedback, setWritingFeedback] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [isFeedbackChatOpen, setIsFeedbackChatOpen] = useState(false);
  const [feedbackChatMessages, setFeedbackChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: '샘플 원고를 보고 느낀 점을 알려주세요. (문체/구성/깊이/예시/독자 난이도 등)' }
  ]);
  const [feedbackChatInput, setFeedbackChatInput] = useState('');
  const [isFeedbackChatLoading, setIsFeedbackChatLoading] = useState(false);

  // New Features State
  const [coverImage, setCoverImage] = useState(null);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [generatingCoverOptionId, setGeneratingCoverOptionId] = useState(null);
  const [coverConcepts, setCoverConcepts] = useState(null);
  const [coverConceptsLoading, setCoverConceptsLoading] = useState(false);
  const [coverPromptUsed, setCoverPromptUsed] = useState('');
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isFactCheckModalOpen, setIsFactCheckModalOpen] = useState(false);

  // Detailed TOC (after writing)
  const [showDetailedToc, setShowDetailedToc] = useState(false);
  const [tocExpandedChapters, setTocExpandedChapters] = useState<Record<number, boolean>>({});
  const [activeSectionKey, setActiveSectionKey] = useState<string | null>(null);
  const [syncedPanelHeightPx, setSyncedPanelHeightPx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement | null>(null);
  const leftProgressScrollRef = useRef<HTMLDivElement | null>(null);
  const leftPanelOuterRef = useRef<HTMLDivElement | null>(null);
  const rightPanelOuterRef = useRef<HTMLDivElement | null>(null);

  const canShowDetailedToc = !!bookStructure && (progress.status === 'done' || progress.status === 'test-complete' || step === 'done');

  const toggleTocChapter = (chapterIdx: number) => {
    setTocExpandedChapters(prev => ({ ...prev, [chapterIdx]: !prev[chapterIdx] }));
  };

  const toggleDetailedToc = () => {
    setShowDetailedToc(prev => {
      const next = !prev;
      if (next && bookStructure && Object.keys(tocExpandedChapters || {}).length === 0) {
        const initial: Record<number, boolean> = {};
        bookStructure.chapters.forEach((_: any, i: number) => (initial[i] = i === 0));
        setTocExpandedChapters(initial);
      }
      return next;
    });
  };

  const jumpToSection = (chapterNumber: number, subNumber: number) => {
    const key = `${chapterNumber}_${subNumber}`;
    const el = document.getElementById(`section-${key}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const extractFactsJson = (text: string): { manuscript: string; claims: any[] } => {
    if (!text) return { manuscript: "", claims: [] };
    const re = /```FACTS_JSON\s*([\s\S]*?)\s*```/m;
    const m = text.match(re);
    if (!m) return { manuscript: text.trim(), claims: [] };
    const jsonStr = m[1];
    let claims: any[] = [];
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed?.claims)) claims = parsed.claims;
    } catch {
      claims = [];
    }
    const manuscript = text.replace(re, "").trim();
    return { manuscript, claims };
  };

  const openWebSearch = (q: string) => {
    const query = (q || "").trim();
    if (!query) return;
    try {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
    } catch {}
  };

  const factCheckInstructionForSection = (key: string) => {
    const claims = (factClaimsBySection[key] || []).slice(0, 30);
    return `아래 원고를 '팩트체크 관점'에서 보수적으로 수정하세요.

[목표]
- 검증이 필요한 단정(숫자/연도/인용/연구결과/법·제도/특정 인물·기관·사건)은 근거 없이 단정하지 말고, 가능하면 일반화/완화 표현으로 바꾸세요.
- 사실이 불확실하면: 단정 → (경향/가능성/일반적인 사례)로 전환하거나, 문장 자체를 제거하고 논지(교훈/원리)는 남기세요.
- 동시에 중언부언(같은 말 반복)을 제거하세요. 다만 분량은 유지하되 “새 사례/체크리스트/반론-반박”으로 채우세요.
- 출력은 수정된 본문만. (사족 금지)

[검증 필요 주장 목록(JSON)]
${JSON.stringify({ claims }, null, 2)}
`;
  };

  // --- Scroll sync: Right preview -> Left progress (follow current chapter) ---
  useEffect(() => {
    if (!bookStructure) return;
    const scroller = previewScrollRef.current;
    if (!scroller) return;

    let raf = 0;
    const rebuildIndex = () => {
      const ids: Array<{ key: string; top: number }> = [];
      try {
        bookStructure.chapters.forEach((ch: any) => {
          (ch.subsections || []).forEach((sub: any) => {
            const key = `${ch.chapter_number}_${sub.sub_number}`;
            const el = document.getElementById(`section-${key}`);
            if (!el) return;
            ids.push({ key, top: (el as any).offsetTop || 0 });
          });
        });
      } catch {}
      ids.sort((a, b) => a.top - b.top);
      return ids;
    };

    let index = rebuildIndex();
    const pickActiveKey = () => {
      const y = scroller.scrollTop + 120; // 헤더/여백 보정
      // 최신 top <= y인 항목
      let lo = 0, hi = index.length - 1, ans = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (index[mid].top <= y) { ans = mid; lo = mid + 1; } else { hi = mid - 1; }
      }
      const key = ans >= 0 ? index[ans].key : (index[0]?.key || null);
      if (key) setActiveSectionKey(prev => (prev === key ? prev : key));
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        pickActiveKey();
      });
    };

    // 초기/리사이즈 시 재계산
    const onResize = () => { index = rebuildIndex(); pickActiveKey(); };
    scroller.addEventListener('scroll', onScroll, { passive: true } as any);
    window.addEventListener('resize', onResize);
    onResize();

    return () => {
      try { scroller.removeEventListener('scroll', onScroll as any); } catch {}
      try { window.removeEventListener('resize', onResize as any); } catch {}
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [bookStructure, step]);

  useEffect(() => {
    if (!activeSectionKey) return;
    const [chStr] = activeSectionKey.split('_');
    const chNum = parseInt(chStr, 10);
    if (!Number.isFinite(chNum)) return;
    const el = document.getElementById(`left-ch-${chNum}`);
    if (el) {
      // 왼쪽 진행 리스트가 현재 챕터를 계속 보여주도록 따라오기
      try { el.scrollIntoView({ block: 'nearest' }); } catch {}
    }
  }, [activeSectionKey]);

  // Sync right panel height constraint to left panel height (right is constrained, and matches left)
  useEffect(() => {
    const left = leftPanelOuterRef.current;
    if (!left) return;

    const measure = () => {
      const h = Math.round(left.getBoundingClientRect().height || 0);
      setSyncedPanelHeightPx(h > 0 ? h : null);
    };

    measure();
    let ro: any = null;
    try {
      ro = new (window as any).ResizeObserver(() => measure());
      ro.observe(left);
    } catch {
      // ignore
    }
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      try { ro?.disconnect?.(); } catch {}
    };
  }, [step, showDetailedToc]);

  const handleFactCheckRewrite = async (key: string) => {
    if (!subsectionContents[key]) return;
    setEditingSection({ key, loading: true });
    try {
      const originalText = subsectionContents[key];
      const newContent = await callGemini(
        originalText,
        factCheckInstructionForSection(key)
      );
      setSubsectionContents(prev => ({ ...prev, [key]: newContent }));
    } catch (e: any) {
      alert("팩트체크 윤문 실패: " + (e?.message || String(e)));
    } finally {
      setEditingSection(null);
    }
  };

  // Project Management
  const PROJECTS_KEY = 'ai-book-smith-projects';
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; updatedAt: number }>>([]);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');

  // Generate project ID
  const generateProjectId = () => {
    return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Get storage key for current project
  const getStorageKey = (projectId: string) => `ai-book-smith-state-${projectId}`;

  // Load projects list (initialization)
  useEffect(() => {
    const savedProjects = localStorage.getItem(PROJECTS_KEY);
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        if (parsed.length > 0) {
          setProjects(parsed);
          // Load last project or first project
          const lastProjectId = localStorage.getItem('ai-book-smith-last-project');
          const projectId = lastProjectId && parsed.find((p: any) => p.id === lastProjectId) 
            ? lastProjectId 
            : parsed[0].id;
          setCurrentProjectId(projectId);
        } else {
          // Empty array, create first project
          const newId = generateProjectId();
          const newProject = {
            id: newId,
            name: '새 프로젝트',
            updatedAt: Date.now()
          };
          setProjects([newProject]);
          setCurrentProjectId(newId);
          localStorage.setItem(PROJECTS_KEY, JSON.stringify([newProject]));
          localStorage.setItem('ai-book-smith-last-project', newId);
        }
      } catch (e) {
        console.error("Failed to load projects:", e);
        // On error, create new project
        const newId = generateProjectId();
        const newProject = {
          id: newId,
          name: '새 프로젝트',
          updatedAt: Date.now()
        };
        setProjects([newProject]);
        setCurrentProjectId(newId);
        localStorage.setItem(PROJECTS_KEY, JSON.stringify([newProject]));
        localStorage.setItem('ai-book-smith-last-project', newId);
      }
    } else {
      // No projects saved, create first one
      const newId = generateProjectId();
      const newProject = {
        id: newId,
        name: '새 프로젝트',
        updatedAt: Date.now()
      };
      setProjects([newProject]);
      setCurrentProjectId(newId);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify([newProject]));
      localStorage.setItem('ai-book-smith-last-project', newId);
    }
  }, []);

  // Close project selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showProjectSelector && !target.closest('.project-selector')) {
        setShowProjectSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectSelector]);

  // Load project state
  useEffect(() => {
    if (!currentProjectId) return;

    let cancelled = false;
    (async () => {
      try {
        // 1) migrate legacy localStorage state (if any) to IndexedDB
        await migrateLocalStorageProjectStateIfNeeded(currentProjectId);

        // 2) load from IndexedDB (large state)
        const parsed = await getProjectState(currentProjectId);
        if (!parsed || cancelled) return;

        if (parsed.step) setStep(parsed.step);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.readyForOutline) setReadyForOutline(parsed.readyForOutline);
        if (parsed.toneSettings) setToneSettings(parsed.toneSettings);
        if (parsed.bookStructure) setBookStructure(parsed.bookStructure);
        if (parsed.subsectionContents) setSubsectionContents(parsed.subsectionContents);
        if (parsed.factClaimsBySection) setFactClaimsBySection(parsed.factClaimsBySection);
        if (parsed.factCheckMode) setFactCheckMode(parsed.factCheckMode);
        if (parsed.progress) {
          // 새로고침/재접속 시: 진행 중(writing)으로 저장된 상태는 실제로는 작업이 중단된 상태이므로 'stopped'로 전환
          if (parsed.step === 'writing' && parsed.progress?.status === 'writing') {
            setProgress({ ...parsed.progress, status: 'stopped' });
            setShowRecoveryBanner(true);
          } else {
            setProgress(parsed.progress);
            setShowRecoveryBanner(false);
          }
        }
        if (parsed.coverImage) setCoverImage(parsed.coverImage);
        if (parsed.coverConcepts) setCoverConcepts(parsed.coverConcepts);
        if (parsed.coverPromptUsed) setCoverPromptUsed(parsed.coverPromptUsed);
        if (parsed.currentTheme) setCurrentTheme(parsed.currentTheme);
        if (parsed.includeIntroOutro !== undefined) setIncludeIntroOutro(parsed.includeIntroOutro);
        if (parsed.isTestMode !== undefined) setIsTestMode(parsed.isTestMode);
        if (parsed.writingFeedback) setWritingFeedback(parsed.writingFeedback);
        if (parsed.showFeedbackInput !== undefined) setShowFeedbackInput(parsed.showFeedbackInput);
        if (parsed.feedbackChatMessages) setFeedbackChatMessages(parsed.feedbackChatMessages);
        if (typeof parsed.showDetailedToc === 'boolean') setShowDetailedToc(parsed.showDetailedToc);
        if (parsed.tocExpandedChapters && typeof parsed.tocExpandedChapters === 'object') {
          setTocExpandedChapters(parsed.tocExpandedChapters);
        }
      } catch (e) {
        console.error("Failed to load project state (IndexedDB):", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentProjectId]);

  // Save state (IndexedDB) + Save metadata (localStorage)
  useEffect(() => {
    if (!currentProjectId) return;

    const buildProjectState = (overrides: any = {}) => ({
      step,
      messages,
      readyForOutline,
      toneSettings,
      bookStructure,
      subsectionContents,
      factClaimsBySection,
      factCheckMode,
      progress,
      coverImage,
      coverConcepts,
      coverPromptUsed,
      currentTheme,
      includeIntroOutro,
      isTestMode,
      writingFeedback,
      showFeedbackInput,
      feedbackChatMessages,
      showDetailedToc,
      tocExpandedChapters,
      ...overrides,
    });

    const t = setTimeout(() => {
      const stateToSave = buildProjectState();

      setProjectState(currentProjectId, stateToSave).catch((e) => {
        console.error("Failed to save project state (IndexedDB):", e);
      });
    }, 600);

    // Update project updatedAt
    const updatedProjects = projects.map(p => 
      p.id === currentProjectId 
        ? { ...p, updatedAt: Date.now(), name: bookStructure?.title || p.name || '제목 없음' }
        : p
    );
    setProjects(updatedProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    localStorage.setItem('ai-book-smith-last-project', currentProjectId);
    return () => clearTimeout(t);
  }, [step, messages, readyForOutline, toneSettings, bookStructure, subsectionContents, factClaimsBySection, factCheckMode, progress, coverImage, coverConcepts, coverPromptUsed, currentTheme, includeIntroOutro, currentProjectId, bookStructure?.title, isTestMode, writingFeedback, showFeedbackInput, feedbackChatMessages, showDetailedToc, tocExpandedChapters]);

  // Create new project
  const createNewProject = () => {
    const newId = generateProjectId();
    const newProject = {
      id: newId,
      name: '새 프로젝트',
      updatedAt: Date.now()
    };
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    setCurrentProjectId(newId);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    localStorage.setItem('ai-book-smith-last-project', newId);
    
    // Reset state
    setStep('interview');
    setMessages([{ role: 'assistant', content: "안녕하세요! 어떤 책을 쓰고 싶으신가요? 책의 주제나 키워드를 알려주세요." }]);
    setInput('');
    setReadyForOutline(false);
    setBookStructure(null);
    setSubsectionContents({});
    setFactClaimsBySection({});
    setProgress({ total: 0, current: 0, status: 'idle' });
    setCoverImage(null);
    setCoverConcepts(null);
    setCoverPromptUsed('');
    setShowProjectSelector(false);
    setIsTestMode(true);
    setIsFactCheckModalOpen(false);
    setIsAutoFactChecking(false);
    setAutoFactCheckProgress({ current: 0, total: 0, status: '' });
    setFactCheckMode('fast');
    setWritingFeedback('');
    setShowFeedbackInput(false);
    setIsFeedbackChatOpen(false);
    setFeedbackChatMessages([{ role: 'assistant', content: '샘플 원고를 보고 느낀 점을 알려주세요. (문체/구성/깊이/예시/독자 난이도 등)' }]);
    setFeedbackChatInput('');
    setIsFeedbackChatLoading(false);
  };

  // Switch project
  const switchProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    localStorage.setItem('ai-book-smith-last-project', projectId);
    setShowProjectSelector(false);
    // State will be loaded by useEffect
  };

  // Delete project
  const deleteProject = (projectId: string) => {
    if (!window.confirm('이 프로젝트를 삭제하시겠습니까? 복구할 수 없습니다.')) return;
    
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    deleteProjectState(projectId).catch(() => {});
    
    if (currentProjectId === projectId) {
      if (updatedProjects.length > 0) {
        switchProject(updatedProjects[0].id);
      } else {
        createNewProject();
      }
    }
  };

  // Start editing project name
  const startEditingProject = (projectId: string, currentName: string) => {
    setEditingProjectId(projectId);
    setEditingProjectName(currentName);
  };

  // Save project name
  const saveProjectName = (projectId: string) => {
    if (!editingProjectName.trim()) {
      setEditingProjectId(null);
      return;
    }
    
    const updatedProjects = projects.map(p => 
      p.id === projectId 
        ? { ...p, name: editingProjectName.trim().substring(0, 50), updatedAt: Date.now() }
        : p
    );
    setProjects(updatedProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  // Cancel editing project name
  const cancelEditingProject = () => {
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  const handleReset = () => {
    if (window.confirm("현재 프로젝트의 모든 작업이 삭제됩니다. 정말 새로 시작하시겠습니까?")) {
      if (currentProjectId) {
        deleteProjectState(currentProjectId).catch(() => {});
      }
      // Reset state
      setStep('interview');
      setMessages([{ role: 'assistant', content: "안녕하세요! 어떤 책을 쓰고 싶으신가요? 책의 주제나 키워드를 알려주세요." }]);
      setInput('');
      setReadyForOutline(false);
      setBookStructure(null);
      setSubsectionContents({});
      setProgress({ total: 0, current: 0, status: 'idle' });
      setCoverImage(null);
      setCoverConcepts(null);
      setCoverPromptUsed('');
      setIsTestMode(true);
      setWritingFeedback('');
      setShowFeedbackInput(false);
      setIsFeedbackChatOpen(false);
      setFeedbackChatMessages([{ role: 'assistant', content: '샘플 원고를 보고 느낀 점을 알려주세요. (문체/구성/깊이/예시/독자 난이도 등)' }]);
      setFeedbackChatInput('');
      setIsFeedbackChatLoading(false);
    }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // --- Helper: Get Current Tone Prompt ---
  const getTonePrompt = () => {
    const role = TONE_FACTORS.roles.find(r => r.id === toneSettings.role);
    const tone = TONE_FACTORS.tones.find(t => t.id === toneSettings.tone);
    const style = TONE_FACTORS.styles.find(s => s.id === toneSettings.style);

    if (!role || !tone || !style) return '';

    return `
      [화자 설정] ${role.label}: ${role.prompt}
      [어조 설정] ${tone.label}: ${tone.prompt}
      [문체 설정] ${style.label}: ${style.prompt}
    `;
  };

  const getToneVisualPrompt = () => {
    const role = TONE_FACTORS.roles.find(r => r.id === toneSettings.role);
    const tone = TONE_FACTORS.tones.find(t => t.id === toneSettings.tone);

    if (!role || !tone) return '';

    return `${role.visual}, ${tone.visual}`;
  };

  // --- API Functions ---

  const callGemini = async (prompt: string, systemInstruction = "", signal?: AbortSignal) => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  };

  // --- Writing helpers (concurrent generation) ---
  const WRITE_CONCURRENCY = 6; // 동시 생성 개수 (너무 높이면 API/브라우저가 불안정해질 수 있음)
  const TEST_SECTIONS_MAX = 3; // 테스트 집필은 2~3개 "섹션"만 생성
  const AUTO_FACTCHECK_ON_COMPLETE = true; // 자동 2차 패스 자체는 유지(모드는 유저 선택)
  const FACTCHECK_CONCURRENCY = 3;

  const isAbortError = (e: any) => e?.name === 'AbortError';

  const runConcurrent = async <T,>(
    items: T[],
    concurrency: number,
    worker: (item: T) => Promise<void>,
    signal?: AbortSignal
  ) => {
    const queue = items.slice();
    const n = Math.max(1, Math.min(concurrency, queue.length || 1));
    const runners = Array.from({ length: n }, async () => {
      while (queue.length > 0) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const item = queue.shift()!;
        await worker(item);
      }
    });
    await Promise.all(runners);
  };

  const autoFactCheckPass = async (signal?: AbortSignal) => {
    if (!AUTO_FACTCHECK_ON_COMPLETE) return;
    if (factCheckMode === 'off') return;
    // claims가 있는 섹션만 대상으로 자동 팩트체크
    // 1순위: 웹 근거 기반 (/api/fact-check-web)
    // 실패 시: 로컬 보수적 안정화(단정/수치/인용 완화 or 제거) fallback
    const keys = Object.keys(factClaimsBySection || {}).filter((k) => (factClaimsBySection[k] || []).length > 0);
    if (keys.length === 0) return;

    setIsAutoFactChecking(true);
    setAutoFactCheckProgress({
      current: 0,
      total: keys.length,
      status: factCheckMode === 'web' ? '팩트체크(웹 검색+출처) 중...' : '팩트체크(빠름: 웹 없이) 중...'
    });
    try {
      await runConcurrent(
        keys,
        FACTCHECK_CONCURRENCY,
        async (key) => {
          if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
          const originalText = (subsectionContents as any)[key];
          if (!originalText) {
            setAutoFactCheckProgress(prev => ({ ...prev, current: prev.current + 1 }));
            return;
          }
          try {
            // Try web-grounded fact check first
            let rewritten: string | null = null;
            if (factCheckMode === 'web') {
              try {
                const res = await fetch('/api/fact-check-web', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    manuscript: originalText,
                    claims: (factClaimsBySection as any)[key] || []
                  }),
                  signal,
                });
                if (res.ok) {
                  const data = await res.json();
                  if (data?.rewritten) rewritten = data.rewritten;
                }
              } catch {
                // ignore and fallback
              }
            }

            // Fallback: conservative stabilization without web evidence
            if (!rewritten) {
              rewritten = await callGemini(originalText, factCheckInstructionForSection(key), signal);
            }

            setSubsectionContents(prev => ({ ...prev, [key]: rewritten }));
          } finally {
            setAutoFactCheckProgress(prev => ({ ...prev, current: prev.current + 1 }));
          }
        },
        signal
      );
      setAutoFactCheckProgress(prev => ({ ...prev, status: '팩트체크 완료' }));
    } finally {
      setIsAutoFactChecking(false);
    }
  };

  const callGeminiStream = async (prompt: string | any[], systemInstruction = "", onUpdate: (text: string) => void, generationConfig?: any, signal?: AbortSignal) => {
    const body = Array.isArray(prompt)
      ? { messages: prompt, systemInstruction, generationConfig }
      : { prompt, systemInstruction, generationConfig };

    const response = await fetch('/api/generate-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith('data: ')) continue;
        const jsonStr = trimmedLine.slice(6);
        if (jsonStr === '[DONE]') continue;
        try {
          const data = JSON.parse(jsonStr);
          if (data.text) {
            accumulatedText += data.text;
            onUpdate(accumulatedText);
          }
        } catch (e) { }
      }
    }
    return accumulatedText;
  };

  const extractDraftFeedbackBlock = (text: string) => {
    if (!text) return "";
    const match = text.match(/<DRAFT_FEEDBACK>[\s\S]*?<\/DRAFT_FEEDBACK>/);
    if (!match) return "";
    return match[0]
      .replace("<DRAFT_FEEDBACK>", "")
      .replace("</DRAFT_FEEDBACK>", "")
      .trim();
  };

  const sendFeedbackChat = async () => {
    if (!feedbackChatInput.trim() || isFeedbackChatLoading) return;
    const userMsg = { role: 'user' as const, content: feedbackChatInput.trim() };
    setFeedbackChatInput('');
    setIsFeedbackChatLoading(true);

    const next = [...feedbackChatMessages, userMsg, { role: 'assistant' as const, content: '' }];
    setFeedbackChatMessages(next);

    try {
      const tonePrompt = getTonePrompt();
      const history = [...feedbackChatMessages, userMsg];

      const finalResponse = await callGeminiStream(
        history,
        SYSTEM_PROMPTS.feedbackCoach(tonePrompt),
        (currentText) => {
          setFeedbackChatMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0) updated[lastIdx] = { ...updated[lastIdx], content: currentText };
            return updated;
          });
        }
      );

      const draft = extractDraftFeedbackBlock(finalResponse);
      if (draft) setWritingFeedback(draft);
    } catch (e: any) {
      console.error("피드백 채팅 실패:", e);
      alert(`피드백 대화 실패: ${e?.message || '알 수 없는 오류'}`);
      // 실패 시 마지막 assistant 메시지 제거
      setFeedbackChatMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsFeedbackChatLoading(false);
    }
  };

  const finalizeFeedbackFromChat = async () => {
    if (isFeedbackChatLoading) return;
    setIsFeedbackChatLoading(true);
    try {
      const convo = feedbackChatMessages
        .map((m) => `${m.role === 'user' ? 'User' : 'Editor'}: ${m.content}`)
        .join('\n');

      const prompt = `아래 '피드백 대화'를 바탕으로, 앞으로 생성될 나머지 원고에 적용할 '집필 지침'을 만들어주세요.\n\n요구사항:\n- 5~10개의 불릿\n- 각 불릿은 실행 가능한 지시문(예: \"사례를 매 섹션마다 2개 이상\")\n- 너무 길면 안 됨(총 800자 이내)\n- 출력은 지침만 (설명 금지)\n\n[피드백 대화]\n${convo}`;

      const guidance = await callGemini(prompt);
      const clean = guidance.trim();
      if (clean) setWritingFeedback(clean);
      setIsFeedbackChatOpen(false);
    } catch (e: any) {
      console.error("피드백 확정 실패:", e);
      alert(`피드백 확정 실패: ${e?.message || '알 수 없는 오류'}`);
    } finally {
      setIsFeedbackChatLoading(false);
    }
  };

  // --- Feature Logic ---

  const handleDeleteNode = (type, cIdx, sIdx = null) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const newBook = { ...bookStructure };
    if (type === 'chapter') {
      newBook.chapters.splice(cIdx, 1);
      newBook.chapters = newBook.chapters.map((c, i) => ({ ...c, chapter_number: i + 1 }));
    } else {
      newBook.chapters[cIdx].subsections.splice(sIdx, 1);
      newBook.chapters[cIdx].subsections = newBook.chapters[cIdx].subsections.map((s, i) => ({ ...s, sub_number: i + 1 }));
    }
    setBookStructure(newBook);
  };

  const openModificationModal = (type, cIdx, sIdx = null) => {
    setModifyingNode({ type, cIdx, sIdx });
    setModificationInput('');
  };

  const submitModification = async () => {
    if (!modificationInput.trim() || !modifyingNode) return;
    setLoading(true);
    try {
      const targetNode = modifyingNode.type === 'chapter'
        ? bookStructure.chapters[modifyingNode.cIdx]
        : bookStructure.chapters[modifyingNode.cIdx].subsections[modifyingNode.sIdx];
      const context = modifyingNode.type === 'chapter'
        ? `Current Chapter: ${JSON.stringify(targetNode)}`
        : `Parent Chapter: ${bookStructure.chapters[modifyingNode.cIdx].title}. Current Subsection: ${JSON.stringify(targetNode)}`;
      const prompt = `[Context] ${context} [User Instruction] "${modificationInput}" Modify the node based on instruction. Return ONLY JSON.`;
      const result = await callGemini(prompt, SYSTEM_PROMPTS.outlineModifier);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const newBook = { ...bookStructure };
        if (modifyingNode.type === 'chapter') {
          newBook.chapters[modifyingNode.cIdx] = { ...newBook.chapters[modifyingNode.cIdx], ...parsed };
        } else {
          newBook.chapters[modifyingNode.cIdx].subsections[modifyingNode.sIdx] = {
            ...newBook.chapters[modifyingNode.cIdx].subsections[modifyingNode.sIdx],
            ...parsed
          };
        }
        setBookStructure(newBook);
        setModifyingNode(null);
      }
    } catch (e) {
      alert("수정 실패: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Cover: 3 concepts -> user picks -> generate image (Gemini 3 Pro Image Preview)
  const generateCoverConcepts = async () => {
    if (!bookStructure) return;
    setCoverConceptsLoading(true);
    try {
      const response = await fetch('/api/cover/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bookStructure.title,
          description: bookStructure.concept,
          targetAudience: bookStructure.target_audience || '',
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Cover concept error: ${response.status}`);
      }

      const data = await response.json();
      setCoverConcepts(data);
      setIsCoverModalOpen(true);
    } catch (e: any) {
      alert("표지 컨셉 생성 실패: " + e.message);
      console.error(e);
    } finally {
      setCoverConceptsLoading(false);
    }
  };

  const generateCoverImageFromConcept = async (option) => {
    if (!option?.promptEnglish) return;
    
    setGeneratingCover(true);
    setGeneratingCoverOptionId(option?.id || null);
    
    // 타임아웃 설정 (60초)
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      timeoutId = setTimeout(() => {
        controller.abort();
      }, 60000);

      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: option.promptEnglish }),
        signal: controller.signal
      });

      if (!response.ok) {
        let errorMessage = `이미지 생성 실패 (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch {
            // 응답을 읽을 수 없는 경우
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data || !data.imageUrl) {
        throw new Error("서버에서 이미지 데이터를 받지 못했습니다. 다시 시도해주세요.");
      }

      // 모바일에서 메모리 문제 방지를 위해 이미지 크기 체크
      if (data.imageUrl.length > 10 * 1024 * 1024) { // 10MB 이상
        console.warn("이미지가 매우 큽니다:", data.imageUrl.length);
      }

      // 상태 업데이트를 안전하게 처리
      setCoverImage(data.imageUrl);
      setCoverPromptUsed(option.promptEnglish);
      setIsCoverModalOpen(false);

      // 표지는 용량이 크고, 디바운스 저장 전에 새로고침하면 유실될 수 있어 즉시 저장(IndexedDB flush)
      try {
        if (currentProjectId) {
          const immediateState = {
            step,
            messages,
            readyForOutline,
            toneSettings,
            bookStructure,
            subsectionContents,
            progress,
            coverImage: data.imageUrl,
            coverConcepts,
            coverPromptUsed: option.promptEnglish,
            currentTheme,
            includeIntroOutro,
            isTestMode,
            writingFeedback,
            showFeedbackInput,
            feedbackChatMessages,
          };
          setProjectState(currentProjectId, immediateState).catch(() => {});
        }
      } catch {}
    } catch (e: any) {
      let errorMessage = "알 수 없는 오류가 발생했습니다.";
      
      if (e.name === 'AbortError' || e.message?.includes('aborted')) {
        errorMessage = "요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.";
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      console.error("이미지 생성 오류:", e);
      
      // 모바일에서도 보이도록 에러 표시 개선
      try {
        if (typeof window !== 'undefined' && window.alert) {
          alert(`이미지 생성 실패\n\n${errorMessage}\n\n브라우저 콘솔을 확인해주세요.`);
        }
      } catch (alertError) {
        console.error("알림 표시 실패:", alertError);
      }
    } finally {
      // 타임아웃 정리
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // 상태 정리
      setGeneratingCover(false);
      setGeneratingCoverOptionId(null);
    }
  };

  const handleAIEdit = async (key, instruction) => {
    if (!subsectionContents[key]) return;
    setEditingSection({ key, loading: true });
    try {
      const originalText = subsectionContents[key];
      const tonePrompt = getTonePrompt();
      const newContent = await callGemini(
        originalText,
        SYSTEM_PROMPTS.editor(originalText, instruction, tonePrompt)
      );
      setSubsectionContents(prev => ({ ...prev, [key]: newContent }));
    } catch (e) {
      alert("AI 수정 실패: " + e.message);
    } finally {
      setEditingSection(null);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let tableBuffer = [];

    const flushTable = () => {
      if (tableBuffer.length === 0) return;
      const headers = tableBuffer[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());
      let bodyRows = tableBuffer.slice(1);
      if (bodyRows.length > 0 && bodyRows[0].includes('---')) {
        bodyRows = bodyRows.slice(1);
      }
      elements.push(
        <div key={`table-${elements.length}`} className={`my-8 overflow-hidden border ${theme.border} rounded-sm`}>
          <table className="min-w-full text-sm text-left font-serif">
            <thead className={`${currentTheme === 'deepSpace' ? 'bg-gray-800' : 'bg-slate-100'} ${theme.previewText} border-b-2 ${theme.border}`}>
              <tr>{headers.map((h, i) => <th key={i} className="px-6 py-3 font-bold tracking-wider uppercase">{parseInline(h)}</th>)}</tr>
            </thead>
            <tbody className={`divide-y divide-slate-200 ${currentTheme === 'deepSpace' ? 'bg-black' : 'bg-white'}`}>
              {bodyRows.map((row, rIdx) => {
                const cells = row.split('|').filter(c => c.trim() !== '').map(c => c.trim());
                return (
                  <tr key={rIdx} className={`hover:bg-indigo-500/5 transition-colors ${theme.previewText}`}>
                    {cells.map((c, cIdx) => <td key={cIdx} className="px-6 py-4 whitespace-pre-wrap leading-relaxed">{parseInline(c)}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableBuffer = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('|')) { tableBuffer.push(trimmedLine); continue; }
      flushTable();
      const cleanLine = line.replace(/\$\$/g, '').replace(/\\text\{([^}]+)\}/g, '$1');
      if (cleanLine.match(/^###\s?/)) {
        elements.push(<h3 key={i} className={`text-xl font-serif font-bold mt-8 mb-4 ${theme.previewText} flex items-center gap-2`}><span className={`opacity-40 text-2xl select-none ${theme.accent}`}>§</span>{parseInline(cleanLine.replace(/^###\s?/, ''))}</h3>); continue;
      }
      if (cleanLine.match(/^##\s?/)) {
        elements.push(<h2 key={i} className={`text-2xl font-serif font-bold mt-12 mb-6 ${theme.previewText} border-b pb-2 ${theme.border}`}>{parseInline(cleanLine.replace(/^##\s?/, ''))}</h2>); continue;
      }
      if (trimmedLine.match(/^[-*]\s/)) {
        const content = cleanLine.replace(/^[-*]\s/, '');
        elements.push(<div key={i} className="flex items-start gap-3 ml-2 mb-2 pl-2"><span className={`mt-2 text-[6px] shrink-0 opacity-60 ${theme.previewText}`}>●</span><p className={`flex-1 ${theme.previewText} leading-relaxed font-serif`}>{parseInline(content)}</p></div>); continue;
      }
      const orderedListMatch = cleanLine.match(/^\s*(\d+)\.\s(.*)/);
      if (orderedListMatch) {
        elements.push(<div key={i} className="flex items-start gap-2 ml-1 mb-1 pl-2"><span className={`font-bold text-sm mt-1 shrink-0 font-serif ${theme.previewText}`}>{orderedListMatch[1]}.</span><p className={`flex-1 ${theme.previewText} leading-relaxed font-serif`}>{parseInline(orderedListMatch[2])}</p></div>); continue;
      }
      if (trimmedLine.startsWith('> ')) {
        elements.push(<blockquote key={i} className={`my-6 pl-6 border-l-4 ${theme.accent.replace('text-', 'border-')} italic opacity-80 font-serif py-2 pr-2 rounded-r ${theme.previewText}`}>{parseInline(cleanLine.replace(/^>\s?/, ''))}</blockquote>); continue;
      }
      if (trimmedLine === '') { elements.push(<div key={i} className="h-4" />); continue; }
      elements.push(<p key={i} className={`mb-4 leading-loose font-serif text-lg ${theme.previewText}`}>{parseInline(cleanLine)}</p>);
    }
    flushTable();
    return elements;
  };

  const parseInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className={`font-bold ${theme.text}`}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // --- Sequential Polishing Logic ---
  const handleSequentialPolish = async () => {
    if (!bookStructure) return;
    setIsPolishing(true);
    setPolishStatus('준비 중...');

    // Flatten all subsections to create a sequential list
    const allSubsections: any[] = [];
    bookStructure.chapters.forEach((ch, cIdx) => {
      ch.subsections.forEach((sub, sIdx) => {
        allSubsections.push({ ...sub, cIdx, sIdx, key: `${ch.chapter_number}_${sub.sub_number}` });
      });
    });

    setPolishProgress({ current: 0, total: allSubsections.length });

    // Create AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    let previousContext = "";

    try {
      for (let i = 0; i < allSubsections.length; i++) {
        if (signal.aborted) throw new Error("작업이 중지되었습니다.");

        const sub = allSubsections[i];
        const currentText = subsectionContents[sub.key];

        setPolishStatus(`${sub.cIdx + 1}장 ${sub.sIdx + 1}절 "${sub.title}" 윤문 중...`);

        // Skip if no content (shouldn't happen if generated)
        if (!currentText) continue;

        // For the very first section, we don't have previous context, 
        // but we still might want to "polish" it for tone consistency.
        // Or we can skip the first one if the user only wants transitions.
        // Let's polish everything for consistency.

        const tonePrompt = getTonePrompt();

        const response = await fetch('/api/polish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentText,
            previousContext: previousContext.slice(-3000), // Pass last 3000 chars as context
            tonePrompt,
            instruction: i === 0 ? "첫 챕터의 시작입니다. 독자의 흥미를 끌 수 있도록 매력적으로 다듬어주세요." : "이전 내용과 자연스럽게 이어지도록 접속사와 흐름을 다듬어주세요."
          }),
          signal
        });

        if (!response.ok) throw new Error(`Polishing failed at ${sub.title}`);

        const data = await response.json();
        const refinedText = data.refinedText;

        // Update content immediately
        setSubsectionContents(prev => ({ ...prev, [sub.key]: refinedText }));

        // Update context for next iteration
        previousContext += "\n\n" + refinedText;

        // Update progress
        setPolishProgress(prev => ({ ...prev, current: i + 1 }));
      }
      alert("전체 윤문 작업이 완료되었습니다!");
    } catch (e: any) {
      if (e.name === 'AbortError' || e.message === '작업이 중지되었습니다.') {
        alert("윤문 작업이 중지되었습니다.");
      } else {
        console.error(e);
        alert("윤문 작업 중 오류가 발생했습니다: " + e.message);
      }
    } finally {
      setIsPolishing(false);
      setPolishStatus('');
      abortControllerRef.current = null;
    }
  };

  const handleStopPolish = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // --- Persona Chat Logic ---
  const handlePersonaChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!personaChatInput.trim()) return;

    const userMsg = { role: 'user', content: personaChatInput };
    setPersonaChatMessages(prev => [...prev, userMsg]);
    setPersonaChatInput('');
    setIsChatLoading(true);

    try {
      const role = TONE_FACTORS.roles.find(r => r.id === toneSettings.role);
      const tone = TONE_FACTORS.tones.find(t => t.id === toneSettings.tone);
      const style = TONE_FACTORS.styles.find(s => s.id === toneSettings.style);

      const response = await fetch('/api/chat-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: personaChatMessages,
          personaSettings: {
            roleLabel: role?.label, roleDesc: role?.desc,
            toneLabel: tone?.label, toneDesc: tone?.desc,
            styleLabel: style?.label, styleDesc: style?.desc,
          },
          bookContext: {
            title: bookStructure?.title,
            concept: bookStructure?.concept,
            step
          }
        })
      });

      if (!response.ok) throw new Error("Chat failed");
      const data = await response.json();
      setPersonaChatMessages(prev => [...prev, { role: 'model', content: data.reply }]);
    } catch (e) {
      console.error(e);
      setPersonaChatMessages(prev => [...prev, { role: 'model', content: "죄송합니다. 잠시 생각이 안 나네요. 다시 말씀해 주시겠어요?" }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Export Functions ---

  const handlePrintPDF = () => { window.print(); };

  const handleExportEPUB = async () => {
    if (!bookStructure) return;
    setExporting(true);
    try {
      await Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js')
      ]);
      const JSZip = window.JSZip;
      const saveAs = window.saveAs;
      const zip = new JSZip();
      const title = bookStructure.title;
      const author = "AI Book Smith";
      const uuid = "urn:uuid:" + new Date().getTime();
      zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
      zip.folder("META-INF").file("container.xml", `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
      const oebps = zip.folder("OEBPS");
      let manifestItems = "", spineItems = "", navMapItems = "";

      if (coverImage) {
        const imgData = coverImage.split(',')[1];
        oebps.file("cover.png", imgData, { base64: true });
        manifestItems += `<item id="cover-image" href="cover.png" media-type="image/png"/>\n`;
        const coverPageContent = `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Cover</title></head><body style="margin:0; padding:0; text-align:center;"><div style="height:100vh; display:flex; justify-content:center; align-items:center;"><img src="cover.png" alt="Cover" style="max-height:100%; max-width:100%;"/></div></body></html>`;
        oebps.file("cover.xhtml", coverPageContent);
        manifestItems += `<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>\n`;
        spineItems += `<itemref idref="cover"/>\n`;
      }
      const titlePageContent = `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body><div style="text-align:center; margin-top: 20%;"><h1>${title}</h1><h3>${bookStructure.concept}</h3><p>Generated by AI Book Smith</p></div></body></html>`;
      oebps.file("title.xhtml", titlePageContent);
      manifestItems += `<item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>\n`;
      spineItems += `<itemref idref="title"/>\n`;

      bookStructure.chapters.forEach((ch, idx) => {
        const chFilename = `chapter${idx + 1}.xhtml`;
        let chContent = `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${ch.title}</title><style>body { font-family: serif; line-height: 1.6; } h1, h2, h3 { font-weight: bold; } blockquote { font-style: italic; margin-left: 1em; border-left: 2px solid #ccc; padding-left: 1em; } table { border-collapse: collapse; width: 100%; margin: 1em 0; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; } pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }</style></head><body><h1>Chapter ${ch.chapter_number}. ${ch.title}</h1>`;
        ch.subsections.forEach(sub => {
          const key = `${ch.chapter_number}_${sub.sub_number}`;
          const rawContent = subsectionContents[key] || "";
          const cleanedContent = rawContent.replace(/\$\$/g, '').replace(/\\text\{([^}]+)\}/g, '$1').replace(/\\[a-zA-Z]+/g, '');
          const htmlContent = cleanedContent.replace(/^### (.*$)/gim, '<h3>$1</h3>').replace(/^## (.*$)/gim, '<h2>$1</h2>').replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>').replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>').replace(/\n/gim, '<br/>');
          chContent += `<h2>§ ${sub.title}</h2><div>${htmlContent}</div><hr/>`;
        });
        chContent += `</body></html>`;
        oebps.file(chFilename, chContent);
        const id = `ch${idx + 1}`;
        manifestItems += `<item id="${id}" href="${chFilename}" media-type="application/xhtml+xml"/>\n`;
        spineItems += `<itemref idref="${id}"/>\n`;
        navMapItems += `<navPoint id="navPoint-${idx + 1}" playOrder="${idx + 1}"><navLabel><text>${ch.title}</text></navLabel><content src="${chFilename}"/></navPoint>`;
      });

      const contentOpf = `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf"><dc:title>${title}</dc:title><dc:creator opf:role="aut">${author}</dc:creator><dc:language>ko</dc:language><dc:identifier id="BookId" opf:scheme="UUID">${uuid}</dc:identifier>${coverImage ? '<meta name="cover" content="cover-image"/>' : ''}</metadata><manifest><item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>${manifestItems}</manifest><spine toc="ncx">${spineItems}</spine></package>`;
      oebps.file("content.opf", contentOpf);
      const tocNcx = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd"><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="${uuid}"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>${title}</text></docTitle><navMap>${navMapItems}</navMap></ncx>`;
      oebps.file("toc.ncx", tocNcx);
      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `${title.replace(/\s+/g, '_')}.epub`);
    } catch (error) { alert("EPUB 생성 중 오류가 발생했습니다: " + error.message); } finally { setExporting(false); }
  };

  const handleExportDOCX = async () => {
    if (!bookStructure) return;
    setExporting(true);
    try {
      // WordprocessingML 기반 DOCX 생성 (AltChunk/MHT 없음)
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js');
      // @ts-ignore
      const saveAs = window.saveAs;

      const docx = await import('docx');
      const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        HeadingLevel,
        AlignmentType,
        PageBreak,
        Table,
        TableRow,
        TableCell,
        WidthType,
        BorderStyle,
        LevelFormat,
      } = docx;

      const safeText = (s) => (s ?? '').toString();

      const makeRunsFromBold = (text) => {
        const input = safeText(text);
        const runs = [];

        // handle line breaks inside a paragraph
        const pushTextWithBreaks = (t, bold = false) => {
          const parts = safeText(t).split('\n');
          parts.forEach((p, idx) => {
            if (idx > 0) runs.push(new TextRun({ text: '', break: 1 }));
            if (p) runs.push(new TextRun({ text: p, bold }));
          });
        };

        let i = 0;
        while (i < input.length) {
          const start = input.indexOf('**', i);
          if (start === -1) {
            pushTextWithBreaks(input.slice(i), false);
            break;
          }
          const end = input.indexOf('**', start + 2);
          if (end === -1) {
            pushTextWithBreaks(input.slice(i), false);
            break;
          }
          pushTextWithBreaks(input.slice(i, start), false);
          pushTextWithBreaks(input.slice(start + 2, end), true);
          i = end + 2;
        }
        return runs.length ? runs : [new TextRun({ text: '' })];
      };

      const cleanMarkdownLikeText = (raw) =>
        safeText(raw)
          .replace(/\$\$/g, '')
          .replace(/\\text\{([^}]+)\}/g, '$1')
          .replace(/\\[a-zA-Z]+/g, '');

      const isTableSeparatorRow = (line) => {
        const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
        return cols.length > 0 && cols.every((c) => /^-+$/.test(c));
      };

      const parsePipeTable = (block) => {
        const lines = safeText(block)
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.startsWith('|'));
        if (!lines.length) return null;
        const rows = [];
        for (const ln of lines) {
          if (isTableSeparatorRow(ln)) continue;
          const cols = ln.split('|').map((c) => c.trim()).filter(Boolean);
          if (cols.length) rows.push(cols);
        }
        if (!rows.length) return null;
        return rows;
      };

      const buildTable = (rows) => {
        const maxCols = Math.max(...rows.map((r) => r.length));
        const normRows = rows.map((r) => {
          const out = [...r];
          while (out.length < maxCols) out.push('');
          return out;
        });

        const tableRows = normRows.map((r, idx) => {
          const isHeader = idx === 0;
          return new TableRow({
            children: r.map((cellText) => {
              const runs = makeRunsFromBold(cellText);
              if (isHeader) {
                // header bold 강화
                runs.forEach((run) => (run.bold = true));
              }
              return new TableCell({
                width: { size: Math.floor(100 / maxCols), type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: runs,
                  }),
                ],
              });
            }),
          });
        });

        return new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
        });
      };

      const children = [];

      // Numbering config (ordered list)
      const numberingConfig = [
        {
          reference: 'abs-numbered',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.START,
            },
          ],
        },
        {
          reference: 'abs-bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.START,
            },
          ],
        },
      ];

      // Title page
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({ text: safeText(bookStructure.title), bold: true, size: 56 }),
          ],
        })
      );
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: safeText(bookStructure.concept), size: 28 })],
        })
      );
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Generated by AI Book Smith', color: '888888' })],
        })
      );
      children.push(new Paragraph({ children: [new PageBreak()] }));

      // Chapters
      bookStructure.chapters.forEach((ch, idx) => {
        if (idx > 0) {
          children.push(new Paragraph({ children: [new PageBreak()] }));
        }
        children.push(
          new Paragraph({
            text: `Chapter ${ch.chapter_number}. ${safeText(ch.title)}`,
            heading: HeadingLevel.HEADING_1,
          })
        );

        ch.subsections.forEach((sub) => {
          const key = `${ch.chapter_number}_${sub.sub_number}`;
          const rawContent = subsectionContents[key] || '';
          children.push(
            new Paragraph({
              text: `§ ${safeText(sub.title)}`,
              heading: HeadingLevel.HEADING_2,
            })
          );

          const clean = cleanMarkdownLikeText(rawContent);
          const blocks = clean.split(/\n\s*\n/);

          blocks.forEach((b) => {
            const trimmed = b.trim();
            if (!trimmed) return;

            // Table
            if (trimmed.startsWith('|')) {
              const tableRows = parsePipeTable(trimmed);
              if (tableRows) {
                children.push(buildTable(tableRows));
                children.push(new Paragraph({ text: '' }));
                return;
              }
            }

            // Blockquote
            if (trimmed.startsWith('>')) {
              const quoteLines = trimmed.split('\n').map((l) => l.replace(/^>\s?/, ''));
              quoteLines.forEach((ql) => {
                const q = ql.trim();
                if (!q) return;
                children.push(
                  new Paragraph({
                    indent: { left: 720 },
                    border: {
                      left: {
                        color: 'CCCCCC',
                        size: 6,
                        space: 8,
                        style: BorderStyle.SINGLE,
                      },
                    },
                    children: makeRunsFromBold(q).map((r) => {
                      r.italics = true;
                      return r;
                    }),
                  })
                );
              });
              children.push(new Paragraph({ text: '' }));
              return;
            }

            // Headings inside section
            if (trimmed.startsWith('### ')) {
              children.push(
                new Paragraph({
                  text: trimmed.replace(/^###\s*/, ''),
                  heading: HeadingLevel.HEADING_3,
                })
              );
              return;
            }
            if (trimmed.startsWith('## ')) {
              children.push(
                new Paragraph({
                  text: trimmed.replace(/^##\s*/, ''),
                  heading: HeadingLevel.HEADING_3,
                })
              );
              return;
            }

            // Unordered list
            if (trimmed.match(/^[-*]\s/)) {
              trimmed.split('\n').forEach((line) => {
                const item = line.replace(/^[-*]\s/, '').trim();
                if (!item) return;
                children.push(
                  new Paragraph({
                    numbering: { reference: 'abs-bullets', level: 0 },
                    children: makeRunsFromBold(item),
                  })
                );
              });
              children.push(new Paragraph({ text: '' }));
              return;
            }

            // Ordered list
            if (trimmed.match(/^\d+\.\s/)) {
              trimmed.split('\n').forEach((line) => {
                const item = line.replace(/^\d+\.\s/, '').trim();
                if (!item) return;
                children.push(
                  new Paragraph({
                    numbering: { reference: 'abs-numbered', level: 0 },
                    children: makeRunsFromBold(item),
                  })
                );
              });
              children.push(new Paragraph({ text: '' }));
              return;
            }

            // Normal paragraph
            children.push(
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 120 },
                children: makeRunsFromBold(trimmed),
              })
            );
          });
        });
      });

      const doc = new Document({
        numbering: { config: numberingConfig },
        sections: [{ children }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${bookStructure.title}.docx`);

    } catch (error: any) {
      alert("DOCX 생성 실패: " + error.message);
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  // --- App Logic ---

  // Extract project name from conversation
  const extractProjectName = async (userMessage: string, allMessages: any[]) => {
    try {
      // 첫 사용자 메시지에서 책 주제 추출
      if (allMessages.filter(m => m.role === 'user').length === 1) {
        const prompt = `다음 사용자 메시지에서 책의 주제나 키워드를 추출하여 짧은 프로젝트 이름(최대 20자)을 만들어주세요. 
책 제목이 명시되어 있으면 그것을 사용하고, 없으면 주제를 요약해서 만들어주세요.
출력은 이름만 출력하세요. 설명이나 다른 텍스트는 포함하지 마세요.

사용자 메시지: "${userMessage}"`;
        
        const projectName = await callGemini(prompt);
        const cleanName = projectName.trim().replace(/^["']|["']$/g, '').substring(0, 20);
        
        if (cleanName && currentProjectId) {
          const updatedProjects = projects.map(p => 
            p.id === currentProjectId 
              ? { ...p, name: cleanName, updatedAt: Date.now() }
              : p
          );
          setProjects(updatedProjects);
          localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
        }
      }
    } catch (e) {
      console.error("프로젝트 이름 추출 실패:", e);
      // 실패해도 계속 진행
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    
    // 첫 사용자 메시지면 프로젝트 이름 추출 (비동기로 실행, 블로킹 안 함)
    if (messages.filter(m => m.role === 'user').length === 0) {
      extractProjectName(input, newMessages).catch(() => {});
    }
    
    try {
      const tonePrompt = getTonePrompt();
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const historyMessages = [...messages, userMsg];

      const finalResponse = await callGeminiStream(
        historyMessages,
        SYSTEM_PROMPTS.interviewer(tonePrompt),
        (currentText) => { setMessages(prev => { const newMsgs = [...prev]; newMsgs[newMsgs.length - 1].content = currentText; return newMsgs; }); }
      );
      const isReady = finalResponse.includes("[READY_FOR_OUTLINE]");
      const cleanResponse = finalResponse.replace("[READY_FOR_OUTLINE]", "").trim();
      setMessages(prev => { const newMsgs = [...prev]; newMsgs[newMsgs.length - 1].content = cleanResponse; return newMsgs; });
      if (isReady) setReadyForOutline(true);
    } catch (error) { alert("Error: " + error.message); setMessages(prev => prev.slice(0, -1)); } finally { setLoading(false); }
  };

  const generateOutline = async () => {
    setLoading(true);
    try {
      const historyText = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
      const response = await callGemini(
        `인터뷰 내용을 바탕으로 **2단계 계층 구조(Chapter -> Subsection)**를 가진 목차 JSON을 생성하세요.
         ${includeIntroOutro ? "반드시 책의 맨 앞에는 '서문(Prologue)'을, 맨 뒤에는 '결문(Epilogue)'을 별도 챕터로 포함시키세요." : ""} 
         \n\n${historyText}`,
        SYSTEM_PROMPTS.architect
      );
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setBookStructure(parsed);
        setStep('outline');
        if (parsed.chapters.length > 0) setExpandedChapters({ 0: true });
        
        // 책 제목이 생성되면 프로젝트 이름 업데이트
        if (parsed.title && currentProjectId) {
          const updatedProjects = projects.map(p => 
            p.id === currentProjectId 
              ? { ...p, name: parsed.title.substring(0, 30), updatedAt: Date.now() }
              : p
          );
          setProjects(updatedProjects);
          localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
        }
      } else { throw new Error("JSON parsing failed"); }
    } catch (error) { alert("목차 생성 실패: " + error.message); } finally { setLoading(false); }
  };

  const toggleChapter = (idx) => setExpandedChapters(prev => ({ ...prev, [idx]: !prev[idx] }));
  const updateSubsection = (chIdx, subIdx, field, value) => {
    const newStruct = { ...bookStructure };
    newStruct.chapters[chIdx].subsections[subIdx][field] = value;
    setBookStructure(newStruct);
  };

  const startDeepWriting = async (testMode: boolean = false) => {
    // 이미 집필이 돌고 있으면 중지 후 재시작
    if (writingAbortRef.current) {
      try { writingAbortRef.current.abort(); } catch {}
    }
    writingAbortRef.current = new AbortController();
    const writingSignal = writingAbortRef.current.signal;

    setStep('writing');
    setIsTestMode(testMode);
    
    const tonePrompt = getTonePrompt();
    const bookSummary = await callGemini(
      `다음 책 구조의 전체 핵심 내용을 500자로 요약하세요:\n${JSON.stringify(bookStructure)}`
    , "", writingSignal);
    
    // 테스트 모드: "챕터 전체"가 아니라 2~3개 섹션만 빠르게 샘플 생성
    // 전체 모드: 모든 섹션을 병렬 배치로 생성(동시성 제한)
    const buildTasks = () => {
      const tasks: Array<{ chapter: any; sub: any; key: string; prompt: string }> = [];
      const chapters = bookStructure.chapters || [];

      const isPrologueLike = (t: string) => (t || '').includes('서문') || (t || '').includes('Prologue') || (t || '').includes('서론');
      const prologue = chapters.find((ch: any) => isPrologueLike(ch.title));
      const regularChapters = chapters
        .filter((ch: any) => !isPrologueLike(ch.title))
        .sort((a: any, b: any) => a.chapter_number - b.chapter_number);

      if (testMode) {
        const picks: Array<{ chapter: any; sub: any }> = [];
        // 1) 서문 첫 섹션(있으면)
        if (prologue?.subsections?.length) picks.push({ chapter: prologue, sub: prologue.subsections[0] });
        // 2) 첫/둘째 챕터의 첫 섹션
        if (regularChapters[0]?.subsections?.length) picks.push({ chapter: regularChapters[0], sub: regularChapters[0].subsections[0] });
        if (regularChapters[1]?.subsections?.length) picks.push({ chapter: regularChapters[1], sub: regularChapters[1].subsections[0] });

        for (const { chapter, sub } of picks.slice(0, TEST_SECTIONS_MAX)) {
          const key = `${chapter.chapter_number}_${sub.sub_number}`;
          const prompt = SYSTEM_PROMPTS.writer(bookStructure, chapter, sub, "", tonePrompt, bookSummary);
          tasks.push({ chapter, sub, key, prompt });
        }
        console.log('테스트 모드 - 생성할 섹션:', tasks.map(t => t.key));
        return tasks;
      }

      // 전체 모드: 모든 섹션
      for (const chapter of chapters) {
        for (const sub of (chapter.subsections || [])) {
          const key = `${chapter.chapter_number}_${sub.sub_number}`;
          const prompt = SYSTEM_PROMPTS.writer(bookStructure, chapter, sub, "", tonePrompt, bookSummary);
          tasks.push({ chapter, sub, key, prompt });
        }
      }
      return tasks;
    };

    const tasks = buildTasks();
    setProgress({ total: tasks.length, current: 0, status: 'writing' });

    try {
      await runConcurrent(
        tasks,
        WRITE_CONCURRENCY,
        async (t) => {
          try {
            const content = await callGemini(t.prompt, "", writingSignal);
            const { manuscript, claims } = extractFactsJson(content);
            setSubsectionContents(prev => ({ ...prev, [t.key]: manuscript }));
            if (claims?.length) setFactClaimsBySection(prev => ({ ...prev, [t.key]: claims }));
          } catch (error: any) {
            if (isAbortError(error)) throw error;
            setSubsectionContents(prev => ({ ...prev, [t.key]: "[Error generating this section]" }));
          } finally {
            setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          }
        },
        writingSignal
      );

      // 유저 개입 없이 자동 2차 패스(보수적 사실 안정화)
      // 주의: 웹검색이 없으므로 "검증"이 아니라 "단정/수치/인용 환각 제거/완화"에 초점을 둡니다.
      await autoFactCheckPass(writingSignal);

      if (testMode) {
        setProgress(prev => ({ ...prev, status: 'test-complete' }));
        setShowFeedbackInput(true);
      } else {
        setProgress(prev => ({ ...prev, status: 'done' }));
        setStep('done');
      }
    } catch (e: any) {
      if (isAbortError(e)) {
        setProgress(prev => ({ ...prev, status: 'stopped' }));
      } else {
        console.error("집필 실패:", e);
        setProgress(prev => ({ ...prev, status: 'stopped' }));
      }
    } finally {
      writingAbortRef.current = null;
    }
  };

  const resetWritingKeepOutline = () => {
    if (!window.confirm("목차는 유지하고, 본문/진행률만 초기화한 뒤 다시 집필하시겠습니까?")) return;
    if (writingAbortRef.current) {
      try { writingAbortRef.current.abort(); } catch {}
      writingAbortRef.current = null;
    }
    setSubsectionContents({});
    setFactClaimsBySection({});
    setProgress({ total: 0, current: 0, status: 'idle' });
    setIsTestMode(true);
    setIsAutoFactChecking(false);
    setAutoFactCheckProgress({ current: 0, total: 0, status: '' });
    setFactCheckMode('fast');
    setWritingFeedback('');
    setShowFeedbackInput(false);
    setIsFeedbackChatOpen(false);
    setFeedbackChatMessages([{ role: 'assistant', content: '샘플 원고를 보고 느낀 점을 알려주세요. (문체/구성/깊이/예시/독자 난이도 등)' }]);
    setFeedbackChatInput('');
    setIsFeedbackChatLoading(false);
    setStep('outline');
  };

  const resumeDeepWriting = async () => {
    if (!bookStructure) return;
    // 이미 집필이 돌고 있으면 중지 후 이어쓰기
    if (writingAbortRef.current) {
      try { writingAbortRef.current.abort(); } catch {}
    }
    writingAbortRef.current = new AbortController();
    const writingSignal = writingAbortRef.current.signal;

    setStep('writing');
    setProgress((prev) => ({ ...prev, status: 'writing' }));

    const tonePrompt = getTonePrompt();
    const bookSummary = await callGemini(
      `다음 책 구조의 전체 핵심 내용을 500자로 요약하세요:\n${JSON.stringify(bookStructure)}`,
      "",
      writingSignal
    );

    const isGoodContent = (v: any) => typeof v === 'string' && v.trim() !== '' && !v.startsWith('[Error');
    const alreadyCount = Object.values(subsectionContents).filter(isGoodContent).length;
    const totalAll = bookStructure.chapters.reduce((acc, ch) => acc + (ch.subsections?.length || 0), 0);
    setProgress({ total: totalAll, current: alreadyCount, status: 'writing' });

    try {
      const tasks: Array<{ chapter: any; sub: any; key: string; prompt: string }> = [];
      for (const chapter of bookStructure.chapters) {
        for (const sub of (chapter.subsections || [])) {
          const key = `${chapter.chapter_number}_${sub.sub_number}`;
          const existing = (subsectionContents as any)[key];
          if (isGoodContent(existing)) continue;
          const prompt = SYSTEM_PROMPTS.writer(bookStructure, chapter, sub, "", tonePrompt, bookSummary);
          tasks.push({ chapter, sub, key, prompt });
        }
      }

      await runConcurrent(
        tasks,
        WRITE_CONCURRENCY,
        async (t) => {
          try {
            const content = await callGemini(t.prompt, "", writingSignal);
            const { manuscript, claims } = extractFactsJson(content);
            setSubsectionContents(prev => ({ ...prev, [t.key]: manuscript }));
            if (claims?.length) setFactClaimsBySection(prev => ({ ...prev, [t.key]: claims }));
          } catch (error: any) {
            if (isAbortError(error)) throw error;
            setSubsectionContents(prev => ({ ...prev, [t.key]: "[Error generating this section]" }));
          } finally {
            setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          }
        },
        writingSignal
      );

      await autoFactCheckPass(writingSignal);

      setProgress(prev => ({ ...prev, status: 'done' }));
      setStep('done');
    } catch (e: any) {
      if (isAbortError(e)) {
        setProgress(prev => ({ ...prev, status: 'stopped' }));
      } else {
        console.error("이어쓰기 실패:", e);
        setProgress(prev => ({ ...prev, status: 'stopped' }));
      }
    } finally {
      writingAbortRef.current = null;
    }
  };

  const continueWritingWithFeedback = async () => {
    if (!writingFeedback.trim()) {
      alert('피드백을 입력해주세요.');
      return;
    }
    
    setShowFeedbackInput(false);
    setProgress(prev => ({ ...prev, status: 'writing' }));
    
    const tonePrompt = getTonePrompt();
    const bookSummary = await callGemini(
      `다음 책 구조의 전체 핵심 내용을 500자로 요약하세요:\n${JSON.stringify(bookStructure)}`
    );
    
    // 이미 작성된 챕터 제외
    const writtenChapters = new Set(
      Object.keys(subsectionContents).map(key => {
        const [chNum] = key.split('_');
        return parseInt(chNum);
      })
    );
    
    const remainingChapters = bookStructure.chapters.filter(ch => !writtenChapters.has(ch.chapter_number));
    
    let totalTasks = 0;
    remainingChapters.forEach(ch => totalTasks += ch.subsections.length);
    const currentProgress = Object.keys(subsectionContents).length;
    setProgress({ total: currentProgress + totalTasks, current: currentProgress, status: 'writing' });
    
    let overallContext = "";
    // 이미 작성된 챕터들의 요약 수집
    bookStructure.chapters.filter(ch => writtenChapters.has(ch.chapter_number)).forEach(ch => {
      overallContext += `\n\n챕터 ${ch.chapter_number} 요약: ${ch.subsections.map(s => s.title).join(', ')}`;
    });
    
    const tasks: Array<{ key: string; prompt: string }> = [];
    for (const chapter of remainingChapters) {
      for (const sub of (chapter.subsections || [])) {
        const key = `${chapter.chapter_number}_${sub.sub_number}`;
        const basePrompt = SYSTEM_PROMPTS.writer(bookStructure, chapter, sub, "", tonePrompt, bookSummary);
        const promptWithFeedback = `${basePrompt}\n\n[사용자 피드백]\n${writingFeedback}\n\n위 피드백을 반영하여 집필하세요.`;
        tasks.push({ key, prompt: promptWithFeedback });
      }
      overallContext += `\n\n챕터 ${chapter.chapter_number} 요약: ${chapter.subsections.map(s => s.title).join(', ')}`;
    }

    await runConcurrent(
      tasks,
      WRITE_CONCURRENCY,
      async (t) => {
        try {
          const content = await callGemini(t.prompt);
          const { manuscript, claims } = extractFactsJson(content);
          setSubsectionContents(prev => ({ ...prev, [t.key]: manuscript }));
          if (claims?.length) setFactClaimsBySection(prev => ({ ...prev, [t.key]: claims }));
        } catch (error: any) {
          if (isAbortError(error)) throw error;
          setSubsectionContents(prev => ({ ...prev, [t.key]: "[Error generating this section]" }));
        } finally {
          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }
      }
    );

    await autoFactCheckPass();
    
    setProgress(prev => ({ ...prev, status: 'done' }));
    setStep('done');
  };

  const getFullMarkdown = () => {
    if (!bookStructure) return "";
    let md = `# ${bookStructure.title}\n\n`;
    md += `> ${bookStructure.concept}\n\n`;
    md += `---\n\n`;
    bookStructure.chapters.forEach(ch => {
      md += `# Chapter ${ch.chapter_number}. ${ch.title}\n\n`;
      ch.subsections.forEach(sub => {
        const key = `${ch.chapter_number}_${sub.sub_number}`;
        const content = subsectionContents[key] || '';
        md += `## ${sub.title}\n\n${content}\n\n`;
      });
      md += `---\n`;
    });
    return md;
  };

  const downloadBook = () => {
    const blob = new Blob([getFullMarkdown()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookStructure.title}.md`;
    a.click();
  };



  return (
    <div className={`min-h-screen font-ui flex flex-col transition-colors duration-500 ${theme.text}`}>
      {/* Keep page scroll enabled, but ensure the viewport background always matches the selected theme */}
      <div className={`fixed inset-0 -z-50 ${theme.bg}`} />
      {/* Print Styles Global */}
      <style>{`@media print { body * { visibility: hidden; } #printable-area, #printable-area * { visibility: visible; } #printable-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 2cm; } header, .sidebar-panel { display: none !important; } @page { margin: 2cm; size: auto; } }`}</style>


      {/* Cover Concepts Modal */}
      {isCoverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className={`w-full max-w-3xl rounded-xl shadow-2xl border overflow-hidden ${theme.panel} ${theme.border}`}>
            <div className={`p-4 border-b flex items-center justify-between ${theme.border}`}>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <ImageIcon size={18} className={theme.accent} /> 표지 컨셉 3안
                </h3>
                <p className="text-xs opacity-70 mt-1">하나를 선택하면 즉시 이미지를 생성해서 붙여드립니다. (Gemini 3 Pro Image Preview)</p>
              </div>
              <button
                onClick={() => setIsCoverModalOpen(false)}
                className="p-2 rounded hover:bg-black/10"
                title="닫기"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {!coverConcepts ? (
                <div className="p-6 text-sm opacity-70">
                  아직 컨셉이 없습니다. 왼쪽에서 <b>표지</b> 버튼을 눌러 컨셉을 생성하세요.
                </div>
              ) : (
                <>
                  {/* Audit summary */}
                  <div className={`p-3 rounded-lg border ${theme.border} ${theme.bg}`}>
                    <div className="text-sm font-bold mb-2">STEP 1~2 요약</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs opacity-80">
                      <div>
                        <div className="font-bold mb-1">시장/페르소나</div>
                        <div className="whitespace-pre-wrap">{coverConcepts.auditKorean?.market}</div>
                      </div>
                      <div>
                        <div className="font-bold mb-1">경쟁/트렌드</div>
                        <div className="whitespace-pre-wrap">{coverConcepts.auditKorean?.competition}</div>
                      </div>
                      <div>
                        <div className="font-bold mb-1">방향성</div>
                        <div className="whitespace-pre-wrap">{coverConcepts.auditKorean?.direction}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {coverConcepts.options?.map((opt) => (
                      <div key={opt.id} className={`rounded-xl border overflow-hidden ${theme.border} ${theme.bg}`}>
                        <div className={`p-3 border-b ${theme.border} flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${theme.panel} ${theme.border} border`}>
                              Option {opt.id}
                            </span>
                            <span className="font-bold text-sm">{opt.conceptName}</span>
                          </div>
                          {coverConcepts.recommendedId === opt.id && (
                            <span className="text-[11px] font-bold text-green-400">추천</span>
                          )}
                        </div>
                        <div className="p-3 space-y-2">
                          <p className="text-xs opacity-80 whitespace-pre-wrap">{opt.intentKorean}</p>
                          <div className="text-[11px] opacity-70 space-y-1">
                            <div><b>타이포</b>: {opt.typography}</div>
                            <div><b>톤</b>: {opt.toneAndManner}</div>
                            <div><b>물성</b>: {opt.materiality}</div>
                            <div><b>엣지</b>: {opt.edge}</div>
                          </div>
                          <button
                            onClick={() => generateCoverImageFromConcept(opt)}
                            disabled={generatingCover && generatingCoverOptionId !== opt.id}
                            className={`w-full mt-2 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${theme.button} disabled:opacity-50`}
                          >
                            {(generatingCover && generatingCoverOptionId === opt.id)
                              ? <Loader2 className="animate-spin" size={16} />
                              : <Sparkles size={16} />}
                            이 컨셉으로 생성
                          </button>
                          <details className="mt-2">
                            <summary className="text-xs opacity-70 cursor-pointer">Used Prompt 보기</summary>
                            <div className={`mt-2 p-2 text-[11px] rounded border ${theme.border} whitespace-pre-wrap`}>
                              {opt.promptEnglish}
                            </div>
                          </details>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`border-b py-2 px-4 flex items-center justify-between sticky top-0 z-20 print:hidden ${theme.panel} ${theme.border}`}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg blur-sm opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-1.5 rounded-lg">
              <BookOpen className="text-white" size={18} />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className={`text-lg font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent tracking-tight`}>
              Book Smith
            </h1>
            <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">Publisher × AI</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Project Selector */}
          <div className="relative project-selector">
            <button
              onClick={() => setShowProjectSelector(!showProjectSelector)}
              className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${theme.border} hover:bg-black/5`}
            >
              <File size={12} />
              {currentProjectId && projects.find(p => p.id === currentProjectId)?.name || '프로젝트 선택'}
              <ChevronDown size={10} />
            </button>
            {showProjectSelector && (
              <div className={`absolute top-full right-0 mt-2 w-64 rounded-lg shadow-xl border z-50 ${theme.panel} ${theme.border}`}>
                <div className={`p-2 border-b ${theme.border}`}>
                  <button
                    onClick={createNewProject}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold ${theme.button} hover:opacity-90`}
                  >
                    <PlusCircle size={16} /> 새 프로젝트
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {projects.length === 0 ? (
                    <div className="p-4 text-center text-sm opacity-60">프로젝트가 없습니다</div>
                  ) : (
                    projects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-2 border-b last:border-b-0 ${theme.border} ${currentProjectId === project.id ? 'bg-indigo-500/10' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          {editingProjectId === project.id ? (
                            <div className="flex-1 flex items-center gap-1">
                              <input
                                type="text"
                                value={editingProjectName}
                                onChange={(e) => setEditingProjectName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveProjectName(project.id);
                                  } else if (e.key === 'Escape') {
                                    cancelEditingProject();
                                  }
                                }}
                                onBlur={() => saveProjectName(project.id)}
                                autoFocus
                                className={`flex-1 px-2 py-1 text-sm rounded border ${theme.border} ${theme.input} ${theme.text} outline-none`}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => switchProject(project.id)}
                                className="flex-1 text-left px-2 py-1 rounded hover:bg-black/5"
                              >
                                <div className="font-semibold text-sm">{project.name}</div>
                                <div className="text-xs opacity-60">
                                  {new Date(project.updatedAt).toLocaleDateString('ko-KR', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingProject(project.id, project.name);
                                  }}
                                  className="p-1 rounded hover:bg-indigo-500/20 text-indigo-500"
                                  title="이름 변경"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => deleteProject(project.id)}
                                  className="p-1 rounded hover:bg-red-500/20 text-red-500"
                                  title="삭제"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleReset}
            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200 text-red-500 hover:bg-red-50`}
          >
            <RefreshCw size={12} /> 프로젝트 초기화
          </button>
          <div className="relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${theme.text}`}
              title="Change Theme"
            >
              <Palette size={16} />
            </button>
            {showThemeSelector && (
              <div className={`absolute right-0 top-10 w-40 rounded-lg shadow-xl border overflow-hidden z-30 ${theme.panel} ${theme.border}`}>
                {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map(k => (
                  <button key={k} onClick={() => { setCurrentTheme(k); setShowThemeSelector(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-black/10 flex items-center gap-2 ${theme.text}`}>
                    <div className={`w-3 h-3 rounded-full ${THEMES[k].bg} border border-slate-400`}></div>
                    {THEMES[k].name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-80 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 transition-all duration-500">

        {/* Left Panel */}
        <div
          ref={leftPanelOuterRef}
          className={`sidebar-panel flex flex-col h-[calc(100vh-100px)] gap-4 transition-all duration-500 ${step === 'interview'
          ? 'lg:col-span-12 max-w-3xl mx-auto w-full'
          : 'lg:col-span-5'
          } ${step === 'done' ? 'hidden lg:flex' : ''}`}
        >
          <div className={`flex justify-between p-3 rounded-lg border text-xs font-mono ${theme.panel} ${theme.border} opacity-70`}>
            <span className={step === 'interview' ? 'font-bold underline' : ''}>1.Design</span>
            <span className={step === 'outline' ? 'font-bold underline' : ''}>2.Structure</span>
            <span className={step === 'writing' ? 'font-bold underline' : ''}>3.Deep Write</span>
          </div>

          {step === 'interview' && (
            <div className={`flex-1 rounded-xl border shadow-xl flex flex-col overflow-hidden ${theme.panel} ${theme.border}`}>
              <div className={`p-4 border-b flex justify-between items-center ${theme.border} bg-black/5`}>
                <h2 className="font-semibold flex items-center gap-2">
                  <User size={18} className={theme.accent} />
                  기획 인터뷰
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.filter(m => m.role !== 'system').map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? `${theme.button} text-white rounded-tr-none`
                        : currentTheme === 'midnight' 
                          ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none' 
                          : currentTheme === 'deepSpace'
                            ? 'bg-gray-900 text-gray-200 border border-gray-800 rounded-tl-none'
                            : `${theme.panel} ${theme.text} border ${theme.border} rounded-tl-none`
                    }`}>
                      <span className={currentTheme === 'midnight' ? 'text-slate-100' : currentTheme === 'deepSpace' ? 'text-gray-200' : ''}>
                        {msg.role === 'user' ? msg.content : (renderMarkdown(msg.content) || msg.content)}
                      </span>
                    </div>
                  </div>
                ))}
                {/* Custom Tone Selector Embedded for Interview Phase */}
                {showToneSelector && (
                  <div className="animate-fade-in">
                    <ToneSelector
                      toneSettings={toneSettings}
                      setToneSettings={setToneSettings}
                      theme={theme}
                      TONE_FACTORS={TONE_FACTORS}
                      onClose={() => setShowToneSelector(false)}
                    />
                    <button 
                      onClick={() => setShowToneSelector(false)} 
                      className={`w-full mt-4 py-3 px-4 rounded-lg font-bold text-sm shadow-lg transition-all hover:scale-105 ${theme.button} text-white`}
                    >
                      설정 완료 (채팅 계속하기)
                    </button>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className={`p-3 border-t ${theme.border} ${theme.bg}`}>
                {readyForOutline ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 pb-1">
                      <label className="flex items-center gap-2 text-sm cursor-pointer opacity-80 hover:opacity-100">
                        <input
                          type="checkbox"
                          checked={includeIntroOutro}
                          onChange={(e) => setIncludeIntroOutro(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        서문/결문 포함 (Prologue & Epilogue)
                      </label>
                    </div>
                    <button
                      onClick={generateOutline}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 animate-pulse"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <Layers />}
                      심층 목차 생성하기
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={loading}
                      placeholder="답변을 입력하세요..."
                      className={`flex-1 border rounded-lg px-4 py-2 focus:border-indigo-500 outline-none ${theme.input} ${theme.border} ${theme.text}`}
                    />
                    <button onClick={handleSendMessage} disabled={loading} className={`p-2 rounded-lg text-white ${theme.button}`}>
                      <Send size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'outline' && bookStructure && (
            <div className={`flex-1 rounded-xl border shadow-xl flex flex-col overflow-hidden relative ${theme.panel} ${theme.border}`}>
              {modifyingNode && (
                <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                  <div className={`w-full max-w-md rounded-xl shadow-2xl p-6 ${theme.panel} ${theme.border} border`}>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Wand2 className={theme.accent} size={20} /> AI 구조 변경
                    </h3>
                    <p className="text-sm opacity-70 mb-2">
                      {modifyingNode.type === 'chapter' ? '챕터' : '소제목'} 내용을 어떻게 바꿀까요?
                    </p>
                    <textarea
                      value={modificationInput}
                      onChange={(e) => setModificationInput(e.target.value)}
                      className={`w-full h-24 border rounded p-2 text-sm mb-4 outline-none focus:ring-1 focus:ring-indigo-500 ${theme.input} ${theme.border} ${theme.text}`}
                      placeholder="예: '경제학적 관점으로 다시 써줘' 또는 '제목을 더 자극적으로 바꿔줘'"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModifyingNode(null)} className="px-4 py-2 rounded text-sm hover:bg-black/10">취소</button>
                      <button onClick={submitModification} disabled={loading} className={`px-4 py-2 rounded text-sm text-white flex items-center gap-2 ${theme.button}`}>
                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />} 적용하기
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className={`p-4 border-b flex justify-between items-center ${theme.border}`}>
                <div>
                  <h2 className="font-bold text-lg">구조 설계 확인</h2>
                  <p className="text-xs opacity-60">챕터 삭제 및 AI 수정이 가능합니다.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={generateCoverConcepts}
                    disabled={coverConceptsLoading || generatingCover}
                    className="bg-indigo-800 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    {(coverConceptsLoading || generatingCover) ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} />}
                    표지 컨셉
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startDeepWriting(true)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border ${theme.border} hover:bg-black/5 flex items-center gap-2`}
                    >
                      <Cpu size={14} /> 테스트 집필 (서문+2챕터)
                    </button>
                    <button
                      onClick={() => startDeepWriting(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 ${theme.button}`}
                    >
                      <Cpu size={16} /> 전체 집필 시작
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                <div className={`p-3 rounded border mb-4 ${theme.bg} ${theme.border}`}>
                  <label className="text-xs opacity-50 block mb-1">책 제목</label>
                  <input
                    value={bookStructure.title}
                    onChange={(e) => setBookStructure({ ...bookStructure, title: e.target.value })}
                    className="w-full bg-transparent text-lg font-bold outline-none"
                  />
                </div>
                {bookStructure.chapters.map((ch, chIdx) => (
                  <div key={chIdx} className={`border rounded-lg overflow-hidden ${theme.border} bg-black/5`}>
                    <div className="flex items-center gap-2 p-3 cursor-pointer select-none hover:bg-black/5 group">
                      <div onClick={() => toggleChapter(chIdx)} className="flex items-center gap-2 flex-1">
                        {expandedChapters[chIdx] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${theme.bg} ${theme.accent}`}>CH.{ch.chapter_number}</span>
                        <span className="font-semibold text-sm truncate">{ch.title}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModificationModal('chapter', chIdx)} className="p-1.5 hover:bg-indigo-500/20 rounded text-indigo-400" title="AI 수정"><Wand2 size={14} /></button>
                        <button onClick={() => handleDeleteNode('chapter', chIdx)} className="p-1.5 hover:bg-red-500/20 rounded text-red-400" title="삭제"><Trash2 size={14} /></button>
                      </div>
                    </div>

                    {expandedChapters[chIdx] && (
                      <div className={`p-2 space-y-2 border-t ${theme.border} ${theme.bg}`}>
                        {ch.subsections.map((sub, subIdx) => (
                          <div key={subIdx} className="flex gap-2 pl-4 relative group items-start">
                            <div className={`absolute left-1 top-3 w-2 h-2 border-l border-b ${theme.border} rounded-bl`}></div>
                            <div className="flex-1">
                              <input
                                value={sub.title}
                                onChange={(e) => updateSubsection(chIdx, subIdx, 'title', e.target.value)}
                                className="w-full bg-transparent text-sm outline-none border-b border-transparent hover:border-slate-600 mb-1"
                              />
                              <textarea
                                value={sub.detail}
                                onChange={(e) => updateSubsection(chIdx, subIdx, 'detail', e.target.value)}
                                className={`w-full text-xs p-2 rounded resize-none outline-none h-16 opacity-70 focus:opacity-100 ${theme.input}`}
                                placeholder="내용 가이드..."
                              />
                            </div>
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openModificationModal('subsection', cIdx, subIdx)} className="p-1 hover:bg-indigo-500/20 rounded text-indigo-400"><Wand2 size={12} /></button>
                              <button onClick={() => handleDeleteNode('subsection', cIdx, subIdx)} className="p-1 hover:bg-red-500/20 rounded text-red-400"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(step === 'writing' || step === 'done' || progress.status === 'test-complete') && (
            <div className={`flex-1 rounded-xl border p-4 flex flex-col ${theme.panel} ${theme.border}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  {progress.status === 'writing' ? <RefreshCw className="animate-spin text-indigo-400" /> : progress.status === 'test-complete' ? <CheckCircle className="text-amber-500" /> : <CheckCircle className="text-green-500" />}
                  {progress.status === 'test-complete' ? '테스트 집필 완료' : '집필 진행률'}
                </h3>
                <div className="flex items-center gap-2">
                  {(step === 'writing' && progress.status === 'writing') && (
                    <button
                      onClick={() => {
                        if (writingAbortRef.current) writingAbortRef.current.abort();
                      }}
                      className="px-2.5 py-1 rounded text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50"
                      title="집필 중지"
                    >
                      중지
                    </button>
                  )}
                  {(step === 'writing' || progress.status === 'stopped') && (
                    <button
                      onClick={resumeDeepWriting}
                      className={`px-2.5 py-1 rounded text-xs font-bold border ${theme.border} hover:bg-black/5`}
                      title="이미 생성된 섹션은 유지하고, 비어있는 섹션만 이어서 생성합니다."
                    >
                      이어쓰기
                    </button>
                  )}
                  {bookStructure && (
                    <button
                      onClick={resetWritingKeepOutline}
                      className={`px-2.5 py-1 rounded text-xs font-bold border ${theme.border} hover:bg-black/5`}
                      title="목차는 유지하고 본문/진행률만 초기화합니다."
                    >
                      본문만 초기화
                    </button>
                  )}
                  <button
                    onClick={generateCoverConcepts}
                    disabled={coverConceptsLoading || generatingCover}
                    className="bg-indigo-800 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                  >
                    {(coverConceptsLoading || generatingCover) ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} />}
                    표지(컨셉 선택)
                  </button>
                </div>
              </div>

              {/* Fact-check mode selector (good for future billing gates) */}
              <div className={`mb-4 p-3 rounded-lg border ${theme.border} ${theme.bg}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold opacity-80">팩트체크 모드</div>
                    <div className="text-[11px] opacity-60">
                      OFF / 빠름(웹 없이) / 정확(웹 검색+출처)
                    </div>
                  </div>
                  <select
                    value={factCheckMode}
                    onChange={(e) => setFactCheckMode(e.target.value as any)}
                    className={`text-xs rounded-lg px-2 py-1 border outline-none ${theme.input} ${theme.border} ${theme.text}`}
                    title="정확(웹 검색+출처)은 느리고 비용이 들 수 있어, 향후 유료 옵션으로 두기 좋습니다."
                  >
                    <option value="off">OFF</option>
                    <option value="fast">빠름(웹 없이)</option>
                    <option value="web">정확(웹 검색+출처)</option>
                  </select>
                </div>
                {isAutoFactChecking && (
                  <div className="mt-3 text-[11px] opacity-70 flex items-center justify-between">
                    <span>{autoFactCheckProgress.status}</span>
                    <span>{autoFactCheckProgress.total > 0 ? `${autoFactCheckProgress.current}/${autoFactCheckProgress.total}` : ''}</span>
                  </div>
                )}
              </div>

              {showRecoveryBanner && (step === 'writing' || progress.status === 'stopped') && (
                <div className={`mb-4 p-3 rounded-lg border ${theme.border} ${theme.bg}`}>
                  <div className="text-sm font-bold mb-1">중단된 집필을 감지했어요</div>
                  <div className="text-xs opacity-70">
                    브라우저 새로고침/이동 등으로 집필이 멈춘 상태로 보입니다. 아래에서 복구할 수 있어요.
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setShowRecoveryBanner(false);
                        resumeDeepWriting();
                      }}
                      className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${theme.button}`}
                    >
                      <Cpu size={16} /> 이어쓰기
                    </button>
                    <button
                      onClick={() => {
                        setShowRecoveryBanner(false);
                        resetWritingKeepOutline();
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-bold border ${theme.border} hover:bg-black/5`}
                    >
                      본문만 초기화
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-2 flex justify-between text-xs opacity-70">
                <span>Progress</span>
                <span>{progress.total > 0 ? `${Math.round((progress.current / progress.total) * 100)}%` : '0%'} ({progress.current}/{progress.total} sections)</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2.5 mb-6 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${progress.status === 'test-complete' ? 'bg-amber-500' : 'bg-indigo-500'}`}
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                ></div>
              </div>
              {canShowDetailedToc && (
                <div className="mb-4 relative">
                  <div className={`rounded-lg border overflow-hidden ${theme.border} ${theme.bg}`}>
                    <button
                      onClick={toggleDetailedToc}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold hover:bg-black/5"
                      title="집필 완료 후에도 세부 목차(소제목)를 다시 확인할 수 있어요."
                    >
                      <span className="flex items-center gap-2">
                        {showDetailedToc ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        세부 목차 {showDetailedToc ? '숨기기' : '보기'}
                      </span>
                      <span className="text-[11px] opacity-60 font-normal">클릭하면 우측 원고로 이동</span>
                    </button>
                  </div>

                  {showDetailedToc && (
                    <div
                      className={`absolute left-0 right-0 top-full mt-2 rounded-lg border shadow-xl z-30 ${theme.panel} ${theme.border}`}
                    >
                      <div className="max-h-[45vh] overflow-y-auto p-2 space-y-2">
                        {bookStructure.chapters.map((ch: any, chIdx: number) => (
                          <div key={ch.chapter_number} className={`rounded-lg border ${theme.border} bg-black/5 overflow-hidden`}>
                            <button
                              onClick={() => toggleTocChapter(chIdx)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-black/5"
                            >
                              {tocExpandedChapters[chIdx] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${theme.bg} ${theme.accent}`}>CH.{ch.chapter_number}</span>
                              <span className="text-sm font-semibold truncate">{ch.title}</span>
                            </button>
                            {tocExpandedChapters[chIdx] && (
                              <div className={`p-2 border-t ${theme.border} ${theme.bg}`}>
                                <div className="space-y-1">
                                  {ch.subsections.map((sub: any) => {
                                    const key = `${ch.chapter_number}_${sub.sub_number}`;
                                    const hasContent = !!subsectionContents[key];
                                    return (
                                      <button
                                        key={sub.sub_number}
                                        onClick={() => jumpToSection(ch.chapter_number, sub.sub_number)}
                                        className={`w-full flex items-start gap-2 px-2 py-1.5 rounded text-left text-xs hover:bg-black/5`}
                                        title={sub.detail || sub.title}
                                      >
                                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${hasContent ? 'bg-green-500' : 'bg-slate-500'}`} />
                                        <span className="opacity-70 font-mono shrink-0">{sub.sub_number.toString().padStart(2, '0')}</span>
                                        <span className="flex-1 leading-snug">{sub.title}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={leftProgressScrollRef} className={`flex-1 overflow-y-auto space-y-2 border-t pt-4 ${theme.border}`}>
                {bookStructure.chapters.map(ch => {
                  const isActiveCh = activeSectionKey ? activeSectionKey.startsWith(`${ch.chapter_number}_`) : false;
                  return (
                  <div
                    key={ch.chapter_number}
                    id={`left-ch-${ch.chapter_number}`}
                    className={`text-sm rounded-md px-2 py-1 transition-colors ${isActiveCh ? 'bg-indigo-500/10' : ''}`}
                  >
                    <div className={`font-bold mb-1 flex items-center justify-between ${isActiveCh ? 'opacity-100' : 'opacity-60'}`}>
                      <span>CH.{ch.chapter_number} {ch.title}</span>
                      {isActiveCh && <span className="text-[11px] opacity-60">읽는 중</span>}
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {ch.subsections.map(sub => {
                        const key = `${ch.chapter_number}_${sub.sub_number}`;
                        const hasContent = !!subsectionContents[key];
                        return (
                          <div
                            key={sub.sub_number}
                            className={`h-1.5 rounded-sm transition-colors ${hasContent ? 'bg-green-500' : 'bg-slate-700 animate-pulse'}`}
                            title={sub.title}
                          />
                        )
                      })}
                    </div>
                  </div>
                )})}
              </div>
              {/* 피드백 입력 UI (테스트 모드 완료 후) */}
              {progress.status === 'test-complete' && showFeedbackInput && (
                <div className={`mt-4 p-4 rounded-lg border ${theme.border} ${theme.panel}`}>
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <Sparkles size={14} className="text-indigo-500" /> 테스트 집필 완료
                  </h4>
                  <p className="text-xs opacity-70 mb-3">
                    서문과 처음 2개 챕터가 생성되었습니다. 피드백을 입력하시면 나머지 집필에 반영됩니다.
                  </p>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setIsFeedbackChatOpen(true)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border ${theme.border} hover:bg-black/5 flex items-center gap-2`}
                    >
                      <User size={14} /> 피드백 대화로 조율
                    </button>
                    <button
                      onClick={() => setFeedbackChatMessages([{ role: 'assistant', content: '샘플 원고를 보고 느낀 점을 알려주세요. (문체/구성/깊이/예시/독자 난이도 등)' }])}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border ${theme.border} hover:bg-black/5`}
                      title="피드백 대화 초기화"
                    >
                      초기화
                    </button>
                  </div>
                  <textarea
                    value={writingFeedback}
                    onChange={(e) => setWritingFeedback(e.target.value)}
                    placeholder="예: 문체가 너무 딱딱해요. 좀 더 친근하게 써주세요.&#10;또는: 예시를 더 많이 넣어주세요.&#10;또는: 톤을 좀 더 격려하는 느낌으로 바꿔주세요."
                    className={`w-full p-3 rounded-lg text-sm min-h-[120px] resize-y ${theme.input} ${theme.border} ${theme.text} outline-none`}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={continueWritingWithFeedback}
                      disabled={!writingFeedback.trim()}
                      className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${theme.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Cpu size={16} /> 피드백 반영하여 나머지 집필
                    </button>
                    <button
                      onClick={() => {
                        setShowFeedbackInput(false);
                        setProgress(prev => ({ ...prev, status: 'done' }));
                        setStep('done');
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-bold border ${theme.border} hover:bg-black/5`}
                    >
                      피드백 없이 완료
                    </button>
                  </div>
                </div>
              )}

              {/* 피드백 대화 모달 */}
              {isFeedbackChatOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                  <div className={`w-full max-w-2xl rounded-xl shadow-2xl border overflow-hidden ${theme.panel} ${theme.border}`}>
                    <div className={`p-3 border-b flex items-center justify-between ${theme.border}`}>
                      <div className="font-bold text-sm flex items-center gap-2">
                        <User size={16} className={theme.accent} /> 피드백 대화
                      </div>
                      <button
                        onClick={() => setIsFeedbackChatOpen(false)}
                        className="p-2 rounded hover:bg-black/10"
                        title="닫기"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                      {feedbackChatMessages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                            ? `${theme.button} text-white rounded-tr-none`
                            : `${theme.panel} ${theme.text} rounded-tl-none border ${theme.border}`
                            }`}>
                            {renderMarkdown(m.content) || m.content}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={`p-3 border-t ${theme.border} ${theme.bg}`}>
                      <div className="flex gap-2">
                        <input
                          value={feedbackChatInput}
                          onChange={(e) => setFeedbackChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendFeedbackChat()}
                          disabled={isFeedbackChatLoading}
                          placeholder="피드백을 적고 Enter..."
                          className={`flex-1 border rounded-lg px-3 py-2 outline-none ${theme.input} ${theme.border} ${theme.text}`}
                        />
                        <button
                          onClick={sendFeedbackChat}
                          disabled={isFeedbackChatLoading || !feedbackChatInput.trim()}
                          className={`px-3 py-2 rounded-lg text-white font-bold ${theme.button} disabled:opacity-50`}
                        >
                          {isFeedbackChatLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                        </button>
                        <button
                          onClick={finalizeFeedbackFromChat}
                          disabled={isFeedbackChatLoading || feedbackChatMessages.length < 2}
                          className={`px-3 py-2 rounded-lg font-bold border ${theme.border} hover:bg-black/5 disabled:opacity-50`}
                          title="대화 내용을 지침으로 확정"
                        >
                          확정
                        </button>
                      </div>
                      <div className="mt-2 text-[11px] opacity-70">
                        팁: 여러 번 왔다갔다 한 뒤 <b>확정</b>을 누르면, 현재 대화를 집필 지침으로 요약해 자동 반영합니다.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 'done' && (
                <div className="space-y-2 mt-4">
                  <button
                    onClick={() => setIsFactCheckModalOpen(true)}
                    className={`w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border ${theme.border} hover:bg-black/5`}
                    title="검증이 필요한 주장(숫자/연도/인용/연구결과 등)을 모아서 검색/수정할 수 있어요."
                  >
                    <Sliders size={16} /> 팩트체크 (검증 필요 항목 보기)
                  </button>
                  <button onClick={downloadBook} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                    <FileText size={16} /> 마크다운 (.md) 다운로드
                  </button>
                  <button
                    onClick={handleExportEPUB}
                    disabled={exporting}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${theme.button}`}
                  >
                    {exporting ? <Loader2 className="animate-spin" size={18} /> : <BookOpen size={18} />} EPUB2 전자책 출판하기
                  </button>
                  <button
                    onClick={handleExportDOCX}
                    disabled={exporting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                  >
                    {exporting ? <Loader2 className="animate-spin" size={16} /> : <File size={16} />} 워드 (.docx) 저장
                  </button>
                  <button onClick={handlePrintPDF} className="w-full bg-white text-slate-900 hover:bg-slate-100 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                    <Printer size={16} /> 인쇄 / PDF 저장
                  </button>
                </div>
              )}

              {/* Polishing UI */}
              {(step === 'done' || step === 'writing') && (
                <div className={`mt-4 border-t pt-4 ${theme.border}`}>
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" /> 전체 윤문 (Polishing)
                  </h4>
                  <p className="text-xs opacity-70 mb-3">
                    앞 챕터의 내용을 바탕으로 뒤 챕터를 다듬어, 책 전체의 연결성과 일관성을 높입니다.
                  </p>

                  {isPolishing ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs items-end">
                        <span className="font-bold text-amber-600 animate-pulse">{polishStatus}</span>
                        <span>{Math.round((polishProgress.current / polishProgress.total) * 100)}%</span>
                      </div>
                      <div className="w-full bg-black/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-amber-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(polishProgress.current / polishProgress.total) * 100}%` }}></div>
                      </div>
                      <button
                        onClick={handleStopPolish}
                        className="w-full py-1 text-xs text-red-500 border border-red-200 rounded hover:bg-red-50 transition-colors"
                      >
                        작업 중지
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSequentialPolish}
                      disabled={loading || isPolishing}
                      className={`w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border transition-colors ${theme.button === 'bg-slate-900 text-white' ? 'bg-amber-600 text-white border-transparent hover:bg-amber-700' : 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200'}`}
                    >
                      <Wand2 size={14} /> 순차적 윤문 시작하기
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Preview Area */}
        {step !== 'interview' && (
          <div
            ref={rightPanelOuterRef}
            className={`lg:col-span-7 rounded-xl shadow-2xl flex flex-col overflow-hidden border ${theme.previewBg} ${theme.border} ${theme.previewText} animate-fade-in`}
            style={syncedPanelHeightPx ? { height: `${syncedPanelHeightPx}px`, maxHeight: `${syncedPanelHeightPx}px` } : { height: 'calc(100vh - 100px)', maxHeight: 'calc(100vh - 100px)' }}
          >
            <div className={`p-4 border-b flex justify-between items-center sticky top-0 z-10 print:hidden ${theme.border} bg-opacity-90 backdrop-blur ${theme.previewBg}`}>
              <div className="flex items-center gap-2">
                <FileText size={18} className="opacity-50" />
                <span className="font-serif font-bold">Manuscript Preview</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono opacity-50">
                {step === 'done' && (
                  <button onClick={handlePrintPDF} className="flex items-center gap-1 hover:text-indigo-600">
                    <Printer size={14} /> Print/PDF
                  </button>
                )}
                <span>|</span>
                <span>A4 {Math.round(progress.current * 0.8)} pages est.</span>
              </div>
            </div>

            <div
              id="printable-area"
              ref={previewScrollRef}
              className={`flex-1 overflow-y-auto px-16 py-14 pb-32 print:p-0 print:overflow-visible ${theme.previewText} font-book`}
            >
              {bookStructure ? (
                <div className="max-w-3xl mx-auto space-y-12 print:max-w-none">
                  {coverImage && (
                    <div className="mb-12 print:break-after-page flex flex-col items-center">
                      <div
                        className="shadow-2xl rounded overflow-hidden w-80 md:w-[420px] border-8 border-white relative"
                        style={{ aspectRatio: '2 / 3' }} // Book cover ratio
                      >
                        <img 
                          src={coverImage} 
                          alt="Book Cover" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("이미지 로딩 실패:", e);
                            alert("표지 이미지를 표시할 수 없습니다. 이미지가 손상되었거나 너무 클 수 있습니다.");
                            setCoverImage(null);
                          }}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}

                  <div className={`text-center py-24 border-b-2 mb-12 print:py-12 print:break-after-page ${theme.border}`}>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">{bookStructure.title}</h1>
                    <p className="text-2xl italic font-serif opacity-70">{bookStructure.concept}</p>
                    <div className={`mt-8 flex justify-center gap-2 opacity-50 text-xs font-sans font-bold uppercase tracking-widest ${theme.accent}`}>
                      <span>Written by AI Book Smith</span>
                      <span>•</span>
                      <span>{TONE_FACTORS.roles.find(r => r.id === toneSettings.role).label}</span>
                    </div>
                  </div>

                  {bookStructure.chapters.map((ch) => (
                    <div key={ch.chapter_number} className="chapter-block print:break-before-page">
                      <div className="mb-16 mt-8 text-center">
                        <span className={`inline-block text-xs font-bold tracking-[0.3em] uppercase opacity-40 border-b pb-2 mb-4 ${theme.border}`}>Chapter {ch.chapter_number}</span>
                        <h2 className="text-4xl font-serif font-bold">{ch.title}</h2>
                      </div>

                      {ch.subsections.map((sub) => {
                        const key = `${ch.chapter_number}_${sub.sub_number}`;
                        const content = subsectionContents[key];
                        const isEditingThis = editingSection?.key === key;

                        return (
                          <div
                            key={sub.sub_number}
                            id={`section-${key}`}
                            className="mb-12 subsection-block relative group scroll-mt-24"
                          >
                            <h3 className="text-xl font-serif font-bold opacity-90 mb-6 flex items-center gap-3 mt-8">
                              <span className={`text-2xl font-normal select-none opacity-30 ${theme.accent}`}>§</span> {sub.title}
                            </h3>

                            {/* AI Edit Toolbar - Always visible with low opacity, full on hover */}
                            {content && !isEditingThis && (
                              <div className={`absolute right-0 top-0 opacity-50 hover:opacity-100 transition-opacity shadow-md rounded-lg border p-1 flex gap-1 print:hidden ${theme.previewBg} ${theme.border} bg-opacity-90 backdrop-blur`}>
                                <button onClick={() => handleAIEdit(key, "내용을 더 풍부하게 확장해줘")} className="p-2 hover:bg-black/5 rounded text-xs flex items-center gap-1" title="확장">
                                  <Wand2 size={14} />
                                </button>
                                <button onClick={() => handleAIEdit(key, "내용을 간결하게 요약해줘")} className="p-2 hover:bg-black/5 rounded text-xs flex items-center gap-1" title="요약">
                                  <FileText size={14} />
                                </button>
                                <button onClick={() => handleAIEdit(key, "문법과 문체를 매끄럽게 다듬어줘")} className="p-2 hover:bg-black/5 rounded text-xs flex items-center gap-1" title="윤문">
                                  <Sparkles size={14} />
                                </button>
                              </div>
                            )}

                            {isEditingThis ? (
                              <div className="p-8 border-2 border-indigo-100 rounded-lg bg-indigo-50/30 flex items-center justify-center gap-3 text-indigo-600 animate-pulse">
                                <Wand2 className="animate-bounce" /> AI가 문장을 다듬고 있습니다...
                              </div>
                            ) : content ? (
                              <div className="prose prose-lg max-w-none prose-p:leading-loose">
                                {renderMarkdown(content)}
                              </div>
                            ) : (
                              <div className="p-6 border border-dashed rounded text-center opacity-40 text-sm py-12 print:hidden">
                                집필 대기 중... ({sub.title})
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-4 print:hidden">
                  <BookOpen size={48} />
                  <p>왼쪽 패널에서 기획을 시작하면<br />여기에 원고가 실시간으로 표시됩니다.</p>
                </div>
              )}

              {/* Fact Check Modal */}
              {isFactCheckModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 print:hidden">
                  <div className={`w-full max-w-4xl rounded-xl shadow-2xl border overflow-hidden ${theme.panel} ${theme.border}`}>
                    <div className={`p-3 border-b flex items-center justify-between ${theme.border}`}>
                      <div className="font-bold text-sm flex items-center gap-2">
                        <Sliders size={16} className={theme.accent} /> 팩트체크(검증 필요 항목)
                      </div>
                      <button
                        onClick={() => setIsFactCheckModalOpen(false)}
                        className="p-2 rounded hover:bg-black/10"
                        title="닫기"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
                      {Object.keys(factClaimsBySection || {}).length === 0 ? (
                        <div className="text-sm opacity-70">
                          아직 수집된 검증 항목이 없습니다. (새로 생성된 원고부터 FACTS_JSON이 누적됩니다)
                        </div>
                      ) : (
                        Object.entries(factClaimsBySection)
                          .sort(([a], [b]) => a.localeCompare(b, 'en'))
                          .map(([key, claims]) => (
                            <div key={key} className={`rounded-lg border ${theme.border} ${theme.bg}`}>
                              <div className="flex items-center justify-between px-3 py-2 border-b border-black/10">
                                <div className="text-sm font-bold">
                                  섹션 {key} <span className="opacity-60 font-normal text-xs">({(claims as any[]).length}개)</span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => jumpToSection(parseInt(key.split('_')[0]), parseInt(key.split('_')[1]))}
                                    className={`px-2.5 py-1 rounded text-xs font-bold border ${theme.border} hover:bg-black/5`}
                                    title="우측 원고로 이동"
                                  >
                                    이동
                                  </button>
                                  <button
                                    onClick={() => handleFactCheckRewrite(key)}
                                    className={`px-2.5 py-1 rounded text-xs font-bold ${theme.button}`}
                                    title="검증이 어려운 단정 표현을 보수적으로 완화/수정합니다."
                                  >
                                    팩트체크 윤문
                                  </button>
                                </div>
                              </div>
                              <div className="p-3 space-y-2">
                                {(claims as any[]).slice(0, 50).map((c, idx) => {
                                  const q = (c?.suggested_query || c?.claim || '').toString();
                                  return (
                                    <div key={idx} className={`p-3 rounded border ${theme.border} bg-black/5`}>
                                      <div className="text-xs opacity-70 mb-1 flex items-center justify-between gap-2">
                                        <span>confidence: <b>{c?.confidence || 'unknown'}</b></span>
                                        <button
                                          onClick={() => openWebSearch(q)}
                                          className={`px-2 py-1 rounded text-[11px] font-bold border ${theme.border} hover:bg-black/5`}
                                          title="구글 검색 열기"
                                        >
                                          검색
                                        </button>
                                      </div>
                                      <div className="text-sm font-semibold mb-1">{c?.claim || '(claim 없음)'}</div>
                                      {(c?.note || '').toString().trim() && (
                                        <div className="text-xs opacity-70">{c.note}</div>
                                      )}
                                      {(c?.suggested_query || '').toString().trim() && (
                                        <div className="text-[11px] opacity-60 mt-2 font-mono">query: {c.suggested_query}</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                    <div className={`p-3 border-t ${theme.border} ${theme.bg} text-[11px] opacity-70`}>
                      팁: 자동 웹검색 API를 붙이면 “검색→근거 수집→검증 모델”까지 완전 자동화할 수 있어요. 지금은 원클릭 검색 + 보수적 재작성(MVP)입니다.
                    </div>
                  </div>
                </div>
              )}

              {/* Persona Chat Overlay Button */}
              {(step === 'writing' || step === 'done') && (
                <div className="absolute bottom-6 right-6 z-40 print:hidden">
                  <button
                    onClick={() => {
                      setShowPersonaChat(!showPersonaChat);
                      if (personaChatMessages.length === 0) {
                        setPersonaChatMessages([{ role: 'model', content: "안녕하세요! 집필하시느라 고생이 많으시네요. 어떤 점이 고민되시나요?" }]);
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl flex items-center gap-2 transition-transform hover:scale-105"
                  >
                    <User size={24} />
                    {showPersonaChat ? "대화 닫기" : "페르소나와 대화하기"}
                  </button>
                </div>
              )}

              {/* Persona Chat Window */}
              {showPersonaChat && (
                <div className="absolute bottom-20 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl border flex flex-col overflow-hidden z-50 animate-fade-in-up">
                  <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
                    <span className="font-bold text-sm flex items-center gap-2"><Sparkles size={14} /> AI 페르소나</span>
                    <button onClick={() => setShowPersonaChat(false)}><X size={16} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
                    {personaChatMessages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-2 rounded-lg text-sm ${m.role === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white border text-slate-800 rounded-bl-none shadow-sm'}`}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border p-2 rounded-lg rounded-bl-none shadow-sm">
                          <Loader2 className="animate-spin text-indigo-500" size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handlePersonaChat} className="p-2 border-t bg-white flex gap-2">
                    <input
                      type="text"
                      value={personaChatInput}
                      onChange={(e) => setPersonaChatInput(e.target.value)}
                      placeholder="메시지를 입력하세요..."
                      className="flex-1 text-sm border rounded px-2 py-1 outline-none focus:border-indigo-500"
                    />
                    <button type="submit" disabled={isChatLoading} className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50">
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}