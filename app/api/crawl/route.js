import { crawlSite } from "@/services/crawler/pageCrawler";
import { connectDB } from "@/lib/mongodb";
import CrawlResult from "@/models/CrawlResult";
import { rateLimit } from "@/lib/rateLimit";

export const maxDuration = 60;

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = rateLimit(ip);
  if (!allowed) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { url } = await req.json();
  if (!url) return Response.json({ error: "URL required" }, { status: 400 });

  try {
    const { hostname: domain } = new URL(url);
    const result = await crawlSite(url);

    try {
      await connectDB();
      await CrawlResult.create({ url, domain, ...result });
    } catch (dbErr) {
      console.warn("DB save skipped:", dbErr.message);
    }

    return Response.json(result, { status: 200 });
  } catch (err) {
    console.error("Crawl error:", err.message);
    return Response.json({ error: "Crawl failed", details: err.message }, { status: 500 });
  }
}
