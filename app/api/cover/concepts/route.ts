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

function tryParseJsonObject(text: string): unknown | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function ensureValidResponse(parsed: unknown): CoverConceptResponse {
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid response");
  const obj = parsed as Partial<CoverConceptResponse>;
  if (!Array.isArray(obj.options) || obj.options.length !== 3) {
    throw new Error("Model did not return 3 options");
  }
  if (obj.recommendedId !== "A" && obj.recommendedId !== "B" && obj.recommendedId !== "C") {
    throw new Error("Invalid recommendedId");
  }
  return obj as CoverConceptResponse;
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

    const systemInstruction = `당신은 출판 업계에서 가장 감각적이고 전략적인 '북 커버 아트 디렉터(Book Cover Art Director)'입니다. 당신의 목표는 단순히 '예쁜 표지'가 아니라, 서점 매대에서 독자의 시선을 훔치고 소장 욕구를 자극하는 '오브제(Object)로서의 책'을 기획하는 것입니다.

반드시 다음 4단계 프로세스를 거쳐 답변을 작성하십시오.

## STEP 1. 리서치 및 벤치마킹 (Design Audit)
* 시장 분석: 장르와 타겟 독자층(페르소나) 정의
* 경쟁 분석: 기존 베스트셀러들의 디자인 문법(Cliché)과 트렌드 분석
* 방향성 설정: 기존 문법을 따를지, 완전히 파괴할지 결정

## STEP 2. '좋은 디자인'의 기준 수립 (Success Criteria)
* 타이포그래피: 서체의 뉘앙스(진지함, 가벼움, 학술적 등)와 위계 설정
* 톤앤매너: 신뢰감 vs 감성, 미니멀 vs 맥시멀 등의 밸런스 조정
* 물성(Materiality): 종이의 질감, 후가공(에폭시, 형광 별색 등) 아이디어를 포함하여 실제 '물건'으로서의 매력 정의

## STEP 3. '한 끝' 더하기 (The "Edge")
* 반전의 미학: 뻔한 이미지를 피하고, 모순적이거나 낯선 요소(Uncanny)를 결합
* 디테일의 힘: 책등(세네카), 띠지, 혹은 재질의 특이성을 이용해 브랜드 가치를 높이는 전략 제안

## STEP 4. 최종 디자인 시안 (Visual Execution)
* 서로 다른 매력을 가진 3가지 시안(Option A, B, C) 기획

[이미지 생성 프롬프트 규칙]
1. 제외(Negative): Mockup, 3D rendering, Angle, Table, Shadow, Realistic photo of a book, Curved paper
2. 포함(Positive): Flat 2D Design, Digital Art, Front View Only, Full Frame, High Quality Graphic Design, No Text clutter
3. 비율: 세로형 (Aspect Ratio 2:3)

[출력 규칙]
- JSON ONLY. 마크다운/설명/코드블록 금지.
- 모든 분석과 설명은 한국어로, promptEnglish는 반드시 영어로 작성.
- 전문적이고 통찰력 있으며 세련된 크리에이티브 디렉터의 말투를 사용.
- recommendedId는 반드시 "A", "B", "C" 중 하나의 문자열로 반환.`;

    const prompt = `제목: ${title}
설명: ${description}
${targetAudience ? `타겟: ${targetAudience}` : ""}

위 정보를 바탕으로, 다음 JSON 형식으로 3가지 표지 컨셉을 제안하세요:
{
  "auditKorean": {
    "market": "장르/페르소나 분석 결과",
    "competition": "경쟁 도서 디자인 트렌드 분석",
    "direction": "이 책이 나아가야 할 디자인 방향성"
  },
  "successCriteriaKorean": {
    "typography": "이 책에 필요한 타이포그래피 전략",
    "toneAndManner": "시각적 톤앤매너 설정",
    "materiality": "실제 도서로서의 물성과 후가공 제안"
  },
  "options": [
    {
      "id": "A",
      "conceptName": "컨셉 명칭",
      "intentKorean": "디자인 의도 및 컨셉 상세 설명 (3~4문장)",
      "typography": "해당 시안의 타이포그래피 상세 전략",
      "toneAndManner": "해당 시안의 컬러 및 톤앤매너",
      "materiality": "해당 시안에 어울리는 물성 및 후가공",
      "edge": "독자를 멈칫하게 만들 이 시안만의 '한 끝' (차별화 포인트)",
      "promptEnglish": "Flat 2D Design, Digital Art, Front View Only, Full Frame, High Quality Graphic Design, No Text clutter, aspect ratio 2:3, original book cover design, full-bleed. [Write a detailed visual description in English based on the concept above]. Title text: '${title}'. No mockup, no 3D rendering, no table, no shadow, no angle, no curved paper."
    },
    { "id": "B", "conceptName": "...", "intentKorean": "...", "typography": "...", "toneAndManner": "...", "materiality": "...", "edge": "...", "promptEnglish": "..." },
    { "id": "C", "conceptName": "...", "intentKorean": "...", "typography": "...", "toneAndManner": "...", "materiality": "...", "edge": "...", "promptEnglish": "..." }
  ],
  "recommendedId": "A"
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


