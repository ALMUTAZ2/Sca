import { NextResponse } from "next/server";
import Firecrawl from "@mendable/firecrawl-js";

const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY as string,
});

// 🔑 مفتاح Groq من متغيرات البيئة
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// دالة مساعدة لاستدعاء موديل Groq
async function callAIModel(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API error (${response.status}): ${text}`);
  }

  const data: any = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content === "string") return content;

  // لو رجع مصفوفة أجزاء
  if (Array.isArray(content)) {
    return content.map((c: any) => c?.text || "").join("\n");
  }

  return "";
}

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();

    switch (action) {
      // ✅ 1) الزحف على الموقع باستخدام Firecrawl
      case "crawlWebsite": {
        const url = payload?.url as string | undefined;

        if (!url) {
          return NextResponse.json(
            { error: "url is required" },
            { status: 400 }
          );
        }

        const options: any = {
          formats: ["markdown"],
          limit: 10,
        };

        const result = await (firecrawl as any).crawl(url, options);

        return NextResponse.json(result, { status: 200 });
      }

      // ✅ 2) تلخيص المحتوى واستخراج النقاط المهمة (أرقام + مميزات + جمهور + ATS + AI)
      case "summarizeWebsite": {
        const markdown = payload?.markdown as string | undefined;

        if (!markdown) {
          return NextResponse.json(
            { error: "markdown is required" },
            { status: 400 }
          );
        }

        const systemPrompt = `
You are an AI product analyst. You receive raw markdown content of a SaaS or product website.
Your job is to extract a concise, structured summary that is useful for a competitor / feature analysis.
Focus especially on: numbers, social proof, ATS features, AI features, pricing/trial model, and target users.
Return your answer as clean Markdown text (no code blocks).
        `.trim();

        const userPrompt = `
Here is the website content in markdown:

${markdown}

Analyze this website and produce a concise summary with these sections:

1. **Main Value Proposition** – 2–4 lines.
2. **Key Numbers & Social Proof** – bullet list (users, reviews, years, blog stats, etc).
3. **Core Features** – bullet list of main features.
4. **AI Features** – bullet list of AI-related capabilities (if any).
5. **ATS / Resume-Related Claims** – bullet list of how they handle ATS, parsing, keyword match, etc (if mentioned).
6. **Target Users / Segments** – bullet list (e.g. executives, students, career switchers, etc).
7. **Pricing / Trial Model** – short description (free trial, freemium, Pro only, etc) if available from the text.
8. **Notable Ideas You Can Reuse** – bullet list of product / UX ideas that could inspire another platform.

If some sections are not mentioned in the text, include the section title and write: "Not clearly specified on the site".
        `.trim();

        const summary = await callAIModel(systemPrompt, userPrompt);

        return NextResponse.json(
          { summary },
          { status: 200 }
        );
      }

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (e: any) {
    console.error("API /api/groq error:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
