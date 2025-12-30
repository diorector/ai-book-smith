import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Get API key from server environment variable
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "GEMINI_API_KEY is not configured on the server" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const body: unknown = await req.json();
        const prompt =
            (body && typeof body === 'object' && 'prompt' in body)
                ? (body as { prompt?: unknown }).prompt
                : undefined;
        const messages =
            (body && typeof body === 'object' && 'messages' in body)
                ? (body as { messages?: unknown }).messages
                : undefined;
        const systemInstruction =
            (body && typeof body === 'object' && 'systemInstruction' in body)
                ? (body as { systemInstruction?: unknown }).systemInstruction
                : "";
        const generationConfig =
            (body && typeof body === 'object' && 'generationConfig' in body)
                ? (body as { generationConfig?: unknown }).generationConfig
                : undefined;

        if (typeof prompt !== 'string' && (!Array.isArray(messages) || messages.length === 0)) {
            return new Response(
                JSON.stringify({ error: "Prompt or messages are required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        // Create a streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
                    if (Array.isArray(messages) && messages.length > 0) {
                        contents = messages
                            .map((m: unknown) => {
                                if (!m || typeof m !== 'object') return null;
                                const role = (m as { role?: unknown }).role;
                                const content = (m as { content?: unknown }).content;
                                if (typeof content !== 'string') return null;
                                return {
                                    role: role === 'assistant' ? 'model' : 'user',
                                    parts: [{ text: content }],
                                };
                            })
                            .filter((v): v is { role: string; parts: Array<{ text: string }> } => !!v);
                    } else {
                        contents = [{ role: "user", parts: [{ text: typeof prompt === 'string' ? prompt : "" }] }];
                    }

                    const result = await model.generateContentStream({
                        contents,
                        systemInstruction: typeof systemInstruction === 'string' && systemInstruction.trim() ? {
                            role: "system",
                            parts: [{ text: systemInstruction }]
                        } : undefined,
                        generationConfig: (typeof generationConfig === 'object' ? generationConfig : undefined) as unknown,
                    });

                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        // Send SSE format: data: {json}\n\n
                        const data = `data: ${JSON.stringify({ text })}\n\n`;
                        controller.enqueue(encoder.encode(data));
                    }

                    // Send done signal
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                } catch (error) {
                    console.error("Streaming error:", error);
                    const errorData = `data: ${JSON.stringify({
                        error: error instanceof Error ? error.message : "Streaming failed"
                    })}\n\n`;
                    controller.enqueue(encoder.encode(errorData));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error("Gemini Stream API Error:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : "Failed to generate content"
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
