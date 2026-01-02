// services/geminiService.ts
import {
  AnalysisResult,
  JobMatchResult,
  ResumeSection,
  ImprovedContent,
} from "../types";

export class GeminiService {
  /**
   * دالة عامة للاتصال بالباكند
   */
  private async callBackend(action: string, payload: any): Promise<any> {
    try {
      const response = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (!data) {
        throw new Error("No data returned from backend");
      }

      return data;
    } catch (error: any) {
      console.error("callBackend error:", error);
      throw new Error(error.message || "Unknown backend error");
    }
  }

  // ✅ تحليـل السيرة (مثال قديم عندك)
  async analyzeResume(content: string): Promise<AnalysisResult> {
    const result = await this.callBackend("analyzeResume", { content });
    return result as AnalysisResult;
  }

  // ✅ تحسين جزء من السيرة (مثال)
  async improveSection(
    section: ResumeSection,
    content: string
  ): Promise<ImprovedContent> {
    const result = await this.callBackend("improveSection", {
      section,
      content,
    });
    return result as ImprovedContent;
  }

  // ⬇️⬇️⬇️ الدالة الجديدة الخاصة بـ Firecrawl ⬇️⬇️⬇️

  /**
   * استخدام Firecrawl لعمل Crawl لموقع وإرجاع النتيجة
   * تستدعي الأكشن "crawlWebsite" في الباكند
   */
  async crawlWebsite(url: string): Promise<any> {
    const result = await this.callBackend("crawlWebsite", { url });
    return result;
  }
}

// تقدر تنشئ instance جاهزة:
const geminiService = new GeminiService();
export default geminiService;
