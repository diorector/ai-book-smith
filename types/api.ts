export interface GenerateRequest {
  prompt: string;
  systemInstruction?: string;
}

export interface GenerateResponse {
  text: string;
}

export interface GenerateStreamRequest {
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  systemInstruction?: string;
  generationConfig?: Record<string, unknown>;
}

export interface ImageGenerateRequest {
  prompt: string;
}

export interface ImageGenerateResponse {
  imageUrl: string;
}

export interface CoverConceptsRequest {
  title: string;
  description: string;
  targetAudience: string;
}

export interface PolishRequest {
  text: string;
  instruction: string;
  tonePrompt?: string;
}

export interface PolishResponse {
  text: string;
}

