import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

type CoverConceptOption = {
  id: "A" | "B" | "C";
  conceptName: string;
  intentKorean: string;
  typography: string;
  toneAndManner: string;
  materiality: string;
  edge: string;
  promptEnglish: string;
};

type CoverConceptResponse = {
  auditKorean: {
    market: string;
    competition: string;
    direction: string;
  };
  successCriteriaKorean: {
    typography: string;
    toneAndManner: string;
    materiality: string;
  };
  options: CoverConceptOption[];
  recommendedId: "A" | "B" | "C";
};

function tryParseJsonObject(text: string): any | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function ensureValidResponse(parsed: any): CoverConceptResponse {
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid response");
  if (!Array.isArray(parsed.options) || parsed.options.length !== 3) {
    throw new Error("Model did not return 3 options");
  }
  return parsed as CoverConceptResponse;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const title = (body?.title ?? "").toString().trim();
    const description = (body?.description ?? "").toString().trim();
    const targetAudience = (body?.targetAudience ?? "").toString().trim();

    if (!title || !description) {
      return NextResponse.json(
        { error: "title and description are required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-image-preview",

    });

    const systemInstruction = `
당신은 출판 업계에서 가장 감각적이고 전략적인 '북 커버 아트 디렉터(Book Cover Art Director)'입니다.
목표는 단순히 예쁜 표지가 아니라, 서점 매대에서 독자의 시선을 훔치고 소장 욕구를 자극하는 '오브제(Object)로서의 책'입니다.

[중요 출력 규칙]
- 출력은 반드시 JSON ONLY로 반환하세요. 마크다운, 설명문, 코드블록 금지.
- 분석/설명은 한국어로 작성하세요.
- 이미지 생성 프롬프트(promptEnglish)는 영어로 작성하세요.

[필수 프로세스(요약)]
- STEP 1: 시장/경쟁/방향성
- STEP 2: 성공 기준(타이포, 톤앤매너, 물성)
- STEP 3: 한 끝(반전/디테일 전략)
- STEP 4: Option A/B/C (서로 다른 매력)

[이미지 프롬프트 규칙]
- Negative(반드시 포함해 회피 지시): Mockup, 3D rendering, Angle, Table, Shadow, Realistic photo of a book, Curved paper
- Positive(반드시 포함): Flat 2D Design, Digital Art, Front View Only, Full Frame, High Quality Graphic Design, No Text clutter
- 세로형 비율: 2:3 (프롬프트에도 명시)
- 표지용: "original cover art / original graphic design" 톤으로, '목업' 금지.

[타이포그래피(중요)]
- 표지에는 반드시 제목 텍스트가 포함되어야 합니다.
- 제목은 반드시 아래 Book Title 문자열을 그대로 사용하세요(언어/기호 포함).
- 부제(또는 한줄 설명)는 Brief Description을 바탕으로 1줄로 정리해 포함하세요. (없으면 생략 가능)
- 타이포는 과도한 장식 없이 정교하게 배치하고, "No Text clutter" 기준을 지키세요.
`;

    const prompt = `
[Book Title]
${title}

[Brief Description]
${description}

[Target Audience (if provided)]
${targetAudience || "(not provided)"}

[Output JSON Schema]
{
  "auditKorean": {
    "market": "장르/페르소나 정의 + 시장 한줄",
    "competition": "클리셰/트렌드 분석",
    "direction": "따를지/부술지 + 이유"
  },
  "successCriteriaKorean": {
    "typography": "서체 뉘앙스/위계",
    "toneAndManner": "미니멀/맥시멀 등 밸런스",
    "materiality": "후가공/질감 아이디어"
  },
  "options": [
    {
      "id": "A",
      "conceptName": "옵션 컨셉 이름(짧게)",
      "intentKorean": "Option A의 컨셉/디자인 의도(2~4문장)",
      "typography": "타이포 전략(한국어, 1~2문장)",
      "toneAndManner": "톤앤매너(한국어, 1~2문장)",
      "materiality": "물성/후가공(한국어, 1~2문장)",
      "edge": "차별화 포인트(한국어, 1~2문장)",
      "promptEnglish": "ENGLISH image prompt. MUST include the Positive words and explicitly avoid the Negative words. Aspect ratio 2:3. Front cover only. Full bleed."
    },
    { "id": "B", "...": "..." },
    { "id": "C", "...": "..." }
  ],
  "recommendedId": "A|B|C"
}

[Guidelines for promptEnglish]
- Mention: original book cover design, flat 2D graphic design, full-bleed, front view only, full frame, high quality graphic design.
- Explicitly say: no mockup, no 3D rendering, no table, no shadow, no angle, no curved paper, not a photo of a book.
- Typography must include the exact title text and (optionally) a short subtitle line derived from the description. Avoid clutter.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction
        ? { role: "system", parts: [{ text: systemInstruction }] }
        : undefined,
    });

    const text = result.response.text();
    const parsed = tryParseJsonObject(text);
    const validated = ensureValidResponse(parsed);

    return NextResponse.json(validated);
  } catch (error) {
    console.error("Cover concept generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate cover concepts" },
      { status: 500 }
    );
  }
}


