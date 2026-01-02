"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [error, setError] = useState(null);
  const [rawText, setRawText] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");

  // 🕷️ الزحف على الموقع
  const handleCrawl = async () => {
    setError(null);
    setRawText("");
    setAnalysisResult("");
    setActiveAction("crawl");

    if (!url.trim()) {
      setError("Please enter a website URL first.");
      setActiveAction(null);
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
        throw new Error(data?.error || "Unknown error while crawling");
      }

      const pages = Array.isArray(data.data) ? data.data : [];

      let markdown = pages
        .map((p) => p.markdown || "")
        .filter((m) => m.trim().length > 0)
        .join("\n\n-------------------------\n\n");

      // 🧹 تنظيف كامل — بدون روابط أو صور أو Base64
      markdown = markdown
        // حذف الصور بصيغة Markdown
        .replace(/!\[[^\]]*]\([^)]*\)/g, "")
        .replace(/!\[\]\([^)]*\)/g, "")

        // حذف أي روابط Markdown مثل [text](url) — لكن نُبقي النص فقط
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1")

        // حذف الروابط النصية المباشرة
        .replace(/https?:\/\/[^\s)]+/g, "")

        // حذف Base64 placeholder
        .replace(/<Base64-Image-Removed>/g, "")

        // تنظيف الفراغات الزائدة
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      setRawText(
        markdown || "Crawling completed, but no meaningful text was found."
      );
    } catch (e) {
      setError(e.message || "Error while crawling website");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  // 🧠 تشغيل أي مود تحليل
  const runAnalysis = async (actionName) => {
    setError(null);
    setAnalysisResult("");
    setActiveAction(actionName);

    if (!rawText.trim()) {
      setError("No content to analyze. Please crawl a website first.");
      setActiveAction(null);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionName,
          payload: { markdown: rawText },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Unknown error while analyzing");
      }

      const summary = data.summary || JSON.stringify(data, null, 2);
      setAnalysisResult(summary);
    } catch (e) {
      setError(e.message || "Error while running analysis");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const isBusy = (name) => loading && activeAction === name;

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
          maxWidth: "900px",
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
          Firecrawl Competitor Analyzer
        </h1>

        {/* URL Input */}
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
        >
          Website URL
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

        {/* Crawl Button */}
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
            opacity: isBusy("crawl") ? 0.7 : 1,
            cursor: loading ? "default" : "pointer",
            marginBottom: "12px",
          }}
        >
          {isBusy("crawl") ? "Crawling..." : "1️⃣ Crawl Website"}
        </button>

        {/* Analysis Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <button
            onClick={() => runAnalysis("competitorPowerScore")}
            disabled={loading || !rawText}
            style={{
              flex: 1,
              minWidth: "180px",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              backgroundColor: rawText ? "#2563eb" : "#9ca3af",
              color: "#fff",
              opacity: isBusy("competitorPowerScore") ? 0.7 : 1,
              cursor:
                loading || !rawText ? "not-allowed" : "pointer",
            }}
          >
            {isBusy("competitorPowerScore")
              ? "Analyzing..."
              : "🏆 Competitor Power Score"}
          </button>

          <button
            onClick={() => runAnalysis("stealableIdeas")}
            disabled={loading || !rawText}
            style={{
              flex: 1,
              minWidth: "180px",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              backgroundColor: rawText ? "#0f766e" : "#9ca3af",
              color: "#fff",
              opacity: isBusy("stealableIdeas") ? 0.7 : 1,
              cursor:
                loading || !rawText ? "not-allowed" : "pointer",
            }}
          >
            {isBusy("stealableIdeas")
              ? "Analyzing..."
              : "💡 Stealable Ideas"}
          </button>

          <button
            onClick={() => runAnalysis("fakeAIDetector")}
            disabled={loading || !rawText}
            style={{
              flex: 1,
              minWidth: "180px",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              backgroundColor: rawText ? "#7c3aed" : "#9ca3af",
              color: "#fff",
              opacity: isBusy("fakeAIDetector") ? 0.7 : 1,
              cursor:
                loading || !rawText ? "not-allowed" : "pointer",
            }}
          >
            {isBusy("fakeAIDetector")
              ? "Analyzing..."
              : "🤖 Fake AI Detector"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p style={{ marginTop: "10px", color: "red", fontSize: "14px" }}>
            {error}
          </p>
        )}

        {/* Raw Crawled Content */}
        {rawText && (
          <div style={{ marginTop: "16px" }}>
            <h2
              style={{
                fontWeight: 600,
                marginBottom: "8px",
                fontSize: "15px",
              }}
            >
              Raw Content (Links Removed)
            </h2>

            <textarea
              readOnly
              value={rawText}
              style={{
                width: "100%",
                height: "200px",
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

        {/* AI Result */}
        {analysisResult && (
          <div style={{ marginTop: "16px" }}>
            <h2
              style={{
                fontWeight: 600,
                marginBottom: "8px",
                fontSize: "15px",
              }}
            >
              AI Report
            </h2>

            <textarea
              readOnly
              value={analysisResult}
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
