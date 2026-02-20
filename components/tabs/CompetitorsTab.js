"use client";
import { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { scoreTheme } from "@/utils/scoring";

const COLORS = ["#6366f1", "#34d399", "#f472b6"];
const LABELS = ["Your Site", "Competitor 1", "Competitor 2"];

export default function CompetitorsTab({ mainReport }) {
  const [competitors, setCompetitors] = useState(["", ""]);
  const [compData, setCompData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (i, val) => {
    const next = [...competitors];
    next[i] = val;
    setCompetitors(next);
  };

  const runComparison = async () => {
    const valid = competitors.filter((c) => c.trim());
    if (!valid.length) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/competitor", {
        method: "POST",
        body: JSON.stringify({ competitors: valid }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) setError("Comparison failed");
      else setCompData(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const allSites = compData ? [mainReport, ...compData] : null;

  const radarData = allSites
    ? [
        { subject: "Performance", ...Object.fromEntries(allSites.map((s, i) => [LABELS[i], s.performance ?? 0])) },
        { subject: "SEO", ...Object.fromEntries(allSites.map((s, i) => [LABELS[i], s.seo ?? 0])) },
        { subject: "Accessibility", ...Object.fromEntries(allSites.map((s, i) => [LABELS[i], s.accessibility ?? 0])) },
        { subject: "Security", ...Object.fromEntries(allSites.map((s, i) => [LABELS[i], s.securityScore ?? 0])) },
        { subject: "Content", ...Object.fromEntries(allSites.map((s, i) => [LABELS[i], s.contentScore ?? 0])) },
        { subject: "Domain Age", ...Object.fromEntries(allSites.map((s, i) => [LABELS[i], s.domainAgeScore ?? 0])) },
      ]
    : null;

  return (
    <div className="space-y-5">
      {/* Input form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <p className="text-white/60 text-sm font-semibold">Compare Against Competitors</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {competitors.map((c, i) => (
            <input
              key={i}
              value={c}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder={`https://competitor${i + 1}.com`}
              className="bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-white/25 text-xs">Runs a full authority audit on each competitor — takes ~30s</p>
          <button
            onClick={runComparison}
            disabled={loading || !competitors.some((c) => c.trim())}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/8 disabled:text-white/25 rounded-xl text-sm font-semibold transition-all"
          >
            {loading ? "Comparing…" : "Compare"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {loading && (
        <div className="text-center py-16 space-y-3">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-white/45 text-sm">Running competitor audits in parallel…</p>
        </div>
      )}

      {allSites && (
        <>
          {/* Comparison radar */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-4">Radar Comparison</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  {allSites.map((s, i) => (
                    <Radar
                      key={i}
                      name={i === 0 ? `${s.domain} (you)` : s.domain}
                      dataKey={LABELS[i]}
                      stroke={COLORS[i]}
                      fill={COLORS[i]}
                      fillOpacity={0.12}
                      strokeWidth={2}
                    />
                  ))}
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}
                    labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                    formatter={(v) => [`${v}/100`]}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: 12 }}
                    formatter={(val) => <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{val}</span>}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10">
              <h3 className="font-semibold text-white/75 text-sm">Side-by-Side Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-2.5 text-left text-white/35 font-medium text-xs w-36">Metric</th>
                    {allSites.map((s, i) => (
                      <th key={i} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: COLORS[i] }}>
                        {s.domain}{i === 0 ? " (you)" : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Authority Score", key: "authorityScore" },
                    { label: "Performance", key: "performance" },
                    { label: "SEO", key: "seo" },
                    { label: "Accessibility", key: "accessibility" },
                    { label: "Security", key: "securityScore" },
                    { label: "Content Score", key: "contentScore" },
                    { label: "Domain Age", key: "domainAgeScore" },
                    { label: "Security Grade", key: "securityGrade", isText: true },
                  ].map(({ label, key, isText }) => {
                    const values = allSites.map((s) => s[key] ?? 0);
                    const maxVal = isText ? null : Math.max(...values.filter((v) => typeof v === "number"));
                    return (
                      <tr key={key} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3 text-white/45 text-xs">{label}</td>
                        {allSites.map((s, i) => {
                          const val = s[key];
                          const isMax = !isText && val === maxVal;
                          const theme = isText ? null : scoreTheme(typeof val === "number" ? val : 0);
                          return (
                            <td key={i} className={`px-4 py-3 font-bold ${isText ? "text-white/70" : theme.text} ${isMax ? "underline decoration-dotted" : ""}`}>
                              {val ?? "—"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
