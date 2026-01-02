"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");     // النص المنظّف من Firecrawl
  const [summary, setSummary] = useState("");     // ملخص AI

  // 🕷️ الزحف على الموقع
  const handleCrawl = async () => {
    setError(null);
    setRawText("");
    setSummary("");

    if (!url.trim()) {
      setError("ادخل رابط الموقع أولاً");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "crawlWebsite",
          payload: { url },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "خطأ غير معروف أثناء الزحف");
      }

      // 1) نجمع كل الـ markdown من الصفحات
      const pages = Array.isArray(data.data) ? data.data : [];
      let markdown = pages
        .map((p) => p.markdown || "")
        .filter((m) => m.trim().length > 0)
        .join("\n\n-------------------------\n\n");

      // 2) نحذف الصور وصيغ Base64 من الـ markdown
      markdown = markdown
        .replace(/!\[[^\]]*]\([^)]*\)/g, "")   // ![alt](url)
        .replace(/!\[\]\([^)]*\)/g, "")        // ![](url)
        .replace(/<Base64-Image-Removed>/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      setRawText(markdown || "تم الزحف لكن ماوجدنا نص مناسب للعرض.");
    } catch (e) {
      setError(e.message || "حدث خطأ أثناء الزحف");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 تلخيص المحتوى واستخراج النقاط المهمة
  const handleSummarize = async () => {
    setError(null);
    setSummary("");

    if (!rawText.trim()) {
      setError("لا يوجد محتوى لتحليله. قم بالزحف أولاً.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summarizeWebsite",
          payload: { markdown: rawText },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "خطأ غير معروف أثناء التلخيص");
      }

      setSummary(data.summary || "لم يتم إرجاع ملخص من الواجهة الخلفية.");
    } catch (e) {
      setError(e.message || "حدث خطأ أثناء التلخيص");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
        padding: "24px",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "20px",
          marginTop: "40px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          Firecrawl + AI Researcher
        </h1>

        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
        >
          URL
        </label>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginBottom: "12px",
            outline: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <button
            onClick={handleCrawl}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              backgroundColor: "#111",
              color: "#fff",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "جارٍ التنفيذ..." : "1️⃣ Crawl الموقع"}
          </button>

          <button
            onClick={handleSummarize}
            disabled={loading || !rawText}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              backgroundColor: rawText ? "#2563eb" : "#9ca3af",
              color: "#fff",
              opacity: loading ? 0.7 : 1,
              cursor:
                loading || !rawText ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "جارٍ التنفيذ..." : "2️⃣ تلخيص النقاط المهمة"}
          </button>
        </div>

        {error && (
          <p style={{ marginTop: "10px", color: "red", fontSize: "14px" }}>
            {error}
          </p>
        )}

        {rawText && (
          <div style={{ marginTop: "16px" }}>
            <h2
              style={{
                fontWeight: 600,
                marginBottom: "8px",
                fontSize: "15px",
              }}
            >
              Raw Content (Cleaned)
            </h2>

            <textarea
              readOnly
              value={rawText}
              style={{
                width: "100%",
                height: "220px",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontFamily: "monospace",
                fontSize: "12px",
                whiteSpace: "pre-wrap",
              }}
            />
          </div>
        )}

        {summary && (
          <div style={{ marginTop: "16px" }}>
            <h2
              style={{
                fontWeight: 600,
                marginBottom: "8px",
                fontSize: "15px",
              }}
            >
              AI Summary (Key Points)
            </h2>

            <textarea
              readOnly
              value={summary}
              style={{
                width: "100%",
                height: "220px",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid "#ddd",
                fontFamily: "monospace",
                fontSize: "12px",
                whiteSpace: "pre-wrap",
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
