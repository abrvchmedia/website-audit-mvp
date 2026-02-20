"use client";

function StatusBadge({ ok, yes = "✓", no = "✗" }) {
  return ok ? (
    <span className="text-emerald-400 font-semibold">{yes}</span>
  ) : (
    <span className="text-red-400 font-semibold">{no}</span>
  );
}

function TTFBBar({ ms }) {
  const pct = Math.min(100, (ms / 2000) * 100);
  const color = ms < 300 ? "bg-emerald-400" : ms < 800 ? "bg-yellow-400" : "bg-red-400";
  const label = ms < 300 ? "Fast" : ms < 800 ? "Moderate" : "Slow";
  const textColor = ms < 300 ? "text-emerald-400" : ms < 800 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className={`font-bold ${textColor}`}>{ms} ms</span>
        <span className={`text-xs ${textColor}`}>{label}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function TechnicalTab({ report }) {
  if (!report.hasSitemap && report.hasSitemap === undefined) {
    return (
      <div className="text-white/30 text-sm py-12 text-center">
        Technical data not available for this audit. Re-run the audit to include technical checks.
      </div>
    );
  }

  const redirectChain = report.redirectChain || [];

  return (
    <div className="space-y-5">
      {/* TTFB */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-4">Time to First Byte (TTFB)</p>
        {report.ttfb !== null && report.ttfb !== undefined ? (
          <TTFBBar ms={report.ttfb} />
        ) : (
          <p className="text-white/30 text-sm">TTFB unavailable</p>
        )}
        <p className="text-white/25 text-xs mt-2">Target: &lt;200ms excellent · &lt;800ms acceptable · &gt;800ms needs improvement</p>
      </div>

      {/* Sitemap & Robots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Sitemap</p>
          <div className="flex items-center gap-3">
            <StatusBadge ok={report.hasSitemap} yes="Found" no="Missing" />
            {report.sitemapUrl && (
              <a href={report.sitemapUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-xs hover:underline truncate">
                {report.sitemapUrl}
              </a>
            )}
          </div>
          {!report.hasSitemap && (
            <p className="text-white/30 text-xs">Add a sitemap.xml to help search engines discover your pages.</p>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Robots.txt</p>
          <div className="flex items-center gap-2">
            <StatusBadge ok={report.hasRobots} yes="Found" no="Missing" />
            {report.robotsDisallowAll && (
              <span className="text-red-400 text-xs bg-red-500/10 px-2 py-0.5 rounded-full">⚠ Disallow: /</span>
            )}
          </div>
          {report.robotsPreview && (
            <pre className="text-white/30 text-xs bg-white/5 rounded-lg p-3 overflow-x-auto leading-relaxed">
              {report.robotsPreview}
            </pre>
          )}
        </div>
      </div>

      {/* Redirect chain */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-3">Redirect Chain</p>
        {redirectChain.length <= 1 ? (
          <p className="text-emerald-400 text-sm font-semibold">✓ No redirect chain detected</p>
        ) : (
          <div className="space-y-2">
            <p className={`text-sm font-semibold ${report.redirectCount > 2 ? "text-red-400" : "text-yellow-400"}`}>
              {report.redirectCount} redirect{report.redirectCount > 1 ? "s" : ""} detected
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {redirectChain.map((hop, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="bg-white/8 border border-white/10 rounded px-2 py-1">
                    <span className={`font-semibold ${hop.status >= 300 && hop.status < 400 ? "text-yellow-400" : "text-emerald-400"}`}>
                      {hop.status}
                    </span>
                    <span className="text-white/40 ml-1.5 max-w-[180px] truncate inline-block align-bottom">{hop.url}</span>
                  </div>
                  {i < redirectChain.length - 1 && <span className="text-white/30">→</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Technical score breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-4">Technical Health Score: <span className="text-white">{report.technicalHealth}</span></p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Performance", value: report.performance },
            { label: "Accessibility", value: report.accessibility },
            { label: "Best Practices", value: report.bestPractices },
            { label: "Security", value: report.securityScore },
          ].map(({ label, value }) => {
            const color = value >= 80 ? "text-emerald-400" : value >= 60 ? "text-yellow-400" : "text-red-400";
            return (
              <div key={label} className="text-center">
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-white/35 text-xs mt-0.5">{label}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex gap-3 text-xs text-white/30">
          <span>Sitemap: {report.hasSitemap ? <span className="text-emerald-400">+4pts</span> : "not found"}</span>
          <span>Robots.txt: {report.hasRobots ? <span className="text-emerald-400">+2pts</span> : "not found"}</span>
          {report.ttfb !== null && <span>TTFB: {report.ttfb < 200 ? <span className="text-emerald-400">+4pts</span> : report.ttfb > 800 ? <span className="text-red-400">-8pts</span> : "ok"}</span>}
        </div>
      </div>
    </div>
  );
}
