import { NextResponse } from "next/server";
import Firecrawl from "@mendable/firecrawl-js";

const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY as string,
});

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();

    switch (action) {
      case "crawlWebsite": {
        const url = payload?.url;

        const result = await firecrawl.crawl(url, {
          formats: ["markdown"],
          limit: 10,
        });

        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
