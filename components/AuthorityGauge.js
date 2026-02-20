"use client";
import { useEffect, useState } from "react";
import { scoreTheme } from "@/utils/scoring";

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
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

export default function AuthorityGauge({ score, cached }) {
  const animated = useCountUp(score);
  const theme = scoreTheme(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-52 h-52">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle
            cx="60" cy="60" r={radius}
            fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8"
          />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={theme.ring}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-6xl font-black tabular-nums ${theme.text}`}>
            {animated}
          </span>
          <span className="text-white/40 text-xs tracking-widest uppercase mt-1">
            Authority
          </span>
        </div>
      </div>

      <div className={`px-4 py-1 rounded-full text-sm font-semibold ${theme.bg} ${theme.text} border ${theme.border}`}>
        {theme.label}
      </div>

      {cached && (
        <div className="text-xs text-white/25 flex items-center gap-1">
          <span>⚡</span> Cached result (24h)
        </div>
      )}
    </div>
  );
}
