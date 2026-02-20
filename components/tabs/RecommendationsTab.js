"use client";
import { useState } from "react";
import {
  generateRecommendations,
  getScoreRange,
  estimateTotalGain,
  generateSalesScript,
} from "@/utils/recommendations";

// ─── Config maps ──────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  critical: {
    label: "Critical",
    bg: "bg-red-500/12",
    border: "border-red-500/30",
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-300 border border-red-500/30",
    dot: "bg-red-400",
    icon: "🚨",
  },
  high: {
    label: "High Priority",
    bg: "bg-orange-500/8",
    border: "border-orange-500/25",
    text: "text-orange-400",
    badge: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    dot: "bg-orange-400",
    icon: "🔴",
  },
  medium: {
    label: "Medium",
    bg: "bg-yellow-500/8",
    border: "border-yellow-500/20",
    text: "text-yellow-400",
    badge: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/25",
    dot: "bg-yellow-400",
    icon: "🟡",
  },
  low: {
    label: "Low",
    bg: "bg-white/5",
    border: "border-white/10",
    text: "text-white/50",
    badge: "bg-white/10 text-white/40 border border-white/15",
    dot: "bg-white/30",
    icon: "⚪",
  },
};

const EFFORT_CONFIG = {
  quick: { label: "Quick Win", color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/25", icon: "⚡" },
  medium: { label: "Medium Effort", color: "text-yellow-400", bg: "bg-yellow-500/10 border border-yellow-500/20", icon: "🔧" },
  "long-term": { label: "Long-term", color: "text-blue-400", bg: "bg-blue-500/10 border border-blue-500/20", icon: "📅" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRangeBanner({ score, range, totalGain }) {
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className={`${range.bg} ${range.border} border rounded-2xl p-6`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Score ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="36" fill="none"
              stroke={range.ring} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black ${range.textColor}`}>{score}</span>
            <span className="text-white/30 text-xs">/100</span>
          </div>
        </div>

        {/* Text */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{range.emoji}</span>
            <h2 className={`text-xl font-black ${range.textColor}`}>{range.label}</h2>
          </div>
          <p className="text-white/55 text-sm leading-relaxed mb-3">{range.tagline}</p>
          {totalGain.count > 0 && (
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-3 py-1.5 text-xs">
              <span className="text-emerald-400 font-bold">+{totalGain.min}–{totalGain.max} pts</span>
              <span className="text-white/40">potential gain from {totalGain.count} critical + high fixes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickWinsRow({ recs }) {
  const quickWins = recs.filter((r) => r.effort === "quick" && ["critical", "high"].includes(r.priority));
  if (!quickWins.length) return null;

  return (
    <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⚡</span>
        <h3 className="font-bold text-emerald-400 text-sm">Quick Wins — Implement This Week</h3>
        <span className="ml-auto text-xs text-emerald-400/60">{quickWins.length} items</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickWins.map((r, i) => (
          <div key={i} className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-xl p-3">
            <span className="text-emerald-400 mt-0.5 text-base">✓</span>
            <div>
              <p className="text-white/75 text-xs font-semibold">{r.area}</p>
              <p className="text-white/40 text-xs mt-0.5">{r.service}</p>
            </div>
            <span className={`ml-auto text-xs font-bold ${r.priority === "critical" ? "text-red-400" : "text-orange-400"} whitespace-nowrap`}>
              {r.scoreEffect}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ rec, index }) {
  const [open, setOpen] = useState(false);
  const pc = PRIORITY_CONFIG[rec.priority];
  const ec = EFFORT_CONFIG[rec.effort];

  return (
    <div className={`${pc.bg} ${pc.border} border rounded-2xl overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-white/5 transition-colors"
      >
        {/* Number */}
        <span className="text-white/20 text-xs font-mono w-5 flex-shrink-0 mt-0.5">{String(index + 1).padStart(2, "0")}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${pc.badge}`}>
              {pc.icon} {pc.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${ec.bg} ${ec.color} font-medium`}>
              {ec.icon} {ec.label}
            </span>
            <span className="ml-auto text-xs font-bold text-emerald-400 whitespace-nowrap">{rec.scoreEffect}</span>
          </div>
          <p className={`font-semibold text-sm ${pc.text}`}>{rec.area}</p>
          <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{rec.issue}</p>
        </div>

        <span className="text-white/20 text-xs ml-2 flex-shrink-0 mt-1">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 pl-14 space-y-4 border-t border-white/8 pt-4">
          {/* Why it matters */}
          <div>
            <p className="text-white/35 text-xs font-semibold uppercase tracking-wide mb-1">Why it matters</p>
            <p className="text-white/65 text-sm leading-relaxed">{rec.impact}</p>
          </div>

          {/* Service to sell */}
          <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
            <span className="text-indigo-400 text-lg flex-shrink-0">💼</span>
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-0.5">Recommended Service</p>
              <p className="text-indigo-300 font-semibold text-sm">{rec.service}</p>
            </div>
            <div className="ml-auto text-right flex-shrink-0">
              <p className="text-white/30 text-xs">Est. impact</p>
              <p className="text-emerald-400 font-bold text-sm">{rec.scoreEffect}</p>
            </div>
          </div>

          {/* Tab reference */}
          <p className="text-white/25 text-xs">
            📍 See data in the <span className="text-white/45 font-medium">{rec.tab}</span> tab
          </p>
        </div>
      )}
    </div>
  );
}

function SalesScript({ report, recs }) {
  const [copied, setCopied] = useState(false);
  const script = generateSalesScript(report, recs);

  const copy = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>🎯</span>
          <h3 className="font-semibold text-white/75 text-sm">Auto-Generated Sales Script</h3>
        </div>
        <button
          onClick={copy}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
        >
          {copied ? "✓ Copied!" : "Copy to clipboard"}
        </button>
      </div>
      <pre className="px-5 py-4 text-white/55 text-sm leading-relaxed whitespace-pre-wrap font-sans">
        {script}
      </pre>
    </div>
  );
}

function ServicesSummaryTable({ recs }) {
  const byPriority = ["critical", "high", "medium"].map((p) => ({
    priority: p,
    items: recs.filter((r) => r.priority === p),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/10 flex items-center gap-2">
        <span>📋</span>
        <h3 className="font-semibold text-white/75 text-sm">Services Proposal Summary</h3>
      </div>
      <div className="divide-y divide-white/5">
        {byPriority.map(({ priority, items }) => {
          const pc = PRIORITY_CONFIG[priority];
          return (
            <div key={priority} className="px-5 py-4">
              <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${pc.text}`}>
                {pc.icon} {pc.label} — {items.length} issue{items.length > 1 ? "s" : ""}
              </p>
              <div className="space-y-2">
                {items.map((r, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pc.dot}`} />
                      <span className="text-white/65 truncate">{r.service}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs ${EFFORT_CONFIG[r.effort].color}`}>{EFFORT_CONFIG[r.effort].icon} {EFFORT_CONFIG[r.effort].label}</span>
                      <span className="text-emerald-400 text-xs font-bold w-20 text-right">{r.scoreEffect}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between bg-white/3">
        <span className="text-white/35 text-xs">Total estimated Authority Score improvement</span>
        <span className="text-emerald-400 font-black text-sm">
          +{estimateTotalGain(recs, ["critical", "high", "medium"]).min}–{estimateTotalGain(recs, ["critical", "high", "medium"]).max} pts
        </span>
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function RecommendationsTab({ report }) {
  const [filter, setFilter] = useState("all");

  const recs = generateRecommendations(report);
  const range = getScoreRange(report.authorityScore);
  const totalGain = estimateTotalGain(recs);

  const counts = {
    all: recs.length,
    critical: recs.filter((r) => r.priority === "critical").length,
    high: recs.filter((r) => r.priority === "high").length,
    medium: recs.filter((r) => r.priority === "medium").length,
    quick: recs.filter((r) => r.effort === "quick").length,
  };

  const filtered = filter === "all" ? recs
    : filter === "quick" ? recs.filter((r) => r.effort === "quick")
    : recs.filter((r) => r.priority === filter);

  return (
    <div className="space-y-5">
      {/* Score range banner */}
      <ScoreRangeBanner score={report.authorityScore} range={range} totalGain={totalGain} />

      {/* Quick wins row */}
      <QuickWinsRow recs={recs} />

      {/* Filter bar + recommendation list */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-white/35 text-xs uppercase tracking-wide font-semibold">Filter:</span>
          {[
            { id: "all", label: "All" },
            { id: "critical", label: "🚨 Critical" },
            { id: "high", label: "🔴 High" },
            { id: "medium", label: "🟡 Medium" },
            { id: "quick", label: "⚡ Quick Wins" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white/8 text-white/40 hover:text-white/65"
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-white/35">{counts[f.id]}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} index={recs.indexOf(rec)} />
          ))}
          {filtered.length === 0 && (
            <p className="text-white/25 text-sm text-center py-8">No issues in this category — great work!</p>
          )}
        </div>
      </div>

      {/* Services proposal table */}
      <ServicesSummaryTable recs={recs} />

      {/* Sales script */}
      <SalesScript report={report} recs={recs} />
    </div>
  );
}
