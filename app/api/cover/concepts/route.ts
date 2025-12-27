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
      model: "gemini-3-flash-preview",
    });

    const systemInstruction = `당신은 북 커버 아트 디렉터입니다. 서점 매대에서 독자의 시선을 훔치는 전략적 표지 컨셉을 제안하세요.

[출력 규칙]
- JSON ONLY. 마크다운/설명/코드블록 금지.
- 분석은 한국어, promptEnglish는 영어.

[프로세스]
1. 시장/경쟁/방향성 분석
2. 성공 기준(타이포/톤앤매너/물성)
3. 차별화 포인트
4. Option A/B/C (서로 다른 매력)

[이미지 프롬프트 규칙]
- 포함: Flat 2D Design, Digital Art, Front View Only, Full Frame, High Quality Graphic Design, No Text clutter, aspect ratio 2:3
- 회피: Mockup, 3D rendering, Angle, Table, Shadow, Realistic photo of a book, Curved paper
- 타이포: 제목 텍스트 필수 포함, 부제는 Brief Description 기반 1줄, No Text clutter`;

    const prompt = `제목: ${title}
설명: ${description}
${targetAudience ? `타겟: ${targetAudience}` : ''}

다음 JSON 형식으로 3가지 표지 컨셉을 제안하세요:
{
  "auditKorean": {
    "market": "장르/페르소나 + 시장 한줄",
    "competition": "클리셰/트렌드 분석",
    "direction": "따를지/부술지 + 이유"
  },
  "successCriteriaKorean": {
    "typography": "서체 뉘앙스/위계",
    "toneAndManner": "미니멀/맥시멀 밸런스",
    "materiality": "후가공/질감 아이디어"
  },
  "options": [
    {
      "id": "A",
      "conceptName": "컨셉 이름",
      "intentKorean": "컨셉/디자인 의도(2~4문장)",
      "typography": "타이포 전략(1~2문장)",
      "toneAndManner": "톤앤매너(1~2문장)",
      "materiality": "물성/후가공(1~2문장)",
      "edge": "차별화 포인트(1~2문장)",
      "promptEnglish": "Flat 2D Design, Digital Art, Front View Only, Full Frame, High Quality Graphic Design, No Text clutter, aspect ratio 2:3, original book cover design, full-bleed. Include title text: '${title}'. No mockup, no 3D rendering, no table, no shadow, no angle, no curved paper, not a photo of a book."
    },
    { "id": "B", "conceptName": "...", "intentKorean": "...", "typography": "...", "toneAndManner": "...", "materiality": "...", "edge": "...", "promptEnglish": "..." },
    { "id": "C", "conceptName": "...", "intentKorean": "...", "typography": "...", "toneAndManner": "...", "materiality": "...", "edge": "...", "promptEnglish": "..." }
  ],
  "recommendedId": "A|B|C"
}`;

    // 최적화된 생성 설정으로 속도 향상
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction
        ? { role: "system", parts: [{ text: systemInstruction }] }
        : undefined,
      generationConfig: {
        temperature: 0.7, // 창의성과 일관성의 균형
        maxOutputTokens: 3000, // 충분한 길이 보장
        topP: 0.95,
        topK: 40,
      },
    });

    const text = result.response.text();
    const parsed = tryParseJsonObject(text);
    
    if (!parsed) {
      // JSON 파싱 실패 시 재시도 (최대 2회)
      console.warn("JSON 파싱 실패, 재시도 중...");
      const retryResult = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt + "\n\n중요: 반드시 유효한 JSON만 출력하세요. 마크다운이나 설명 없이 순수 JSON만 반환하세요." }] }],
        systemInstruction: systemInstruction
          ? { role: "system", parts: [{ text: systemInstruction }] }
          : undefined,
        generationConfig: {
          temperature: 0.3, // 재시도 시 더 낮은 temperature로 일관성 확보
          maxOutputTokens: 3000,
        },
      });
      const retryText = retryResult.response.text();
      const retryParsed = tryParseJsonObject(retryText);
      if (!retryParsed) {
        throw new Error("JSON 파싱 실패: 모델이 유효한 JSON을 반환하지 않았습니다.");
      }
      const validated = ensureValidResponse(retryParsed);
      return NextResponse.json(validated);
    }
    
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


