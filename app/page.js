"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAudit = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Audit failed");
      } else {
        setReport(data);
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 90) return "#0cce6b";
    if (score >= 50) return "#ffa400";
    return "#ff4e42";
  };

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Website Audit MVP</h1>
      <p style={{ color: "#666", marginBottom: 28 }}>
        Enter a URL to run a full PageSpeed + SEO audit.
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runAudit()}
          placeholder="https://example.com"
          style={{
            flex: 1,
            padding: "10px 14px",
            fontSize: 15,
            border: "1px solid #ccc",
            borderRadius: 6,
            outline: "none"
          }}
        />
        <button
          onClick={runAudit}
          disabled={loading || !url}
          style={{
            padding: "10px 22px",
            fontSize: 15,
            background: loading ? "#999" : "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Auditing..." : "Run Audit"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 24, padding: 16, background: "#fff0f0", border: "1px solid #ffcdd2", borderRadius: 8, color: "#c00" }}>
          {error}
        </div>
      )}

      {report && (
        <div style={{ marginTop: 30 }}>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>Audit Results</h2>
          <p style={{ color: "#666", marginBottom: 20, fontSize: 13 }}>{report.url}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Performance", value: report.performance },
              { label: "Accessibility", value: report.accessibility },
              { label: "SEO", value: report.seo },
              { label: "Best Practices", value: report.bestPractices }
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: 20, border: "1px solid #eee", borderRadius: 10, textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: scoreColor(value) }}>{value}</div>
                <div style={{ fontSize: 14, color: "#555", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {[
                { label: "Page Title", value: report.title || "(none)" },
                { label: "Meta Description", value: report.metaDescription || "(none)" },
                { label: "H1 Tags", value: report.h1Count },
                { label: "Images Missing Alt Text", value: report.imageWithoutAlt }
              ].map(({ label, value }) => (
                <tr key={label} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px 4px", color: "#555", width: "45%" }}>{label}</td>
                  <td style={{ padding: "10px 4px", fontWeight: 500 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
