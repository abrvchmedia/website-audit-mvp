"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { scoreTheme } from "@/utils/scoring";

export default function HistoryTab({ domain }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/history?domain=${encodeURIComponent(domain)}`)
      .then((r) => r.json())
      .then((d) => {
        setHistory(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [domain]);

  if (loading)
    return <div className="text-white/30 text-sm py-12 text-center">Loading history…</div>;
  if (!history.length)
    return (
      <div className="text-white/30 text-sm py-12 text-center">
        No history yet for <strong className="text-white/50">{domain}</strong>.<br />
        Each audit is automatically saved. Check back after running more audits.
      </div>
    );

  const trendData = [...history]
    .reverse()
    .map((a) => ({
      date: new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Authority: a.authorityScore,
      SEO: a.seo,
      Performance: a.performance,
    }));

  // Detect score drops > 5 points
  const alerts = [];
  for (let i = 1; i < history.length; i++) {
    const drop = history[i].authorityScore - history[i - 1].authorityScore;
    if (drop >= 5) {
      alerts.push({
        date: new Date(history[i - 1].createdAt).toLocaleDateString(),
        from: history[i].authorityScore,
        to: history[i - 1].authorityScore,
        drop,
      });
    }
  }

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-red-400 text-lg">⚠</span>
              <p className="text-red-300 text-sm">
                Authority Score dropped <strong>{a.drop} points</strong> ({a.from} → {a.to}) on {a.date}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Trend chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-5">Score Trends</p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}
                labelStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
                itemStyle={{ fontSize: 12 }}
                formatter={(v, name) => [`${v}`, name]}
              />
              <Line type="monotone" dataKey="Authority" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="SEO" stroke="#34d399" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="Performance" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-white/35">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-500 inline-block" />Authority</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-400 inline-block" />SEO</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-400 inline-block" />Performance</span>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/10">
          <h3 className="font-semibold text-white/70 text-sm">Audit History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Date", "Authority", "Technical", "Search Vis.", "Content", "SEO", "Perf"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-white/35 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((a, i) => {
                const prev = history[i + 1];
                const delta = prev ? a.authorityScore - prev.authorityScore : null;
                const theme = scoreTheme(a.authorityScore);
                return (
                  <tr key={a._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="px-4 py-3 text-white/40 text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className={`px-4 py-3 font-black ${theme.text}`}>
                      {a.authorityScore}
                      {delta !== null && (
                        <span className={`text-xs font-normal ml-1 ${delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-white/30"}`}>
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/50">{a.technicalHealth ?? "—"}</td>
                    <td className="px-4 py-3 text-white/50">{a.searchVisibility ?? "—"}</td>
                    <td className="px-4 py-3 text-white/50">{a.contentScore ?? "—"}</td>
                    <td className="px-4 py-3 text-white/50">{a.seo}</td>
                    <td className="px-4 py-3 text-white/50">{a.performance}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
