import type { FactClaim } from '@/types/factCheck';

/**
 * FACTS_JSON 블록에서 원고와 팩트체크 주장을 분리
 */
export function extractFactsJson(text: string): { manuscript: string; claims: FactClaim[] } {
  if (!text) return { manuscript: "", claims: [] };
  const re = /```FACTS_JSON\s*([\s\S]*?)\s*```/m;
  const m = text.match(re);
  if (!m) return { manuscript: text.trim(), claims: [] };
  const jsonStr = m[1];
  let claims: FactClaim[] = [];
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed?.claims)) claims = parsed.claims;
  } catch {
    claims = [];
  }
  const manuscript = text.replace(re, "").trim();
  return { manuscript, claims };
}

/**
 * 원고 텍스트 정제 (메타텍스트 제거, 마크다운 정규화)
 */
export function sanitizeManuscript(text: string, opts?: { sectionTitle?: string }): string {
  if (!text) return "";
  const sectionTitle = (opts?.sectionTitle || "").trim();

  // 1) Remove common meta/length markers anywhere
  const t = text
    // Remove patterns like (공백 포함 2,105자), (2,105자), (공백 제외 1,500자)
    .replace(/\(\s*(공백\s*[포함제외]\s*)?\d[\d,]*\s*자\s*\)/g, "")
    // Remove standalone patterns like 2,105자, 공백 포함 2,105자
    .replace(/(공백\s*[포함제외]\s*)?\d[\d,]*\s*자/g, "")
    // "현재 분량: ..." style
    .replace(/\(현재\s*분량\s*:\s*[^)]*\)/g, "")
    // stray double spaces from removals
    .replace(/[ \t]{2,}/g, " ");

  // 2) Aggressively remove stray asterisks and markdown bold/italic markers from the body
  const lines = t.split("\n");
  const cleaned: string[] = [];
  let skippedTitleOnce = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      cleaned.push("");
      continue;
    }

    // Handle list items specifically
    const listMatch = line.match(/^(\s*[-*]\s+)(.*)$/);
    if (listMatch) {
      const prefix = listMatch[1];
      let content = listMatch[2];
      // Remove all asterisks and underscores from the content of the list item
      content = content.replace(/[*_]/g, "").replace(/:\s+/g, ": ").trim();
      line = `${prefix}${content}`;
    } else {
      // Not a list item, remove all asterisks and underscores
      line = line.replace(/[*_]/g, "").replace(/:\s+/g, ": ").trim();
    }

    // 3) Drop redundant heading lines that repeat the current subsection title
    const rawForTitleCheck = line.trim();
    if (!skippedTitleOnce && sectionTitle) {
      const stripped = rawForTitleCheck
        .replace(/^#{1,6}\s*/, "")
        .replace(/^§\s*/, "")
        .replace(/^\d+[-.]\d+\s*/, "")
        .trim();
      if (stripped === sectionTitle || stripped.endsWith(sectionTitle)) {
        skippedTitleOnce = true;
        continue;
      }
    }

    // 4) Normalize headings
    if (/^#{1,6}\s+/.test(rawForTitleCheck)) {
      const title = rawForTitleCheck.replace(/^#{1,6}\s+/, "").trim();
      line = `### ${title}`;
    }

    cleaned.push(line);
  }

  return cleaned.join("\n").trim();
}

/**
 * 팩트체크 지침 생성
 */
export function factCheckInstructionForSection(claims: FactClaim[]): string {
  const claimsList = claims.slice(0, 30);
  return `아래 원고를 '팩트체크 관점'에서 보수적으로 수정하세요.

[목표]
- 검증이 필요한 단정(숫자/연도/인용/연구결과/법·제도/특정 인물·기관·사건)은 근거 없이 단정하지 말고, 가능하면 일반화/완화 표현으로 바꾸세요.
- 사실이 불확실하면: 단정 → (경향/가능성/일반적인 사례)로 전환하거나, 문장 자체를 제거하고 논지(교훈/원리)는 남기세요.
- 동시에 중언부언(같은 말 반복)을 제거하세요. 다만 분량은 유지하되 "새 사례/체크리스트/반론-반박"으로 채우세요.
- 출력은 수정된 본문만. (사족 금지)

[검증 필요 주장 목록(JSON)]
${JSON.stringify({ claims: claimsList }, null, 2)}
`;
}

/**
 * DRAFT_FEEDBACK 블록 추출
 */
export function extractDraftFeedbackBlock(text: string): string {
  if (!text) return "";
  const match = text.match(/<DRAFT_FEEDBACK>[\s\S]*?<\/DRAFT_FEEDBACK>/);
  if (!match) return "";
  return match[0]
    .replace("<DRAFT_FEEDBACK>", "")
    .replace("</DRAFT_FEEDBACK>", "")
    .trim();
}

