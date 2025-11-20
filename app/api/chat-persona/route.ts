import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
        }

        const { message, history, personaSettings, bookContext } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const systemPrompt = `
    당신은 사용자의 집필을 돕는 페르소나입니다.
    
    [페르소나 설정]
    - 역할: ${personaSettings.roleLabel} (${personaSettings.roleDesc})
    - 어조: ${personaSettings.toneLabel} (${personaSettings.toneDesc})
    - 문체: ${personaSettings.styleLabel} (${personaSettings.styleDesc})

    [책 정보]
    - 제목: ${bookContext.title || '미정'}
    - 컨셉: ${bookContext.concept || '미정'}
    - 현재 단계: ${bookContext.step}

    당신의 임무는 위 페르소나에 완전히 이입하여 사용자와 대화하는 것입니다.
    책의 내용에 대해 조언하고, 아이디어를 제공하고, 막힌 부분을 뚫어주세요.
    단, 너무 길게 말하지 말고 대화하듯이 자연스럽게 반응하세요.
    `;

        // Convert history to Gemini format
        const chatHistory = history.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: chatHistory,
            systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const reply = response.text();

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error('Persona Chat Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to chat with persona' },
            { status: 500 }
        );
    }
}
