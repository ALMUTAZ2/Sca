"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState("");

  const handleCrawl = async () => {
    setError(null);
    setResult("");

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
        throw new Error(data?.error || "خطأ غير معروف");
      }

      // 1) نجمع كل الـ markdown من الصفحات
      const pages = Array.isArray(data.data) ? data.data : [];
      let markdown = pages
        .map((p) => p.markdown || "")
        .filter((m) => m.trim().length > 0)
        .join("\n\n-------------------------\n\n");

      // 2) نحذف الصور وصيغ Base64 من الـ markdown
      markdown = markdown
        // نحذف ![alt](url)
        .replace(/!\[[^\]]*]\([^)]*\)/g, "")
        // نحذف ![](url)
        .replace(/!\[\]\([^)]*\)/g, "")
        // نحذف النص placeholder حق Base64
        .replace(/<Base64-Image-Removed>/g, "")
        // نرتّب الأسطر الفارغة
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      setResult(markdown || "تم الزحف لكن ماوجدنا نص مناسب للعرض.");
    } catch (e) {
      setError(e.message || "حدث خطأ أثناء الزحف");
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
          maxWidth: "600px",
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
          Firecrawl Crawler
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

        <button
          onClick={handleCrawl}
          disabled={loading}
          style={{
            width: "100%",
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
          {loading ? "جارٍ الزحف..." : "Start Crawling"}
        </button>

        {error && (
          <p style={{ marginTop: "10px", color: "red", fontSize: "14px" }}>
            {error}
          </p>
        )}

        {result && (
          <div style={{ marginTop: "16px" }}>
            <h2
              style={{
                fontWeight: 600,
                marginBottom: "8px",
                fontSize: "15px",
              }}
            >
              Result (Clean Text)
            </h2>

            <textarea
              readOnly
              value={result}
              style={{
                width: "100%",
                height: "260px",
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
      </div>
    </main>
  );
}
