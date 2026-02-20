"use client";
import { useEffect, useState } from "react";
import { scoreTheme } from "@/utils/scoring";

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const ICONS = {
  Performance: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  SEO: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Accessibility: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  "Best Practices": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Security: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Content: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

function ScoreCard({ label, value }) {
  const animated = useCountUp(value);
  const theme = scoreTheme(value);

  return (
    <div className={`${theme.bg} ${theme.border} border rounded-2xl p-5 flex flex-col gap-3`}>
      <div className={`flex items-center gap-2 text-sm font-medium ${theme.text} opacity-80`}>
        {ICONS[label]}
        <span>{label}</span>
      </div>
      <div className={`text-4xl font-black tabular-nums ${theme.text}`}>{animated}</div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${theme.bar}`}
          style={{ width: `${value}%`, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </div>
    </div>
  );
}

export default function ScoreCards({ data }) {
  const cards = [
    { label: "Performance", value: data.performance },
    { label: "SEO", value: data.seo },
    { label: "Accessibility", value: data.accessibility },
    { label: "Best Practices", value: data.bestPractices },
    { label: "Security", value: data.securityScore },
    { label: "Content", value: data.contentScore },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <ScoreCard key={c.label} {...c} />
      ))}
    </div>
  );
}
