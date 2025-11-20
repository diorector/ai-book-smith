import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Get API key from server environment variable
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured on the server" },
                { status: 500 }
            );
        }

        const { prompt, systemInstruction = "" } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-preview-09-2025"
        });

        // Retry logic (max 3 attempts)
        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    systemInstruction: systemInstruction ? {
                        role: "system",
                        parts: [{ text: systemInstruction }]
                    } : undefined,
                });

                const text = result.response.text();

                return NextResponse.json({ text });
            } catch (error) {
                attempt++;
                if (attempt === maxRetries) {
                    throw error;
                }
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            }
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate content" },
            { status: 500 }
        );
    }
}
