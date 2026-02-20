import axios from "axios";

const CATEGORIES = ["performance", "accessibility", "seo", "best-practices"];

export async function fetchPageSpeed(url) {
  const params = [
    `url=${encodeURIComponent(url)}`,
    `key=${process.env.GOOGLE_API_KEY}`,
    `strategy=mobile`,
    ...CATEGORIES.map((c) => `category=${c}`),
  ].join("&");

  const res = await axios.get(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
    { timeout: 45000 }
  );

  const cats = res.data.lighthouseResult.categories;
  return {
    performance: Math.round((cats.performance?.score ?? 0) * 100),
    accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
    seo: Math.round((cats.seo?.score ?? 0) * 100),
    bestPractices: Math.round((cats["best-practices"]?.score ?? 0) * 100),
  };
}
