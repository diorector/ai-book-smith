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

        const { prompt, systemInstruction = "" } = await req.json();

        if (!prompt) {
            return new Response(
                JSON.stringify({ error: "Prompt is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-preview-09-2025"
        });

        // Create a streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const result = await model.generateContentStream({
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                        systemInstruction: systemInstruction ? {
                            role: "system",
                            parts: [{ text: systemInstruction }]
                        } : undefined,
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
