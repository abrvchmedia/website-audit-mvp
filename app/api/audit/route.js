import axios from "axios";
import * as cheerio from "cheerio";
import { connectDB } from "@/lib/mongodb";
import Audit from "@/models/Audit";

export async function POST(req) {
  const { url } = await req.json();

  try {
    await connectDB();

    // PageSpeed Insights API
    const pagespeed = await axios.get(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`,
      {
        params: {
          url,
          key: process.env.GOOGLE_API_KEY,
          strategy: "mobile"
        }
      }
    );

    const lighthouse = pagespeed.data.lighthouseResult.categories;

    // Scrape On-Page SEO
    const html = await axios.get(url);
    const $ = cheerio.load(html.data);

    const title = $("title").text();
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    const h1Count = $("h1").length;
    const imageWithoutAlt = $("img:not([alt])").length;

    const auditData = {
      url,
      performance: Math.round(lighthouse.performance.score * 100),
      accessibility: Math.round(lighthouse.accessibility.score * 100),
      seo: Math.round(lighthouse.seo.score * 100),
      bestPractices: Math.round(lighthouse["best-practices"].score * 100),
      title,
      metaDescription,
      h1Count,
      imageWithoutAlt
    };

    await Audit.create(auditData);

    return new Response(JSON.stringify(auditData), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Audit failed", details: err.message }), { status: 500 });
  }
}
