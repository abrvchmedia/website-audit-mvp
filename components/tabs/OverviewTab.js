"use client";
import AuthorityGauge from "@/components/AuthorityGauge";
import AuditRadarChart from "@/components/AuditRadarChart";
import ScoreCards from "@/components/ScoreCards";
import DetailTable from "@/components/DetailTable";
import PDFExport from "@/components/PDFExport";

export default function OverviewTab({ report, reportRef }) {
  const secRows = [
    { label: "Grade", value: report.securityGrade, status: report.securityGrade === "A" ? "good" : report.securityGrade === "F" ? "bad" : "warn" },
    { label: "Score", value: `${report.securityScore} / 100` },
    { label: "Headers Present", value: `${report.securityHeadersPresent} / ${report.securityHeadersTotal}` },
    { label: "HSTS", value: report.securityHeaders?.["strict-transport-security"] ? "✓ Present" : "✗ Missing", status: report.securityHeaders?.["strict-transport-security"] ? "good" : "bad" },
    { label: "CSP", value: report.securityHeaders?.["content-security-policy"] ? "✓ Present" : "✗ Missing", status: report.securityHeaders?.["content-security-policy"] ? "good" : "bad" },
    { label: "X-Frame-Options", value: report.securityHeaders?.["x-frame-options"] ? "✓ Present" : "✗ Missing", status: report.securityHeaders?.["x-frame-options"] ? "good" : "bad" },
  ];

  const domainRows = [
    { label: "Domain", value: report.domain },
    { label: "Domain Age", value: report.domainAge ? `${report.domainAge} years` : "Unknown" },
    { label: "Age Score", value: `${report.domainAgeScore} / 100` },
    { label: "Registered", value: report.domainCreatedDate ? new Date(report.domainCreatedDate).toLocaleDateString() : "Unknown" },
  ];

  const contentRows = [
    { label: "Word Count", value: report.wordCount?.toLocaleString() ?? "—", status: report.wordCount > 1000 ? "good" : report.wordCount > 300 ? "warn" : "bad" },
    { label: "Content Score", value: `${report.contentScore} / 100` },
    { label: "H1 Tags", value: report.h1Count, status: report.h1Count === 1 ? "good" : report.h1Count === 0 ? "bad" : "warn" },
    { label: "Schema Markup", value: report.schemaDetected ? "✓ Detected" : "✗ Missing", status: report.schemaDetected ? "good" : "warn" },
    { label: "Open Graph", value: report.ogTagsDetected ? "✓ Detected" : "✗ Missing", status: report.ogTagsDetected ? "good" : "warn" },
    { label: "Canonical Tag", value: report.canonicalDetected ? "✓ Present" : "✗ Missing", status: report.canonicalDetected ? "good" : "warn" },
    { label: "Images Missing Alt", value: report.imageWithoutAlt, status: report.imageWithoutAlt === 0 ? "good" : "bad" },
  ];

  const seoRows = [
    { label: "Page Title", value: report.title || "(none)", status: report.title ? "good" : "bad" },
    { label: "Meta Description", value: report.metaDescription ? report.metaDescription.slice(0, 90) + (report.metaDescription.length > 90 ? "…" : "") : "(none)", status: report.metaDescription ? "good" : "bad" },
  ];

  return (
    <div ref={reportRef} className="space-y-5">
      {/* Gauge + Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-5">
          <AuthorityGauge score={report.authorityScore} cached={report.cached} />
          <div className="text-center space-y-1">
            <p className="text-white/30 text-xs truncate max-w-[260px]">{report.url}</p>
            <p className="text-white/20 text-xs">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-1">Authority Breakdown</p>
          <AuditRadarChart data={report} />
        </div>
      </div>

      {/* Authority components row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Technical Health", value: report.technicalHealth, icon: "⚙️" },
          { label: "Search Visibility", value: report.searchVisibility, icon: "🔍" },
          { label: "Content Depth", value: report.contentScore, icon: "📝" },
          { label: "Brand Signals", value: report.brandSignals, icon: "🏷️" },
        ].map(({ label, value, icon }) => {
          const color = value >= 80 ? "text-emerald-400" : value >= 60 ? "text-yellow-400" : "text-red-400";
          return (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-lg mb-1">{icon}</div>
              <div className={`text-2xl font-black ${color}`}>{value}</div>
              <div className="text-white/40 text-xs mt-1">{label}</div>
            </div>
          );
        })}
      </div>

      {/* Score cards */}
      <ScoreCards data={report} />

      {/* Detail tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DetailTable title="Security Analysis" rows={secRows} />
        <DetailTable title="Domain Authority" rows={domainRows} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DetailTable title="Content Analysis" rows={contentRows} />
        <DetailTable title="SEO Tags" rows={seoRows} />
      </div>

      {/* Formula note */}
      <div className="bg-white/3 border border-white/8 rounded-2xl px-5 py-4 text-white/30 text-xs space-y-1">
        <p className="font-semibold text-white/45">Authority Formula</p>
        <p>Technical (25%) + Search Visibility (25%) + Content Depth (20%) + Backlinks (20%*) + Brand Signals (10%)</p>
        <p className="text-white/20">* Backlink data requires Ahrefs / Moz API. Currently contributing 0.</p>
      </div>

      <div className="flex justify-end">
        <PDFExport reportRef={reportRef} url={report.url} authorityScore={report.authorityScore} />
      </div>
    </div>
  );
}
