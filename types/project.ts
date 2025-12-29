import type { BookStructure } from './book';
import type { ToneSettings } from '@/constants/toneFactors';
import type { ThemeKey } from '@/constants/themes';
import type { FactCheckLog, FactClaim } from './factCheck';

export interface Project {
  id: string;
  name: string;
  updatedAt: number;
}

export interface Progress {
  total: number;
  current: number;
  status: 'idle' | 'writing' | 'stopped' | 'test-complete' | 'done';
}

export interface AutoFactCheckProgress {
  current: number;
  total: number;
  status: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface FeedbackChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CoverConcept {
  id: number;
  conceptName: string;
  intentKorean: string;
  typography: string;
  toneAndManner: string;
  materiality: string;
  edge: string;
  promptEnglish: string;
}

export interface CoverConcepts {
  auditKorean?: {
    market: string;
    competition: string;
    direction: string;
  };
  options: CoverConcept[];
  recommendedId: number;
}

// 커스텀 문체 스타일
export interface CustomStyleAnalysis {
  // 레이더 차트 데이터 (0-100)
  conciseness: number;      // 간결함 ↔ 만연체
  formality: number;        // 격식 ↔ 친근함
  emotionality: number;     // 이성적 ↔ 감성적
  directness: number;       // 직설적 ↔ 우회적
  humor: number;            // 진지함 ↔ 유머러스
  // 키워드 태그
  tags: string[];
  // 샘플 문장
  sampleGreeting: string;
  sampleExplanation: string;
}

export interface CustomStyle {
  id: string;
  name: string;
  emoji: string;
  color: string;
  sourceText: string;       // 원본 텍스트 (요약본)
  analysis: CustomStyleAnalysis;
  prompt: string;           // 생성된 프롬프트
  createdAt: number;
}

export interface ProjectState {
  step: string;
  messages: Message[];
  readyForOutline: boolean;
  toneSettings: ToneSettings;
  bookStructure: BookStructure | null;
  subsectionContents: Record<string, string>;
  factClaimsBySection: Record<string, FactClaim[]>;
  factCheckMode: 'off' | 'fast' | 'web';
  progress: Progress;
  coverImage: string | null;
  coverConcepts: CoverConcepts | null;
  coverPromptUsed: string;
  currentTheme: ThemeKey;
  includeIntroOutro: boolean;
  isTestMode: boolean;
  writingFeedback: string;
  showFeedbackInput: boolean;
  feedbackChatMessages: FeedbackChatMessage[];
  showDetailedToc?: boolean;
  tocExpandedChapters?: Record<number, boolean>;
  autoFactCheckProgress?: AutoFactCheckProgress;
  factCheckLogs?: Record<string, FactCheckLog>;
}

