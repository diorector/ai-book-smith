// Common type definitions for AI Book Smith

export interface Theme {
    name: string;
    bg: string;
    text: string;
    panel: string;
    border: string;
    input: string;
    accent: string;
    button: string;
    previewBg: string;
    previewText: string;
}

export interface ToneFactor {
    id: string;
    label: string;
    desc: string;
    prompt: string;
    visual?: string;
}

export interface ToneSettings {
    role: string;
    tone: string;
    style: string;
}

export interface Subsection {
    sub_number: number;
    title: string;
    detail: string;
}

export interface Chapter {
    chapter_number: number;
    title: string;
    subsections: Subsection[];
}

export interface BookStructure {
    title: string;
    target_audience: string;
    concept: string;
    chapters: Chapter[];
}

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// API Request/Response Types
export interface GenerateRequest {
    prompt: string;
    systemInstruction?: string;
}

export interface GenerateResponse {
    text: string;
}

export interface ImageGenerateRequest {
    prompt: string;
}

export interface ImageGenerateResponse {
    imageUrl: string;
}
