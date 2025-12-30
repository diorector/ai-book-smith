import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * 원고 다듬기 API (교정 + 윤문)
 * - 교정: 오탈자, 맞춤법, 띄어쓰기
 * - 윤문: 문장 개선, 가독성, 번역투 제거
 * 
 * 교열(팩트체크)은 별도 API 사용 (/api/fact-check)
 */

type ProofreadMode = 'proofread' | 'polish' | 'full';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const body = await req.json();
    const manuscript = (body?.manuscript || "").toString().trim();
    const mode: ProofreadMode = body?.mode || 'full'; // proofread, polish, full
    
    if (!manuscript) {
      return NextResponse.json({ error: "manuscript is required" }, { status: 400 });
    }

    if (manuscript.length < 100) {
      return NextResponse.json({ 
        revised: manuscript, 
        changes: [],
        summary: "텍스트가 너무 짧아 다듬기를 건너뜁니다."
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let systemPrompt = "";

    if (mode === 'proofread') {
      // 교정만
      systemPrompt = `당신은 전문 교정자입니다.

[작업]
주어진 원고의 **교정**을 진행합니다.

[교정 대상]
✅ 오탈자 수정
✅ 맞춤법 수정 (한글 맞춤법 통일안 기준)
✅ 띄어쓰기 수정
✅ 문장부호 수정 (마침표, 쉼표, 따옴표 등)

[절대 금지]
❌ 내용이나 의미 변경
❌ 문체나 어조 변경
❌ 저자의 의도적 표현 수정 (비속어, 신조어, 고유 표현)
❌ 문장 구조 변경

[출력 형식]
반드시 아래 JSON 형식으로만 응답하세요:

{
  "revised": "교정된 전체 원고",
  "changes": [
    {"original": "원래 표현", "corrected": "수정된 표현", "reason": "교정 이유", "type": "proofread"}
  ],
  "summary": "교정 사항 요약 (예: '맞춤법 3개, 띄어쓰기 2개 수정')"
}`;
    } else if (mode === 'polish') {
      // 윤문만
      systemPrompt = `당신은 전문 윤문 편집자입니다.

[작업]
주어진 원고의 **윤문**을 진행합니다. 더 읽기 쉽고 자연스럽게 다듬습니다.

[윤문 기준]
✅ 번역투 제거 (영어 직역 표현 개선)
✅ 주어-술어 호응 맞추기
✅ 길고 복잡한 문장 → 간결하게
✅ 반복되는 표현 정리
✅ 피동형 → 능동형 전환 (자연스러운 경우)
✅ 문장 연결 매끄럽게
✅ 어색한 조사 수정

[절대 금지]
❌ 원문의 핵심 의미 변경
❌ 저자의 문체/개성 훼손
❌ 의도적 표현 수정 (비속어, 신조어, 강조 표현)
❌ 전문 용어 임의 변경

[출력 형식]
반드시 아래 JSON 형식으로만 응답하세요:

{
  "revised": "윤문된 전체 원고",
  "changes": [
    {"original": "원래 문장", "corrected": "수정된 문장", "reason": "윤문 이유", "type": "polish"}
  ],
  "summary": "윤문 사항 요약"
}`;
    } else {
      // 통합 (교정 + 윤문)
      systemPrompt = `당신은 출판사의 전문 편집자입니다.

[작업]
주어진 원고를 2단계로 다듬습니다.

===STEP 1: 교정===
- 오탈자, 맞춤법, 띄어쓰기 수정
- 문장부호 정리

===STEP 2: 윤문===
- 번역투 제거
- 문장 구조 개선 (길고 복잡한 문장 → 간결하게)
- 불필요한 반복 제거
- 자연스러운 흐름으로 다듬기

[절대 금지]
❌ 원문의 핵심 의미 변경
❌ 저자의 의도적 표현 수정 (비속어, 신조어, 책 제목 표현)
❌ 사실 관계 수정 (이건 팩트체크에서 별도로 함)
❌ 전문 용어 임의 변경

[출력 형식]
반드시 아래 JSON 형식으로만 응답하세요:

{
  "revised": "다듬어진 전체 원고",
  "changes": [
    {"original": "원래 표현", "corrected": "수정된 표현", "reason": "수정 이유", "type": "proofread 또는 polish"}
  ],
  "summary": "수정 사항 요약 (예: '교정 5개, 윤문 3개')"
}

수정할 게 없으면 changes를 빈 배열로, revised는 원본 그대로 출력하세요.`;
    }

    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [{ text: `다음 원고를 다듬어주세요:\n\n${manuscript}` }] 
      }],
      systemInstruction: { role: "model", parts: [{ text: systemPrompt }] },
    });

    const responseText = result.response.text();
    
    let parsed;
    try {
      const jsonStr = responseText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      
      parsed = JSON.parse(jsonStr);
    } catch {
      console.warn("[proofread] JSON 파싱 실패, 원본 반환");
      return NextResponse.json({
        revised: manuscript,
        changes: [],
        summary: "원고 다듬기 결과 파싱 실패 - 원본 유지"
      });
    }

    return NextResponse.json({
      revised: parsed.revised || manuscript,
      changes: Array.isArray(parsed.changes) ? parsed.changes : [],
      summary: parsed.summary || "원고 다듬기 완료"
    });

  } catch (error: unknown) {
    console.error("[proofread] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proofread failed" },
      { status: 500 }
    );
  }
}

