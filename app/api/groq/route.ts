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
        const url = payload?.url as string | undefined;

        if (!url) {
          return NextResponse.json(
            { error: "url is required" },
            { status: 400 }
          );
        }

        // نستخدم any عشان نتجاوز مشكلة typings على خيار formats
        const options: any = {
          formats: ["markdown"],
          limit: 10,
        };

        const result = await (firecrawl as any).crawl(url, options);

        return NextResponse.json(result, { status: 200 });
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
