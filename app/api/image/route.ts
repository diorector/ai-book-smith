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

        // Call Imagen API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt }],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: "3:4" // Portrait ratio for book cover
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Imagen API Error:", errorText);
            return NextResponse.json(
                { error: `Image generation failed: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
            const imageUrl = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
            return NextResponse.json({ imageUrl });
        } else {
            return NextResponse.json(
                { error: "No image data returned from API" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Image Generation Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate image" },
            { status: 500 }
        );
    }
}
