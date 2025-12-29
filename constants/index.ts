export * from './themes';
export * from './toneFactors';
export * from './systemPrompts';

// 집필 관련 상수
export const WRITE_CONCURRENCY = 15; // Gemini Paid Tier 1: 360 RPM, 공격적 설정
export const TEST_SECTIONS_MAX = 3;
export const AUTO_FACTCHECK_ON_COMPLETE = true;
export const FACTCHECK_CONCURRENCY = 15; // Gemini Paid Tier 1: 360 RPM, 공격적 설정

// 프로젝트 관련 상수
export const PROJECTS_KEY = 'ai-book-smith-projects';

