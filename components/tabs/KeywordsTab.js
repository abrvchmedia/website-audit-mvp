"use client";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function KeywordsTab({ domain }) {
  const [keywords, setKeywords] = useState("");
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noKey, setNoKey] = useState(false);

  const fetchRankings = async () => {
    const kwList = keywords
      .split(/[\n,]/)
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 20);

    if (!kwList.length) return;

    setLoading(true);
    setError(null);
    setNoKey(false);

    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        body: JSON.stringify({ domain, keywords: kwList }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (res.status === 503) {
        setNoKey(true);
      } else if (!res.ok) {
        setError(data.error || "Failed");
      } else {
        setRankData(data);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const rankColor = (rank) => {
    if (!rank) return "text-white/30";
    if (rank <= 3) return "text-emerald-400";
    if (rank <= 10) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-5">
      {/* SerpAPI notice */}
      {noKey && (
        <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-2xl p-5">
          <p className="text-yellow-400 font-semibold text-sm mb-1">SerpAPI Key Required</p>
          <p className="text-white/50 text-sm">
            Add <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">SERPAPI_KEY</code> to your{" "}
            <a href="https://vercel.com/abrvchmedias-projects/website-audit-mvp/settings/environment-variables" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Vercel environment variables</a>{" "}
            to enable keyword rank tracking. Get a free key at{" "}
            <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">serpapi.com</a>.
          </p>
        </div>
      )}

      {/* Keyword input */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
        <p className="text-white/60 text-sm font-semibold">Track Keyword Rankings for <span className="text-white">{domain}</span></p>
        <textarea
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder={"seo audit tool\nwebsite performance checker\nbest seo software"}
          rows={5}
          className="w-full bg-white/8 border border-white/15 rounded-xl p-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/60 resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-white/30 text-xs">One keyword per line or comma-separated · max 20</p>
          <button
            onClick={fetchRankings}
            disabled={loading || !keywords.trim()}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/8 disabled:text-white/25 rounded-lg text-sm font-semibold transition-all"
          >
            {loading ? "Checking…" : "Check Rankings"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Results table */}
      {rankData?.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/10">
            <h3 className="font-semibold text-white/75 text-sm">Keyword Rankings</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Keyword", "Rank", "Status", "URL"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-white/35 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankData.map((row, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3 text-white/70 font-medium">{row.keyword}</td>
                  <td className={`px-4 py-3 font-black text-lg ${rankColor(row.rank)}`}>
                    {row.rank ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {!row.rank ? (
                      <span className="text-white/30">Not in top 100</span>
                    ) : row.rank <= 3 ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Top 3 🏆</span>
                    ) : row.rank <= 10 ? (
                      <span className="text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">Page 1</span>
                    ) : row.rank <= 20 ? (
                      <span className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">Page 2</span>
                    ) : (
                      <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Page {Math.ceil(row.rank / 10)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/30 text-xs max-w-[200px] truncate">
                    {row.url ? (
                      <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                        {new URL(row.url).pathname || "/"}
                      </a>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rankData?.length === 0 && (
        <p className="text-white/30 text-sm text-center py-6">No rankings found for these keywords.</p>
      )}
    </div>
  );
}
