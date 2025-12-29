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

