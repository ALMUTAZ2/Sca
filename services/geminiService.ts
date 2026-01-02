// services/geminiService.ts

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

  /**
   * استخدام Firecrawl لعمل Crawl لموقع وإرجاع النتيجة
   * تستدعي الأكشن "crawlWebsite" في الباكند
   */
  async crawlWebsite(url: string): Promise<any> {
    const result = await this.callBackend("crawlWebsite", { url });
    return result;
  }
}

// instance جاهزة للاستخدام
const geminiService = new GeminiService();
export default geminiService;
