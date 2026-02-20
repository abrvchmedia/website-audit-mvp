"use client";
import { useState, useRef } from "react";
import OverviewTab from "@/components/tabs/OverviewTab";
import TechnicalTab from "@/components/tabs/TechnicalTab";
import CrawlTab from "@/components/tabs/CrawlTab";
import KeywordsTab from "@/components/tabs/KeywordsTab";
import CompetitorsTab from "@/components/tabs/CompetitorsTab";
import HistoryTab from "@/components/tabs/HistoryTab";
import RecommendationsTab from "@/components/tabs/RecommendationsTab";

const TABS = [
  { id: "overview", label: "Overview", icon: "◉" },
  { id: "recommendations", label: "Recommendations", icon: "💡" },
  { id: "technical", label: "Technical", icon: "⚙" },
  { id: "crawl", label: "Crawl", icon: "🕷" },
  { id: "keywords", label: "Keywords", icon: "📈" },
  { id: "competitors", label: "Competitors", icon: "⚔" },
  { id: "history", label: "History", icon: "📊" },
];

export default function Home() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [url, setUrl] = useState("");
  const reportRef = useRef(null);

  // Always derive domain from url — handles cached results from before domain was in schema
  const reportDomain =
    report?.domain ||
    (report?.url
      ? (() => { try { return new URL(report.url).hostname; } catch { return ""; } })()
      : "");

  const runAudit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);
    setActiveTab("overview");

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        body: JSON.stringify({ url: url.trim() }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Audit failed");
      else setReport(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-3xl" />
        <div className="absolute top-10 right-0 w-96 h-96 bg-violet-700/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-700/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10 pb-24">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-xs font-semibold tracking-wide mb-5">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            SEO Monitoring Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-transparent leading-tight">
            Authority Audit Engine
          </h1>
          <p className="text-white/35 text-base max-w-xl mx-auto">
            Keyword tracking · Multi-page crawl · Competitor analysis · Technical SEO · Daily monitoring
          </p>
        </div>

        {/* Audit form */}
        <form onSubmit={runAudit} className="flex gap-3 max-w-2xl mx-auto mb-10">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="flex-1 bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/60 focus:bg-white/12 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/8 disabled:text-white/20 rounded-xl font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-all"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Auditing…
              </>
            ) : (
              "Run Audit"
            )}
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="text-center py-24 space-y-5">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
            </div>
            <div>
              <p className="text-white/55 font-medium">Running full authority audit…</p>
              <p className="text-white/25 text-sm mt-1">PageSpeed · Security · WHOIS · Sitemap · Robots.txt · Content</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Report tabs */}
        {report && (
          <div>
            {/* Tab bar */}
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit mb-7 border border-white/10 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === t.id
                      ? "bg-white/15 text-white"
                      : "text-white/35 hover:text-white/60"
                  }`}
                >
                  <span className="text-xs">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "overview" && (
              <OverviewTab report={report} reportRef={reportRef} />
            )}
            {activeTab === "recommendations" && (
              <RecommendationsTab report={report} />
            )}
            {activeTab === "technical" && <TechnicalTab report={report} />}
            {activeTab === "crawl" && <CrawlTab url={report.url} />}
            {activeTab === "keywords" && <KeywordsTab domain={reportDomain} />}
            {activeTab === "competitors" && <CompetitorsTab mainReport={report} />}
            {activeTab === "history" && <HistoryTab domain={reportDomain} />}
          </div>
        )}

        {/* Default history when no audit run */}
        {!report && !loading && (
          <div className="mt-2">
            <p className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-4">Recent Audits</p>
            <HistoryDefaultView />
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryDefaultView() {
  const [history, setHistory] = useState(null);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    return (
      <button
        onClick={async () => {
          try {
            const res = await fetch("/api/history");
            const data = await res.json();
            setHistory(Array.isArray(data) ? data.slice(0, 8) : []);
          } catch {
            setHistory([]);
          }
          setLoaded(true);
        }}
        className="text-indigo-400 hover:text-indigo-300 text-sm"
      >
        Load recent audits →
      </button>
    );
  }

  if (!history?.length)
    return <p className="text-white/25 text-sm">No audits yet. Run your first audit above.</p>;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["Domain", "Authority", "SEO", "Performance", "Security", "Date"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-white/30 font-medium text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((a) => {
              const color =
                a.authorityScore >= 80
                  ? "text-emerald-400"
                  : a.authorityScore >= 60
                  ? "text-yellow-400"
                  : "text-red-400";
              return (
                <tr key={a._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3 text-white/60 font-medium">{a.domain}</td>
                  <td className={`px-4 py-3 font-black ${color}`}>{a.authorityScore}</td>
                  <td className="px-4 py-3 text-white/45">{a.seo}</td>
                  <td className="px-4 py-3 text-white/45">{a.performance}</td>
                  <td className="px-4 py-3 text-white/45">{a.securityScore}</td>
                  <td className="px-4 py-3 text-white/30 text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
