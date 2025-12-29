import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { baseStyle, mixStyle, baseRatio = 70 } = body;

    if (!baseStyle || !mixStyle) {
      return NextResponse.json({ error: "baseStyle and mixStyle are required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const mixRatio = 100 - baseRatio;

    const prompt = `두 가지 글쓰기 스타일을 혼합하여 새로운 스타일 지시문을 만들어주세요.

[베이스 스타일 (${baseRatio}%)]
${baseStyle}

[믹스 스타일 (${mixRatio}%)]
${mixStyle}

비율에 맞게 두 스타일의 특징을 조합하여, AI 작가가 따를 수 있는 명확한 문체 지시문을 작성하세요.
200자 이내로 간결하게 작성하세요.

[블렌드된 스타일 지시문]`;

    const result = await model.generateContent(prompt);
    const blendedPrompt = result.response.text().trim();

    // 블렌드 스타일로 샘플 문장 생성
    const samplePrompt = `다음 스타일로 "안녕하세요, 이 책을 읽어주셔서 감사합니다"를 다시 작성하세요. 1-2문장으로.

[스타일]
${blendedPrompt}

[변환된 문장]`;

    const sampleResult = await model.generateContent(samplePrompt);
    const sampleText = sampleResult.response.text().trim();

    return NextResponse.json({ 
      blendedPrompt,
      sampleText,
      baseRatio,
      mixRatio
    });

  } catch (error: unknown) {
    console.error("[style-blend] Error:", error);
    const message = error instanceof Error ? error.message : "Blend failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


