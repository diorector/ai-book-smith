import { NextRequest, NextResponse } from "next/server";

type SearchResult = {
  url: string;
  title?: string;
  snippet?: string;
  content?: string;
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const { query, maxResults = 5, searchDepth = "basic" } = await req.json();
    const q = (query || "").toString().trim();
    if (!q) return badRequest("query is required");

    const provider = (process.env.SEARCH_PROVIDER || "tavily").toLowerCase();
    if (provider === "tavily") {
      const apiKey = process.env.TAVILY_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "TAVILY_API_KEY is not configured on the server" },
          { status: 500 }
        );
      }

      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query: q,
          search_depth: searchDepth, // basic | advanced
          max_results: Math.max(1, Math.min(10, Number(maxResults) || 5)),
          include_answer: false,
          include_raw_content: false,
          include_images: false,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return NextResponse.json(
          { error: `Tavily error: ${res.status} ${text}`.slice(0, 2000) },
          { status: 502 }
        );
      }

      const data: any = await res.json();
      const results: SearchResult[] = Array.isArray(data?.results)
        ? data.results.map((r: any) => ({
            url: r?.url,
            title: r?.title,
            snippet: r?.content,
            content: r?.content,
          }))
        : [];

      return NextResponse.json({ provider: "tavily", query: q, results });
    }

    if (provider === "serpapi") {
      // Placeholder for future migration: keep the interface stable
      return NextResponse.json(
        { error: "SEARCH_PROVIDER=serpapi is not implemented yet. Use tavily for now." },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: `Unknown SEARCH_PROVIDER: ${provider}` },
      { status: 500 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to search" },
      { status: 500 }
    );
  }
}


