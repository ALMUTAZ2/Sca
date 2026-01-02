import { NextResponse } from "next/server";
import firecrawl from "@/lib/firecrawlClient";

export async function POST(request) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json(
        { error: "حقل 'url' مطلوب" },
        { status: 400 }
      );
    }

    const result = await firecrawl.crawl(url, {
      formats: ["markdown"],
      limit: 10
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Firecrawl error:", err);
    return NextResponse.json(
      {
        error: "فشل الزحف على الرابط",
        details: err?.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
