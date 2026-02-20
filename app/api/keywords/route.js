import { fetchKeywordRankings, getKeywordHistory } from "@/services/ranking/keywordService";
import { connectDB } from "@/lib/mongodb";
import KeywordRank from "@/models/KeywordRank";

export const maxDuration = 30;

export async function POST(req) {
  const { domain, keywords } = await req.json();
  if (!domain) return Response.json({ error: "domain required" }, { status: 400 });

  if (!process.env.SERPAPI_KEY) {
    return Response.json(
      { error: "SERPAPI_KEY not configured", hint: "Add SERPAPI_KEY to your Vercel environment variables to enable keyword tracking." },
      { status: 503 }
    );
  }

  try {
    const rankings = await fetchKeywordRankings(domain, keywords || []);

    if (rankings?.length) {
      try {
        await connectDB();
        await KeywordRank.insertMany(rankings.map((r) => ({ ...r, domain })));
      } catch (dbErr) {
        console.warn("DB save skipped:", dbErr.message);
      }
    }

    return Response.json(rankings, { status: 200 });
  } catch (err) {
    return Response.json({ error: "Keyword fetch failed", details: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  if (!domain) return Response.json({ error: "domain required" }, { status: 400 });

  const history = await getKeywordHistory(domain);
  return Response.json(history, { status: 200 });
}
