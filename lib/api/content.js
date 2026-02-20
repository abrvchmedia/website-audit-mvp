import axios from "axios";
import * as cheerio from "cheerio";
import { getContentScore } from "@/utils/scoring";

export async function fetchContentData(url) {
  const res = await axios.get(url, {
    timeout: 15000,
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AuditBot/1.0)" },
    maxRedirects: 5,
  });

  const $ = cheerio.load(res.data);

  // Strip non-content elements before word count
  $("script, style, nav, footer, header, noscript").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText
    .split(" ")
    .filter((w) => w.length > 2).length;

  const title = $("title").text().trim();
  const metaDescription =
    $('meta[name="description"]').attr("content") || "";
  const h1Count = $("h1").length;
  const imageWithoutAlt = $("img:not([alt])").length;

  // Heading depth — deepest heading level used
  const headingDepth = ["h1", "h2", "h3", "h4", "h5", "h6"].reduce(
    (depth, tag, i) => ($(tag).length > 0 ? i + 1 : depth),
    0
  );

  const schemaDetected =
    $('script[type="application/ld+json"]').length > 0;
  const ogTagsDetected = $('meta[property^="og:"]').length > 0;
  const canonicalDetected = $('link[rel="canonical"]').length > 0;

  const contentScore = getContentScore({
    wordCount,
    h1Count,
    schemaDetected,
    ogTagsDetected,
    canonicalDetected,
    headingDepth,
  });

  return {
    title,
    metaDescription,
    h1Count,
    imageWithoutAlt,
    wordCount,
    headingDepth,
    schemaDetected,
    ogTagsDetected,
    canonicalDetected,
    contentScore,
  };
}
