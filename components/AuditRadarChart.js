"use client";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function AuditRadarChart({ data }) {
  const chartData = [
    { subject: "Performance", value: data.performance ?? 0 },
    { subject: "SEO", value: data.seo ?? 0 },
    { subject: "Accessibility", value: data.accessibility ?? 0 },
    { subject: "Security", value: data.securityScore ?? 0 },
    { subject: "Content", value: data.contentScore ?? 0 },
    { subject: "Domain Age", value: data.domainAgeScore ?? 0 },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 500 }}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "#fff",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.7)", marginBottom: 4 }}
            itemStyle={{ color: "#818cf8" }}
            formatter={(v) => [`${v}/100`, "Score"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
