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

        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        const aspectRatio = "2:3";
        const imageSize = "2K";

        // Gemini 3 Pro Image Preview (Nano Banana Pro) - text-to-image
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: prompt }],
                        },
                    ],
                    generationConfig: {
                        responseModalities: ["TEXT", "IMAGE"],
                        imageConfig: {
                            aspectRatio,
                            imageSize,
                        },
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini Image API Error:", errorText);
            return NextResponse.json(
                { error: `Image generation failed: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Find first inlineData image
        const parts = data?.candidates?.[0]?.content?.parts ?? [];
        const imagePart = parts.find((p: any) => p?.inlineData?.data);
        const base64 = imagePart?.inlineData?.data;
        const mimeType = imagePart?.inlineData?.mimeType || "image/png";

        if (!base64) {
            return NextResponse.json(
                { error: "No image data returned from Gemini image model" },
                { status: 500 }
            );
        }

        const imageUrl = `data:${mimeType};base64,${base64}`;
        return NextResponse.json({ imageUrl });
    } catch (error) {
        console.error("Image Generation Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate image" },
            { status: 500 }
        );
    }
}
