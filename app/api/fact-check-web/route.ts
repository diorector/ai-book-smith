import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Claim = {
  claim: string;
  suggested_query?: string;
  confidence?: "low" | "medium" | "high" | string;
  note?: string;
};

type SearchHit = {
  url: string;
  title?: string;
  snippet?: string;
  raw?: string;
};

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

function clampText(s: string, max = 1200) {
  const t = (s || "").toString().replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

async function tavilySearch(apiKey: string, query: string, maxResults = 5): Promise<SearchHit[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      max_results: Math.max(1, Math.min(8, maxResults)),
      include_answer: false,
      include_raw_content: true,
      include_images: false,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Tavily error: ${res.status} ${text}`.slice(0, 1000));
  }
  const data: any = await res.json();
  const results = Array.isArray(data?.results) ? data.results : [];
  return results
    .map((r: any) => ({
      url: r?.url,
      title: r?.title,
      snippet: r?.content,
      raw: r?.raw_content,
    }))
    .filter((r: any) => typeof r.url === "string" && r.url.startsWith("http"));
}

async function geminiText(model: any, prompt: string, systemInstruction?: string) {
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: systemInstruction
      ? { role: "system", parts: [{ text: systemInstruction }] }
      : undefined,
  });
  return result.response.text();
}

async function translateQuery(model: any, text: string, target: "ko" | "en") {
  const sys = `You are a professional search query translator.
- Output ONLY the translated query text.
- Keep proper nouns as-is when appropriate.
- Do not add quotes unless they exist.
Target language: ${target === "ko" ? "Korean" : "English"}.`;
  const out = await geminiText(model, text, sys);
  return out.trim().replace(/^"|"$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return jsonError("GEMINI_API_KEY is not configured on the server", 500);

    const tavilyKey = process.env.TAVILY_API_KEY;
    if (!tavilyKey) return jsonError("TAVILY_API_KEY is not configured on the server", 500);

    const body = await req.json();
    const manuscript = (body?.manuscript || "").toString();
    const claims: Claim[] = Array.isArray(body?.claims) ? body.claims : [];
    if (!manuscript.trim()) return jsonError("manuscript is required", 400);
    if (claims.length === 0) {
      return NextResponse.json({ rewritten: manuscript, references: [], evaluations: [] });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });

    // 1) Build ko/en queries per claim (equal weight)
    const claimQueries = await Promise.all(
      claims.slice(0, 30).map(async (c) => {
        const base = (c.suggested_query || c.claim || "").toString().trim();
        const ko = await translateQuery(model, base, "ko").catch(() => base);
        const en = await translateQuery(model, base, "en").catch(() => base);
        return { claim: c.claim, koQuery: ko, enQuery: en };
      })
    );

    // 2) Search (ko/en) and build evidence bundle
    const evidenceByClaim: Array<{
      claim: string;
      evidence: Array<{ url: string; title?: string; excerpt: string }>;
    }> = [];

    for (const cq of claimQueries) {
      const [koHits, enHits] = await Promise.all([
        tavilySearch(tavilyKey, cq.koQuery, 4).catch(() => []),
        tavilySearch(tavilyKey, cq.enQuery, 4).catch(() => []),
      ]);
      const hits = [...koHits.slice(0, 3), ...enHits.slice(0, 3)];
      const evidence = hits.map((h) => ({
        url: h.url,
        title: h.title,
        excerpt: clampText(h.raw || h.snippet || "", 900),
      }));
      evidenceByClaim.push({ claim: cq.claim, evidence });
    }

    // 3) Fact-check (verdict + citations) with evidence only
    const fcSystem = `You are a strict fact-checker.
Rules:
- Use ONLY provided evidence excerpts and URLs. Do not use prior knowledge.
- If evidence is insufficient, verdict must be "unclear".
- Output MUST be valid JSON only. No markdown fences.`;

    const fcPrompt = JSON.stringify(
      {
        task: "fact_check_claims",
        claims: evidenceByClaim,
        output_schema: {
          evaluations: [
            {
              claim: "string",
              verdict: "supported|contradicted|unclear",
              confidence: "low|medium|high",
              corrected_claim: "string (if contradicted, provide corrected version grounded in evidence; else empty string)",
              citations: [{ url: "string", title: "string(optional)" }],
              notes: "short rationale",
            },
          ],
        },
      },
      null,
      2
    );

    const fcRaw = await geminiText(model, fcPrompt, fcSystem);
    const fcJsonMatch = fcRaw.match(/\{[\s\S]*\}/);
    const fcParsed = fcJsonMatch ? JSON.parse(fcJsonMatch[0]) : { evaluations: [] };
    const evaluations: any[] = Array.isArray(fcParsed?.evaluations) ? fcParsed.evaluations : [];

    // 4) Build references list (unique URLs)
    const urlToNum = new Map<string, number>();
    const references: Array<{ n: number; url: string; title?: string }> = [];
    const cite = (url: string, title?: string) => {
      if (!url || typeof url !== "string") return;
      if (!urlToNum.has(url)) {
        const n = urlToNum.size + 1;
        urlToNum.set(url, n);
        references.push({ n, url, title });
      }
    };
    evaluations.forEach((ev) => {
      (ev?.citations || []).forEach((c: any) => cite(c?.url, c?.title));
    });

    // 5) Rewrite manuscript with citations + section-end References(A)
    const rwSystem = `You are a careful editor.
Rules:
- Use ONLY the provided fact-check evaluations and citations.
- If verdict is "unclear", rewrite to avoid definitive claims (hedge or remove).
- If "contradicted", correct the statement using corrected_claim and attach citations.
- Keep style and flow, remove redundancy.
- Append a "References" section at the end in markdown, listing [n] Title - URL.
- In the body, add inline markers like ([n]) at the end of sentences that rely on a citation.
Output MUST be valid JSON only with keys: rewritten, references_used.`;

    const rwPrompt = JSON.stringify(
      {
        manuscript,
        evaluations,
        references,
        output_schema: {
          rewritten: "string (markdown)",
          references_used: [{ n: "number", url: "string", title: "string(optional)" }],
        },
      },
      null,
      2
    );
    const rwRaw = await geminiText(model, rwPrompt, rwSystem);
    const rwMatch = rwRaw.match(/\{[\s\S]*\}/);
    const rwParsed = rwMatch ? JSON.parse(rwMatch[0]) : null;
    const rewritten = (rwParsed?.rewritten || manuscript).toString();
    const referencesUsed = Array.isArray(rwParsed?.references_used) ? rwParsed.references_used : references;

    return NextResponse.json({
      rewritten,
      references: referencesUsed,
      evaluations,
      provider: "tavily",
    });
  } catch (e: any) {
    return jsonError(e?.message || "Failed to fact-check with web grounding", 500);
  }
}


