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
} from "recharts";
import { scoreTheme } from "@/utils/scoring";

export default function AuditHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-white/30 text-sm py-8 text-center">
        Loading history...
      </div>
    );
  if (!history.length)
    return (
      <div className="text-white/30 text-sm py-8 text-center">
        No audit history yet. Run your first audit above.
      </div>
    );

  const trendData = [...history]
    .reverse()
    .slice(-20)
    .map((a) => ({
      date: new Date(a.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      score: a.authorityScore,
      domain: a.domain,
    }));

  return (
    <div className="space-y-6">
      {/* Trend line */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="font-semibold text-white/70 text-sm mb-5">
          Authority Score Trend
        </h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                }}
                labelStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
                itemStyle={{ color: "#818cf8" }}
                formatter={(v) => [`${v}`, "Authority Score"]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#818cf8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/10">
          <h3 className="font-semibold text-white/70 text-sm">Recent Audits</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Domain", "Authority", "SEO", "Performance", "Security", "Content", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-white/35 font-medium text-xs uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {history.map((a) => {
                const theme = scoreTheme(a.authorityScore);
                return (
                  <tr
                    key={a._id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-white/70 font-medium">
                      {a.domain}
                    </td>
                    <td className={`px-4 py-3 font-bold ${theme.text}`}>
                      {a.authorityScore}
                    </td>
                    <td className="px-4 py-3 text-white/55">{a.seo}</td>
                    <td className="px-4 py-3 text-white/55">{a.performance}</td>
                    <td className="px-4 py-3 text-white/55">{a.securityScore}</td>
                    <td className="px-4 py-3 text-white/55">{a.contentScore}</td>
                    <td className="px-4 py-3 text-white/35 text-xs">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
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
