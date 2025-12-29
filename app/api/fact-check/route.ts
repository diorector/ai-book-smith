import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * 간단한 팩트체크 API
 * - Gemini + Google Search Grounding 사용
 * - 입력: 원고 텍스트
 * - 출력: 팩트체크된 원고 + 수정 사항 요약
 */

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const body = await req.json();
    const manuscript = (body?.manuscript || "").toString().trim();
    
    if (!manuscript) {
      return NextResponse.json({ error: "manuscript is required" }, { status: 400 });
    }

    // 너무 짧은 텍스트는 팩트체크 스킵
    if (manuscript.length < 200) {
      return NextResponse.json({ 
        revised: manuscript, 
        changes: [],
        summary: "텍스트가 너무 짧아 팩트체크를 건너뜁니다."
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Google Search Grounding이 포함된 모델 설정
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
      tools: [{
        googleSearch: {}
      }] as any,
    });

    const systemPrompt = `당신은 전문 팩트체커입니다.

[작업]
주어진 원고에서 **객관적 사실 오류만** 찾아 수정하세요.

[팩트체크 대상 - 이것만 검증]
✅ 역사적 사실 (연도, 사건, 인물)
✅ 숫자/통계 (퍼센트, 금액, 수치)
✅ 과학적 사실 (법칙, 원리, 연구 결과)
✅ 지리/인구 정보
✅ 법률/제도 정보
✅ 인용문/출처의 정확성

[절대 수정 금지 - 건드리지 마세요]
❌ 맞춤법/띄어쓰기/문법 오류
❌ 문체/어조/표현 방식
❌ 저자의 의도적 표현 (비속어, 신조어, 특수 용어)
❌ 주관적 의견/해석/비유
❌ 책 제목, 장 제목에 포함된 표현

[규칙]
1. Google 검색으로 사실 관계를 확인하세요.
2. 검색으로 확인된 명백한 사실 오류만 수정하세요.
3. 불확실하면 절대 수정하지 마세요.
4. 수정 이유에 출처를 간단히 언급하세요.

[출력 형식]
반드시 아래 JSON 형식으로만 응답하세요. 마크다운 코드 펜스 없이 순수 JSON만:

{
  "revised": "팩트체크 후 수정된 전체 원고",
  "changes": [
    {"original": "원래 문장", "corrected": "수정된 문장", "reason": "수정 이유 (출처 포함)"}
  ],
  "summary": "수정 사항 한줄 요약"
}

사실 오류가 없으면 changes를 빈 배열로, revised는 원본 그대로 출력하세요.`;

    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [{ text: `다음 원고를 팩트체크해주세요:\n\n${manuscript}` }] 
      }],
      systemInstruction: { role: "model", parts: [{ text: systemPrompt }] },
    });

    const responseText = result.response.text();
    
    // JSON 파싱
    let parsed;
    try {
      // 마크다운 코드 펜스 제거
      let jsonStr = responseText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      
      parsed = JSON.parse(jsonStr);
    } catch {
      // 파싱 실패 시 원본 반환
      console.warn("[fact-check] JSON 파싱 실패, 원본 반환");
      return NextResponse.json({
        revised: manuscript,
        changes: [],
        summary: "팩트체크 결과 파싱 실패 - 원본 유지"
      });
    }

    return NextResponse.json({
      revised: parsed.revised || manuscript,
      changes: Array.isArray(parsed.changes) ? parsed.changes : [],
      summary: parsed.summary || "팩트체크 완료"
    });

  } catch (error: any) {
    console.error("[fact-check] Error:", error);
    return NextResponse.json(
      { error: error.message || "Fact check failed" },
      { status: 500 }
    );
  }
}

