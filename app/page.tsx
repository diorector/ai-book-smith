// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Send, Edit3, CheckCircle, FileText, Download, Cpu, Loader2, Settings, ChevronRight, ChevronDown, RefreshCw, Layers, User, Printer, File, Image as ImageIcon, Wand2, X, Sparkles, Trash2, Palette, Save, PlusCircle, Sliders } from 'lucide-react';
import ToneSelector from '@/components/ToneSelector';

// --- Constants & Options ---

const THEMES = {
  midnight: {
    name: 'Midnight',
    bg: 'bg-slate-900',
    text: 'text-slate-100',
    panel: 'bg-slate-800',
    border: 'border-slate-700',
    input: 'bg-slate-900',
    accent: 'text-indigo-400',
    button: 'bg-indigo-600 hover:bg-indigo-500',
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
    input: 'bg-black',
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
    { id: 'storyteller', label: '작가 (Storyteller)', desc: '감성적이고 문학적인 서술자', prompt: '풍부한 묘사와 감성을 가진 에세이스트로서 서술하세요.', visual: 'Artistic, watercolor, dreamy' }
  ],
  tones: [
    { id: 'warm', label: '따뜻한 (Warm)', desc: '위로와 격려', prompt: '어조는 부드럽고 따뜻하며, 독자를 포용하는 태도를 유지하세요.', visual: 'Warm lighting, soft focus, orange and yellow tones' },
    { id: 'critical', label: '비판적 (Critical)', desc: '날카로운 지적', prompt: '어조는 날카롭고 비판적이며, 문제의 본질을 꿰뚫는 태도를 유지하세요.', visual: 'High contrast, cool blue tones, sharp shadows' },
    { id: 'witty', label: '유머러스 (Witty)', desc: '재치와 풍자', prompt: '어조는 유머러스하고 재치가 넘치며, 지루하지 않게 서술하세요.', visual: 'Pop art style, playful elements' },
    { id: 'passionate', label: '열정적 (Passionate)', desc: '강력한 동기부여', prompt: '어조는 열정적이고 힘이 넘치며, 독자를 고무시키는 태도를 유지하세요.', visual: 'Dynamic composition, intense colors' }
  ],
  styles: [
    { id: 'concise', label: '간결체 (Concise)', desc: '짧고 명확한 문장', prompt: '문체는 군더더기 없이 간결하고 명확하게 작성하세요.' },
    { id: 'descriptive', label: '만연체 (Detailed)', desc: '화려하고 상세한 묘사', prompt: '문체는 수식어가 풍부하고 호흡이 긴 만연체로 작성하세요.' },
    { id: 'conversational', label: '구어체 (Spoken)', desc: '말하듯 자연스럽게', prompt: '문체는 실제 대화하듯이 자연스러운 구어체(해요체)를 사용하세요.' },
    { id: 'formal', label: '문어체 (Formal)', desc: '격식 있고 정제된', prompt: '문체는 격식 있고 무게감 있는 문어체(하십시오체/하라체)를 사용하세요.' }
  ]
};

const SYSTEM_PROMPTS = {
  interviewer: (tonePrompt: string) => `
  당신은 전문 출판 기획자입니다. 
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

  writer: (bookInfo: any, chapter: any, subsection: any, prevContext: string, tonePrompt: string) => `
  당신은 베스트셀러 작가입니다. 
  
  [책 정보]
  - 제목: ${bookInfo.title}
  - 챕터: ${chapter.chapter_number}. ${chapter.title}
  
  [톤앤매너 지침]
  ${tonePrompt}
  
  [현재 집필 구간]
  - 소제목: ${chapter.chapter_number}-${subsection.sub_number}. ${subsection.title}
  - 가이드: ${subsection.detail}
  
  [이전 내용 맥락]
  ${prevContext ? `(직전 섹션 마지막 문단): ...${prevContext}` : '(챕터의 시작입니다)'}

  [집필 필수 규칙 - 매우 중요]
  1. **목표 분량: 공백 포함 2,000자 이상.** 절대 요약하지 말고, 대화문, 묘사, 사례 연구, 철학적 사색을 충분히 섞어서 글을 '늘려' 쓰세요.
  2. **사족(Meta-text) 절대 금지:** 글의 시작이나 끝에 "[2000자 충족함]", "(현재 분량: ...)", "다음 챕터에서는...", "이상으로..." 같은 시스템 메시지나 작가의 말을 절대 포함하지 마세요. **오직 순수한 원고 본문만 출력하세요.**
  3. **LaTeX 수식 금지:** $$...$$나 \\text{} 같은 수식 코드를 절대 사용하지 마세요. 모든 수식이나 도식은 '글(텍스트)'로 풀어서 설명하세요.
  4. **코드 블록 금지:** 프로그래밍 코드가 아니라면 \`\`\` 사용을 자제하세요.
  5. Markdown 형식을 사용하되, 최상위 제목(#)은 쓰지 마세요. 소제목은 ###를 사용하세요.
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
  const [progress, setProgress] = useState({ total: 0, current: 0, status: 'idle' });

  // New Features State
  const [coverImage, setCoverImage] = useState(null);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const callGemini = async (prompt: string, systemInstruction = "") => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  };

  const callGeminiStream = async (prompt: string, systemInstruction = "", onUpdate: (text: string) => void) => {
    const response = await fetch('/api/generate-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction })
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

  // Image Generation (Imagen 4) - Updated for Textless & Ratio
  const generateCoverImage = async () => {
    if (!bookStructure) return;
    setGeneratingCover(true);
    try {
      const visualStyle = getToneVisualPrompt();
      // Prompt: No text, pure art
      const imagePrompt = `A high quality book cover illustration art without any text. Concept: ${bookStructure.concept}. Style: ${visualStyle}. Visual art only, no title, no words, textless.`;

      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Image Gen Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.imageUrl) {
        setCoverImage(data.imageUrl);
      }
    } catch (e: any) {
      alert("이미지 생성 실패: " + e.message);
      console.error(e);
    } finally {
      setGeneratingCover(false);
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

    // Flatten all subsections to create a sequential list
    const allSubsections = [];
    bookStructure.chapters.forEach((ch, cIdx) => {
      ch.subsections.forEach((sub, sIdx) => {
        allSubsections.push({ ...sub, cIdx, sIdx, key: `${ch.chapter_number}_${sub.sub_number}` });
      });
    });

    setPolishProgress({ current: 0, total: allSubsections.length });

    let previousContext = "";

    try {
      for (let i = 0; i < allSubsections.length; i++) {
        const sub = allSubsections[i];
        const currentText = subsectionContents[sub.key];

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
          })
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
    } catch (e) {
      console.error(e);
      alert("윤문 작업 중 오류가 발생했습니다: " + e.message);
    } finally {
      setIsPolishing(false);
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

  // --- App Logic ---

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const tonePrompt = getTonePrompt();
      const historyText = messages.concat(userMsg).map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      const finalResponse = await callGeminiStream(
        historyText,
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
      } else { throw new Error("JSON parsing failed"); }
    } catch (error) { alert("목차 생성 실패: " + error.message); } finally { setLoading(false); }
  };

  const toggleChapter = (idx) => setExpandedChapters(prev => ({ ...prev, [idx]: !prev[idx] }));
  const updateSubsection = (chIdx, subIdx, field, value) => {
    const newStruct = { ...bookStructure };
    newStruct.chapters[chIdx].subsections[subIdx][field] = value;
    setBookStructure(newStruct);
  };

  const startDeepWriting = async () => {
    setStep('writing');
    let totalTasks = 0;
    bookStructure.chapters.forEach(ch => totalTasks += ch.subsections.length);
    setProgress({ total: totalTasks, current: 0, status: 'writing' });
    const tonePrompt = getTonePrompt();
    const chapterPromises = bookStructure.chapters.map(async (chapter) => {
      let prevContext = "";
      for (const sub of chapter.subsections) {
        const key = `${chapter.chapter_number}_${sub.sub_number}`;
        try {
          const prompt = SYSTEM_PROMPTS.writer(bookStructure, chapter, sub, prevContext, tonePrompt);
          const content = await callGemini(prompt);
          setSubsectionContents(prev => ({ ...prev, [key]: content }));
          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          prevContext = content.slice(-300);
        } catch (error) { setSubsectionContents(prev => ({ ...prev, [key]: "[Error generating this section]" })); }
      }
    });
    await Promise.all(chapterPromises);
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
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-500 ${theme.bg} ${theme.text}`}>
      {/* Print Styles Global */}
      <style>{`@media print { body * { visibility: hidden; } #printable-area, #printable-area * { visibility: visible; } #printable-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 2cm; } header, .sidebar-panel { display: none !important; } @page { margin: 2cm; size: auto; } }`}</style>

      {/* Global Tone Settings Modal */}
      {isToneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <ToneSelector
              toneSettings={toneSettings}
              setToneSettings={setToneSettings}
              theme={theme}
              TONE_FACTORS={TONE_FACTORS}
              onClose={() => setIsToneModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`border-b p-4 flex items-center justify-between sticky top-0 z-20 print:hidden ${theme.panel} ${theme.border}`}>
        <div className="flex items-center gap-2">
          <BookOpen className={theme.accent} />
          <h1 className={`text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent`}>
            AI Book Smith <span className="text-xs text-slate-500 font-mono ml-2">Publisher + AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsToneModalOpen(true)}
            className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border ${theme.border} hover:bg-black/5`}
          >
            <Settings size={14} /> 톤앤매너 설정
          </button>
          <div className="relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className={`p-2 rounded-full hover:bg-black/10 transition-colors ${theme.text}`}
              title="Change Theme"
            >
              <Palette size={20} />
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

      <main className="flex-1 p-4 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Panel */}
        <div className={`sidebar-panel lg:col-span-5 flex flex-col h-[calc(100vh-100px)] gap-4 transition-all ${step === 'done' ? 'hidden lg:flex' : ''}`}>
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
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                      ? `${theme.button} text-white rounded-tr-none`
                      : `${theme.bg} ${theme.text} rounded-tl-none border ${theme.border}`
                      }`}>
                      {msg.role === 'user' ? msg.content : renderMarkdown(msg.content)}
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
                    <button onClick={() => setShowToneSelector(false)} className="w-full mt-2 text-xs opacity-50 hover:opacity-100 underline">설정 완료 (채팅 계속하기)</button>
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
                    onClick={generateCoverImage}
                    disabled={generatingCover}
                    className="bg-indigo-800 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    {generatingCover ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} />}
                    표지
                  </button>
                  <button
                    onClick={startDeepWriting}
                    className={`px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 ${theme.button}`}
                  >
                    <Cpu size={16} /> 집필 시작
                  </button>
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

          {(step === 'writing' || step === 'done') && (
            <div className={`flex-1 rounded-xl border p-4 flex flex-col ${theme.panel} ${theme.border}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  {step === 'writing' ? <RefreshCw className="animate-spin text-indigo-400" /> : <CheckCircle className="text-green-500" />}
                  집필 진행률
                </h3>
                <button
                  onClick={generateCoverImage}
                  disabled={generatingCover}
                  className="bg-indigo-800 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                >
                  {generatingCover ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} />}
                  표지 재생성
                </button>
              </div>

              <div className="mb-2 flex justify-between text-xs opacity-70">
                <span>Progress</span>
                <span>{Math.round((progress.current / progress.total) * 100)}% ({progress.current}/{progress.total} sections)</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2.5 mb-6 overflow-hidden">
                <div
                  className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              <div className={`flex-1 overflow-y-auto space-y-2 border-t pt-4 ${theme.border}`}>
                {bookStructure.chapters.map(ch => (
                  <div key={ch.chapter_number} className="text-sm">
                    <div className="font-bold opacity-60 mb-1">CH.{ch.chapter_number} {ch.title}</div>
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
                ))}
              </div>
              {step === 'done' && (
                <div className="space-y-2 mt-4">
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
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>진행 중...</span>
                        <span>{Math.round((polishProgress.current / polishProgress.total) * 100)}%</span>
                      </div>
                      <div className="w-full bg-black/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-amber-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(polishProgress.current / polishProgress.total) * 100}%` }}></div>
                      </div>
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
        <div className={`lg:col-span-7 rounded-xl shadow-2xl flex flex-col h-[calc(100vh-100px)] overflow-hidden border ${theme.previewBg} ${theme.border} ${theme.previewText}`}>
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

          <div id="printable-area" className={`flex-1 overflow-y-auto p-12 print:p-0 print:overflow-visible ${theme.previewText}`}>
            {bookStructure ? (
              <div className="max-w-3xl mx-auto space-y-12 print:max-w-none">
                {coverImage && (
                  <div className="mb-12 print:break-after-page flex flex-col items-center">
                    <div
                      className="shadow-2xl rounded overflow-hidden w-64 border-8 border-white relative"
                      style={{ aspectRatio: '1 / 1.48' }} // Enforce 1:1.48 ratio
                    >
                      <img src={coverImage} alt="Book Cover" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs opacity-40 mt-2">AI generated cover based on book concept</p>
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
                        <div key={sub.sub_number} className="mb-12 subsection-block relative group">
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
          </div>
        </div>

      </main>
    </div>
  );
}