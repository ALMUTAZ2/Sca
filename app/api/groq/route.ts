import { NextResponse } from "next/server";
import Firecrawl from "@mendable/firecrawl-js";

const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY as string,
});

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Helper to call Groq chat completion
async function callAIModel(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API error (${response.status}): ${text}`);
  }

  const data: any = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((c: any) => c?.text || "").join("\n");
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();

    switch (action) {
      // 🕷️ Crawl website with Firecrawl
      case "crawlWebsite": {
        const url = payload?.url as string | undefined;

        if (!url) {
          return NextResponse.json(
            { error: "url is required" },
            { status: 400 }
          );
        }

        const options = {
          formats: ["markdown"],
          limit: 10,
        };

        const result = await (firecrawl as any).crawl(url, options);
        return NextResponse.json(result, { status: 200 });
      }

      // 🏆 Competitor Power Score
      case "competitorPowerScore": {
        const markdown = payload?.markdown as string | undefined;

        if (!markdown) {
          return NextResponse.json(
            { error: "markdown is required" },
            { status: 400 }
          );
        }

        const MAX_CHARS = 6000;
        const trimmed =
          markdown.length > MAX_CHARS
            ? markdown.slice(0, MAX_CHARS)
            : markdown;

        const systemPrompt = `
You are a SaaS competitive intelligence analyst.
You analyze competitor product websites and score them objectively based on multiple dimensions.
Return clear structured analysis in clean Markdown. No emojis. No code blocks.
        `.trim();

        const userPrompt = `
Here is the website content (truncated):

${trimmed}

Your task:

Evaluate this product across the following categories.
Each category must receive a score from 1–10 AND a short justification.

Categories:
1. Product Strength
2. Feature Depth
3. AI Capability Level
4. ATS Credibility (if applicable)
5. UX & Ease of Use
6. Marketing & Copy Quality
7. Social Proof & Trust
8. Pricing Strategy Competitiveness
9. Market Positioning Clarity
10. Overall Strategic Power

Then compute:
Final Score = Average of all category scores (0–100)

Return this structure (in Markdown):

## Competitor Power Score
**Final Score:** XX / 100

### Category Breakdown
- Product Strength — X/10
- Feature Depth — X/10
- AI Capability — X/10
- ATS Credibility — X/10
- UX — X/10
- Marketing / Copy — X/10
- Social Proof — X/10
- Pricing — X/10
- Positioning — X/10
- Strategic Power — X/10

### Why this score?
Short paragraph explaining the reasoning.

### Key Strengths
- bullet points

### Key Weaknesses / Risks
- bullet points

### Who they are best for
- bullet list of user personas

If information is missing, you may infer based on tone and content, but mention uncertainty explicitly.
        `.trim();

        const summary = await callAIModel(systemPrompt, userPrompt);

        return NextResponse.json({ summary }, { status: 200 });
      }

      // 💡 Stealable Ideas Extractor
      case "stealableIdeas": {
        const markdown = payload?.markdown as string | undefined;

        if (!markdown) {
          return NextResponse.json(
            { error: "markdown is required" },
            { status: 400 }
          );
        }

        const MAX_CHARS = 6000;
        const trimmed =
          markdown.length > MAX_CHARS
            ? markdown.slice(0, MAX_CHARS)
            : markdown;

        const systemPrompt = `
You are a product strategist specializing in extracting reusable SaaS ideas ethically.
You focus on product concepts, UX patterns, growth tactics, and copywriting hooks.
Return clean Markdown only. No code blocks.
        `.trim();

        const userPrompt = `
Here is the website content (truncated):

${trimmed}

Extract the most valuable product and UX ideas from this platform.

Return in this format (Markdown):

## Stealable Product Ideas (Ethically Reusable)

### High-Impact Product Concepts
For each idea, use this pattern:
- **Idea:** ...
- **Why it works:** ...

### UX / Onboarding / Growth Tactics
For each tactic:
- **Tactic:** ...
- **Why it improves conversion or engagement:** ...

### Psychological Hooks in Their Copy
List the main patterns in their copy:
- Hook type + short example pattern
- Why this works psychologically

### Suggested Implementation in Our Platform
Explain how we could build similar concepts WITHOUT copying them directly.
Be specific and practical (mention flows, features, or UI patterns we can implement).

### Differentiation Opportunities
How we could go beyond their approach:
- bullet points

Do NOT mention law or legal terms. Stay focused on product and strategy.
        `.trim();

        const summary = await callAIModel(systemPrompt, userPrompt);

        return NextResponse.json({ summary }, { status: 200 });
      }

      // 🤖 Fake AI Detector
      case "fakeAIDetector": {
        const markdown = payload?.markdown as string | undefined;

        if (!markdown) {
          return NextResponse.json(
            { error: "markdown is required" },
            { status: 400 }
          );
        }

        const MAX_CHARS = 6000;
        const trimmed =
          markdown.length > MAX_CHARS
            ? markdown.slice(0, MAX_CHARS)
            : markdown;

        const systemPrompt = `
You are an expert AI systems evaluator.
Your goal is to determine whether a SaaS platform is really using advanced AI or mostly marketing buzzwords.
        `.trim();

        const userPrompt = `
Here is the website content (truncated):

${trimmed}

Analyze and answer in Markdown with this structure:

## AI Authenticity Score
Score: XX / 100

### Evidence Supporting REAL AI Use
- bullet list of concrete clues (technical details, ML pipeline hints, data usage, model types, etc.)

### Evidence Suggesting Marketing / Shallow AI
- bullet list of clues (vague promises, generic "AI-powered" claims, no technical detail, no mention of data or models, etc.)

### Technical Maturity Level
Choose ONE and explain briefly:
- Basic automation with templates
- Simple API wrapper around third-party AI
- Moderate ML-based personalization or scoring
- Mature AI system with clear data + model pipeline

### Risk of Exaggerated AI Marketing
Rate as: Low / Medium / High
Explain why.

### Final Verdict
1–2 short paragraphs summarizing:
- How real their AI likely is
- How much is branding vs. substance
- Any major red flags or positive signals

If you are uncertain, state the uncertainty level explicitly.
        `.trim();

        const summary = await callAIModel(systemPrompt, userPrompt);

        return NextResponse.json({ summary }, { status: 200 });
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
