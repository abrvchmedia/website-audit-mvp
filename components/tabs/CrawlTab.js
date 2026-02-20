"use client";
import { useState } from "react";

const SEVERITY_CONFIG = {
  critical: { label: "Critical", bg: "bg-red-500/15", border: "border-red-500/25", text: "text-red-400", dot: "bg-red-400" },
  warning: { label: "Warning", bg: "bg-yellow-500/15", border: "border-yellow-500/25", text: "text-yellow-400", dot: "bg-yellow-400" },
  info: { label: "Info", bg: "bg-blue-500/15", border: "border-blue-500/25", text: "text-blue-400", dot: "bg-blue-400" },
};

export default function CrawlTab({ url }) {
  const [crawlData, setCrawlData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [pageView, setPageView] = useState(false);

  const runCrawl = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Crawl failed");
      else setCrawlData(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!crawlData && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5">
        <div className="text-4xl">🕷️</div>
        <div className="text-center">
          <p className="text-white/70 font-semibold mb-1">Multi-Page Crawl Engine</p>
          <p className="text-white/35 text-sm max-w-sm">Crawl up to 25 internal pages and detect SEO issues, thin content, broken links, and more.</p>
        </div>
        <button
          onClick={runCrawl}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-sm transition-all"
        >
          Start Crawl
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-white/50">Crawling up to 25 pages…</p>
        <p className="text-white/25 text-sm">This may take up to 60 seconds</p>
      </div>
    );
  }

  const criticals = crawlData.issues.filter((i) => i.severity === "critical");
  const warnings = crawlData.issues.filter((i) => i.severity === "warning");
  const infos = crawlData.issues.filter((i) => i.severity === "info");

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Pages Crawled", value: crawlData.pagesChecked, color: "text-white" },
          { label: "Health Score", value: crawlData.overallHealthScore, color: crawlData.overallHealthScore >= 80 ? "text-emerald-400" : crawlData.overallHealthScore >= 60 ? "text-yellow-400" : "text-red-400" },
          { label: "Critical Issues", value: criticals.reduce((s, i) => s + i.count, 0), color: "text-red-400" },
          { label: "Warnings", value: warnings.reduce((s, i) => s + i.count, 0), color: "text-yellow-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className={`text-3xl font-black ${color}`}>{value}</div>
            <div className="text-white/40 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Issue prioritization list */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-white/75 text-sm">Issue Prioritization</h3>
          <button
            onClick={() => setPageView(!pageView)}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            {pageView ? "Show issues" : "Show pages"}
          </button>
        </div>

        {!pageView ? (
          <div className="divide-y divide-white/5">
            {crawlData.issues.length === 0 ? (
              <p className="px-5 py-6 text-emerald-400 text-sm">✓ No issues found across all crawled pages</p>
            ) : (
              crawlData.issues.map((issue, i) => {
                const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.info;
                const isOpen = expandedIssue === i;
                return (
                  <div key={i}>
                    <button
                      onClick={() => setExpandedIssue(isOpen ? null : i)}
                      className="w-full px-5 py-3.5 flex items-start gap-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-white/75 font-medium">{issue.message}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                            {issue.count} {issue.count === 1 ? "page" : "pages"}
                          </span>
                        </div>
                      </div>
                      <span className="text-white/25 text-xs mt-0.5">{isOpen ? "▲" : "▼"}</span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-3 pl-10 space-y-1">
                        {issue.pages.map((p, j) => (
                          <p key={j} className="text-white/35 text-xs truncate">{p}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Page", "Health", "H1", "Words", "Title", "Meta"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-white/35 font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crawlData.pages.map((page, i) => {
                  const hc = page.healthScore >= 80 ? "text-emerald-400" : page.healthScore >= 60 ? "text-yellow-400" : "text-red-400";
                  return (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-4 py-2.5 text-white/55 text-xs max-w-[200px] truncate">{new URL(page.url).pathname || "/"}</td>
                      <td className={`px-4 py-2.5 font-bold ${hc}`}>{page.healthScore}</td>
                      <td className={`px-4 py-2.5 text-xs ${page.h1Count === 1 ? "text-emerald-400" : page.h1Count === 0 ? "text-red-400" : "text-yellow-400"}`}>{page.h1Count}</td>
                      <td className={`px-4 py-2.5 text-xs ${page.wordCount >= 300 ? "text-white/55" : "text-yellow-400"}`}>{page.wordCount}</td>
                      <td className={`px-4 py-2.5 text-xs ${page.title ? "text-emerald-400" : "text-red-400"}`}>{page.title ? "✓" : "✗"}</td>
                      <td className={`px-4 py-2.5 text-xs ${page.metaDesc ? "text-emerald-400" : "text-red-400"}`}>{page.metaDesc ? "✓" : "✗"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Duplicate titles */}
      {crawlData.duplicateTitles?.length > 0 && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-5">
          <p className="text-red-400 font-semibold text-sm mb-3">⚠ Duplicate Page Titles ({crawlData.duplicateTitles.length})</p>
          <div className="space-y-2">
            {crawlData.duplicateTitles.map((dup, i) => (
              <div key={i}>
                <p className="text-white/60 text-xs font-medium mb-1">"{dup.title}"</p>
                {dup.pages.map((p, j) => <p key={j} className="text-white/30 text-xs pl-3">• {p}</p>)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={runCrawl} className="text-xs text-indigo-400 hover:text-indigo-300">
          Re-crawl ↻
        </button>
      </div>
    </div>
  );
}
