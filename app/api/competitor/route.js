import { runCompetitorAudit } from "@/services/competitorService";

export const maxDuration = 60;

export async function POST(req) {
  const { competitors } = await req.json();
  if (!competitors?.length) {
    return Response.json({ error: "competitors array required" }, { status: 400 });
  }

  const results = await Promise.allSettled(
    competitors.slice(0, 3).map((url) => runCompetitorAudit(url))
  );

  const data = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { url: competitors[i], domain: competitors[i], error: r.reason?.message, authorityScore: 0 }
  );

  return Response.json(data, { status: 200 });
}
