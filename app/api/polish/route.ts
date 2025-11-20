import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
        }

        const { currentText, previousContext, tonePrompt, instruction } = await req.json();

        if (!currentText) {
            return NextResponse.json({ error: 'Current text is required' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const systemPrompt = `
    당신은 전문 서적 편집자이자 윤문 전문가입니다.
    당신의 임무는 [이전 챕터 맥락]을 고려하여 [현재 챕터 초안]을 다듬는 것입니다.

    [톤앤매너 설정]
    ${tonePrompt || '기본 설정'}

    [편집 지침]
    1. **연결성 강화:** 이전 챕터의 내용과 자연스럽게 이어지도록 도입부를 다듬으세요.
    2. **일관성 유지:** 용어, 어조, 인물 설정 등이 이전 맥락과 일치하는지 확인하세요.
    3. **중복 제거:** 이전 챕터에서 이미 상세히 설명한 내용이 불필요하게 반복된다면 간소화하거나 삭제하세요.
    4. **가독성 개선:** 문장을 매끄럽게 다듬고, 가독성을 높이세요.
    5. **형식 유지:** Markdown 형식을 유지하세요.
    
    ${instruction ? `[추가 지침]\n${instruction}` : ''}

    **중요:** 오직 [다듬어진 현재 챕터의 본문]만 출력하세요. 사족이나 설명은 절대 포함하지 마세요.
    `;

        const userPrompt = `
    [이전 챕터 맥락 (요약 또는 말단부)]
    ${previousContext || '(이전 맥락 없음 - 첫 챕터이거나 정보 없음)'}

    [현재 챕터 초안]
    ${currentText}
    `;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
        });

        const response = await result.response;
        const refinedText = response.text();

        return NextResponse.json({ refinedText });
    } catch (error: any) {
        console.error('Polishing Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to polish text' },
            { status: 500 }
        );
    }
}
