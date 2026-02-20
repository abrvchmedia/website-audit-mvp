import axios from "axios";
import { connectDB } from "@/lib/mongodb";
import KeywordRank from "@/models/KeywordRank";

export async function fetchKeywordRankings(domain, keywords = []) {
  if (!process.env.SERPAPI_KEY) return null;
  if (!keywords.length) return [];

  const results = await Promise.allSettled(
    keywords.slice(0, 20).map((kw) => fetchOneKeyword(domain, kw))
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
}

async function fetchOneKeyword(domain, keyword) {
  const res = await axios.get("https://serpapi.com/search", {
    params: {
      q: keyword,
      api_key: process.env.SERPAPI_KEY,
      engine: "google",
      num: 100,
      gl: "us",
      hl: "en",
    },
    timeout: 15000,
  });

  const organic = res.data.organic_results || [];
  let rank = null;
  let rankUrl = null;

  for (let i = 0; i < organic.length; i++) {
    const link = organic[i].link || "";
    if (link.includes(domain)) {
      rank = i + 1;
      rankUrl = link;
      break;
    }
  }

  return { keyword, rank, url: rankUrl, checkedAt: new Date() };
}

export async function getKeywordHistory(domain) {
  try {
    await connectDB();
    // Get latest rank per keyword
    const latest = await KeywordRank.aggregate([
      { $match: { domain } },
      { $sort: { checkedAt: -1 } },
      { $group: { _id: "$keyword", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
      { $sort: { rank: 1 } },
    ]);
    return latest;
  } catch {
    return [];
  }
}

export async function getKeywordTrend(domain, keyword) {
  try {
    await connectDB();
    return await KeywordRank.find({ domain, keyword })
      .sort({ checkedAt: -1 })
      .limit(30)
      .select("rank checkedAt");
  } catch {
    return [];
  }
}
