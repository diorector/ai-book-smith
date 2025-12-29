import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const body = await req.json();
    const text = (body?.text || "").toString().trim();

    if (!text || text.length < 100) {
      return NextResponse.json({ error: "최소 100자 이상의 텍스트가 필요합니다." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const systemPrompt = `당신은 문체 분석 전문가입니다. 주어진 텍스트의 문체를 분석하고 JSON 형식으로 결과를 반환하세요.

분석 항목:
1. conciseness (0-100): 0=매우 간결, 100=매우 만연체
2. formality (0-100): 0=매우 격식적, 100=매우 친근함
3. emotionality (0-100): 0=매우 이성적, 100=매우 감성적
4. directness (0-100): 0=매우 직설적, 100=매우 우회적
5. humor (0-100): 0=매우 진지함, 100=매우 유머러스

6. tags: 이 문체의 특징을 나타내는 한국어 해시태그 5개 (예: #짧은_호흡, #냉소적_유머)

7. sampleGreeting: 이 문체로 "안녕하세요, 반갑습니다"를 다시 쓰면 어떻게 될지 예시
8. sampleExplanation: 이 문체로 "이것은 중요한 개념입니다"를 다시 쓰면 어떻게 될지 예시

9. prompt: 이 문체를 AI가 모방할 수 있도록 작성한 상세한 문체 지시문 (200자 이상)
   - 어휘 선택, 문장 길이, 호흡, 어조, 특징적인 표현 패턴 등을 구체적으로 기술

반드시 아래 JSON 형식으로만 응답하세요:
{
  "conciseness": 숫자,
  "formality": 숫자,
  "emotionality": 숫자,
  "directness": 숫자,
  "humor": 숫자,
  "tags": ["#태그1", "#태그2", ...],
  "sampleGreeting": "문장",
  "sampleExplanation": "문장",
  "prompt": "문체 지시문"
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `다음 텍스트의 문체를 분석해주세요:\n\n${text.slice(0, 5000)}` }] }],
      systemInstruction: { role: "model", parts: [{ text: systemPrompt }] },
    });

    const responseText = result.response.text();

    // JSON 파싱
    let parsed;
    try {
      let jsonStr = responseText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.warn("[analyze-style] JSON 파싱 실패:", responseText);
      return NextResponse.json({ error: "분석 결과 파싱 실패" }, { status: 500 });
    }

    return NextResponse.json({
      analysis: {
        conciseness: parsed.conciseness || 50,
        formality: parsed.formality || 50,
        emotionality: parsed.emotionality || 50,
        directness: parsed.directness || 50,
        humor: parsed.humor || 50,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        sampleGreeting: parsed.sampleGreeting || "",
        sampleExplanation: parsed.sampleExplanation || "",
      },
      prompt: parsed.prompt || "",
    });

  } catch (error: unknown) {
    console.error("[analyze-style] Error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

