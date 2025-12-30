import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
        }

        const body: unknown = await req.json();
        const message =
            (body && typeof body === 'object' && 'message' in body)
                ? (body as { message?: unknown }).message
                : undefined;
        const history =
            (body && typeof body === 'object' && 'history' in body)
                ? (body as { history?: unknown }).history
                : undefined;
        const personaSettings =
            (body && typeof body === 'object' && 'personaSettings' in body)
                ? (body as { personaSettings?: unknown }).personaSettings
                : undefined;
        const bookContext =
            (body && typeof body === 'object' && 'bookContext' in body)
                ? (body as { bookContext?: unknown }).bookContext
                : undefined;

        if (typeof message !== 'string' || !message.trim()) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-exp" });

        const persona = (personaSettings && typeof personaSettings === 'object')
            ? (personaSettings as {
                roleLabel?: unknown; roleDesc?: unknown;
                toneLabel?: unknown; toneDesc?: unknown;
                styleLabel?: unknown; styleDesc?: unknown;
            })
            : {};
        const ctx = (bookContext && typeof bookContext === 'object')
            ? (bookContext as { title?: unknown; concept?: unknown; step?: unknown })
            : {};

        const systemPrompt = `
    당신은 사용자의 집필을 돕는 페르소나입니다.
    
    [페르소나 설정]
    - 역할: ${typeof persona.roleLabel === 'string' ? persona.roleLabel : '미정'} (${typeof persona.roleDesc === 'string' ? persona.roleDesc : '미정'})
    - 어조: ${typeof persona.toneLabel === 'string' ? persona.toneLabel : '미정'} (${typeof persona.toneDesc === 'string' ? persona.toneDesc : '미정'})
    - 문체: ${typeof persona.styleLabel === 'string' ? persona.styleLabel : '미정'} (${typeof persona.styleDesc === 'string' ? persona.styleDesc : '미정'})

    [책 정보]
    - 제목: ${typeof ctx.title === 'string' && ctx.title.trim() ? ctx.title : '미정'}
    - 컨셉: ${typeof ctx.concept === 'string' && ctx.concept.trim() ? ctx.concept : '미정'}
    - 현재 단계: ${typeof ctx.step === 'string' && ctx.step.trim() ? ctx.step : '미정'}

    당신의 임무는 위 페르소나에 완전히 이입하여 사용자와 대화하는 것입니다.
    책의 내용에 대해 조언하고, 아이디어를 제공하고, 막힌 부분을 뚫어주세요.
    단, 너무 길게 말하지 말고 대화하듯이 자연스럽게 반응하세요.
    `;

        // Convert history to Gemini format
        const chatHistory = (Array.isArray(history) ? history : [])
            .map((msg: unknown) => {
                if (!msg || typeof msg !== 'object') return null;
                const role = (msg as { role?: unknown }).role;
                const content = (msg as { content?: unknown }).content;
                if (typeof content !== 'string') return null;
                return {
                    role: role === 'user' ? 'user' : 'model',
                    parts: [{ text: content }],
                };
            })
            .filter((v): v is { role: 'user' | 'model'; parts: Array<{ text: string }> } => !!v);

        const chat = model.startChat({
            history: chatHistory,
            systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
        });

        const result = await chat.sendMessage(message.trim());
        const response = await result.response;
        const reply = response.text();

        return NextResponse.json({ reply });
    } catch (error: unknown) {
        console.error('Persona Chat Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to chat with persona' },
            { status: 500 }
        );
    }
}
