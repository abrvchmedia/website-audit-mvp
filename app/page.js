"use client";
import { useState, useRef } from "react";
import AuthorityGauge from "@/components/AuthorityGauge";
import AuditRadarChart from "@/components/AuditRadarChart";
import ScoreCards from "@/components/ScoreCards";
import DetailTable from "@/components/DetailTable";
import AuditHistory from "@/components/AuditHistory";
import PDFExport from "@/components/PDFExport";

function AuditForm({ onAudit, loading }) {
  const [url, setUrl] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) onAudit(url.trim());
  };
  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-2xl">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://yourwebsite.com"
        className="flex-1 bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60 focus:bg-white/12 transition-all text-sm"
      />
      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/8 disabled:text-white/25 rounded-xl font-semibold transition-all text-white text-sm flex items-center gap-2 whitespace-nowrap"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Auditing...
          </>
        ) : (
          "Run Audit"
        )}
      </button>
    </form>
  );
}

export default function Home() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("results");
  const reportRef = useRef(null);

  const runAudit = async (url) => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Audit failed");
      else {
        setReport(data);
        setTab("results");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Build detail table rows
  const secRows = report
    ? [
        {
          label: "Security Grade",
          value: report.securityGrade,
          status: report.securityGrade === "A" ? "good" : report.securityGrade === "F" ? "bad" : "warn",
        },
        { label: "Score", value: `${report.securityScore} / 100` },
        { label: "Headers Present", value: `${report.securityHeadersPresent} / ${report.securityHeadersTotal}` },
        {
          label: "HSTS",
          value: report.securityHeaders?.["strict-transport-security"] ? "✓ Present" : "✗ Missing",
          status: report.securityHeaders?.["strict-transport-security"] ? "good" : "bad",
        },
        {
          label: "X-Frame-Options",
          value: report.securityHeaders?.["x-frame-options"] ? "✓ Present" : "✗ Missing",
          status: report.securityHeaders?.["x-frame-options"] ? "good" : "bad",
        },
        {
          label: "CSP",
          value: report.securityHeaders?.["content-security-policy"] ? "✓ Present" : "✗ Missing",
          status: report.securityHeaders?.["content-security-policy"] ? "good" : "bad",
        },
        {
          label: "X-Content-Type",
          value: report.securityHeaders?.["x-content-type-options"] ? "✓ Present" : "✗ Missing",
          status: report.securityHeaders?.["x-content-type-options"] ? "good" : "bad",
        },
      ]
    : [];

  const domainRows = report
    ? [
        { label: "Domain", value: report.domain },
        {
          label: "Domain Age",
          value: report.domainAge ? `${report.domainAge} years` : "Unknown",
        },
        { label: "Age Score", value: `${report.domainAgeScore} / 100` },
        {
          label: "Registered",
          value: report.domainCreatedDate
            ? new Date(report.domainCreatedDate).toLocaleDateString()
            : "Unknown",
        },
      ]
    : [];

  const contentRows = report
    ? [
        {
          label: "Word Count",
          value: report.wordCount?.toLocaleString() ?? "—",
          status: report.wordCount > 1000 ? "good" : report.wordCount > 300 ? "warn" : "bad",
        },
        { label: "Content Score", value: `${report.contentScore} / 100` },
        {
          label: "H1 Tags",
          value: report.h1Count,
          status: report.h1Count === 1 ? "good" : report.h1Count === 0 ? "bad" : "warn",
        },
        { label: "Heading Depth", value: `H1 – H${report.headingDepth || 1}` },
        {
          label: "Schema Markup",
          value: report.schemaDetected ? "✓ Detected" : "✗ Missing",
          status: report.schemaDetected ? "good" : "warn",
        },
        {
          label: "Open Graph Tags",
          value: report.ogTagsDetected ? "✓ Detected" : "✗ Missing",
          status: report.ogTagsDetected ? "good" : "warn",
        },
        {
          label: "Canonical Tag",
          value: report.canonicalDetected ? "✓ Present" : "✗ Missing",
          status: report.canonicalDetected ? "good" : "warn",
        },
        {
          label: "Images Missing Alt",
          value: report.imageWithoutAlt,
          status: report.imageWithoutAlt === 0 ? "good" : "bad",
        },
      ]
    : [];

  const seoRows = report
    ? [
        {
          label: "Page Title",
          value: report.title || "(none)",
          status: report.title ? "good" : "bad",
        },
        {
          label: "Meta Description",
          value: report.metaDescription
            ? report.metaDescription.length > 80
              ? report.metaDescription.slice(0, 80) + "…"
              : report.metaDescription
            : "(none)",
          status: report.metaDescription ? "good" : "bad",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[500px] h-[500px] bg-indigo-700/15 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-80 h-80 bg-violet-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-700/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-xs font-semibold tracking-wide mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            Authority Audit Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-transparent leading-tight">
            Website Authority Score
          </h1>
          <p className="text-white/40 text-base max-w-lg mx-auto">
            SEO · Performance · Security · Content · Domain Authority — all in one report
          </p>
        </div>

        {/* Audit form */}
        <div className="flex justify-center mb-10">
          <AuditForm onAudit={runAudit} loading={loading} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-24 space-y-5">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
            </div>
            <div>
              <p className="text-white/60 font-medium">Running full authority audit…</p>
              <p className="text-white/30 text-sm mt-1">
                PageSpeed · Security headers · WHOIS · Content analysis
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Report */}
        {report && (
          <div>
            {/* Tab bar */}
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit mb-8 border border-white/10">
              {[
                { id: "results", label: "Audit Report" },
                { id: "history", label: "History" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t.id
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/40 hover:text-white/65"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "results" && (
              <div ref={reportRef} className="space-y-5">
                {/* Authority gauge + Radar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-6">
                    <AuthorityGauge score={report.authorityScore} cached={report.cached} />
                    <div className="text-center space-y-1">
                      <p className="text-white/35 text-xs truncate max-w-[260px]">{report.url}</p>
                      <p className="text-white/20 text-xs">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-1">
                      Authority Breakdown
                    </p>
                    <AuditRadarChart data={report} />
                  </div>
                </div>

                {/* Score cards */}
                <ScoreCards data={report} />

                {/* Detail tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <DetailTable
                    title="Security Analysis"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    }
                    rows={secRows}
                  />
                  <DetailTable
                    title="Domain Authority"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    rows={domainRows}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <DetailTable
                    title="Content Analysis"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                    rows={contentRows}
                  />
                  <DetailTable
                    title="SEO Tags"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    }
                    rows={seoRows}
                  />
                </div>

                {/* Authority score formula note */}
                <div className="bg-white/3 border border-white/8 rounded-2xl px-5 py-4 text-white/35 text-xs space-y-1">
                  <p className="font-semibold text-white/50">Authority Score Formula</p>
                  <p>SEO (25%) + Performance (15%) + Domain Age (10%) + Security (10%) + Backlinks (20%*) + Content (20%)</p>
                  <p className="text-white/25">* Backlink data requires a paid API key (Ahrefs / Moz). Currently contributing 0.</p>
                </div>

                {/* PDF export */}
                <div className="flex justify-end">
                  <PDFExport
                    reportRef={reportRef}
                    url={report.url}
                    authorityScore={report.authorityScore}
                  />
                </div>
              </div>
            )}

            {tab === "history" && <AuditHistory />}
          </div>
        )}

        {/* History shown when no report yet */}
        {!report && !loading && (
          <div className="mt-4">
            <p className="text-white/30 text-sm font-medium mb-4 uppercase tracking-wide">
              Audit History
            </p>
            <AuditHistory />
          </div>
        )}
      </div>
    </div>
  );
}
