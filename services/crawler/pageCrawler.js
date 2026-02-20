import axios from "axios";
import * as cheerio from "cheerio";

const HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; AuditBot/1.0)" };
const BATCH_SIZE = 5;
const MAX_PAGES = 25;
const PAGE_TIMEOUT = 12000;
const SKIP_EXT = /\.(pdf|jpg|jpeg|png|gif|svg|webp|avif|zip|css|js|woff|ico|xml|json)$/i;

export async function crawlSite(url) {
  const base = new URL(url);

  // Parse homepage for internal links
  let homeHtml = "";
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      headers: HEADERS,
      maxRedirects: 5,
    });
    homeHtml = res.data;
  } catch (err) {
    throw new Error(`Cannot fetch homepage: ${err.message}`);
  }

  const $ = cheerio.load(homeHtml);
  const seen = new Set([url]);

  $("a[href]").each((_, el) => {
    try {
      const href = $(el).attr("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const abs = new URL(href, base.origin).href.split("#")[0].split("?")[0];
      if (
        abs.startsWith(base.origin) &&
        !SKIP_EXT.test(abs) &&
        abs.length < 200
      ) {
        seen.add(abs);
      }
    } catch {}
  });

  const pages = Array.from(seen).slice(0, MAX_PAGES);
  const results = [];

  // Crawl in batches to stay within timeout
  for (let i = 0; i < pages.length; i += BATCH_SIZE) {
    const batch = pages.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(batch.map(analyzePage));
    for (const r of batchResults) {
      if (r.status === "fulfilled") results.push(r.value);
    }
  }

  // Detect duplicate titles
  const titleMap = {};
  for (const p of results) {
    if (!p.title) continue;
    if (!titleMap[p.title]) titleMap[p.title] = [];
    titleMap[p.title].push(p.url);
  }
  const duplicateTitles = Object.entries(titleMap)
    .filter(([, pages]) => pages.length > 1)
    .map(([title, pages]) => ({ title, pages }));

  // Inject duplicate title issues
  for (const dup of duplicateTitles) {
    for (const p of results) {
      if (dup.pages.includes(p.url)) {
        p.issues.push({
          type: "duplicate_title",
          severity: "critical",
          message: `Duplicate title: "${p.title.slice(0, 50)}"`,
        });
      }
    }
  }

  const issues = summarizeIssues(results);
  const overallHealthScore = computeOverallHealth(results);

  return { pagesChecked: results.length, pages: results, issues, duplicateTitles, overallHealthScore };
}

async function analyzePage(url) {
  const start = Date.now();
  try {
    const res = await axios.get(url, {
      timeout: PAGE_TIMEOUT,
      headers: HEADERS,
      maxRedirects: 3,
      validateStatus: () => true,
    });
    const loadTime = Date.now() - start;

    if (res.status >= 400) {
      return {
        url,
        status: res.status,
        loadTime,
        healthScore: 0,
        issues: [
          { type: "broken_page", severity: "critical", message: `HTTP ${res.status}` },
        ],
      };
    }

    const $ = cheerio.load(res.data);
    $("script, style, nav, footer").remove();

    const title = $("title").text().trim();
    const metaDesc = $('meta[name="description"]').attr("content") || "";
    const h1s = $("h1").map((_, el) => $(el).text().trim()).get();
    const wordCount = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((w) => w.length > 2).length;
    const canonical = $('link[rel="canonical"]').attr("href") || null;
    const imgTotal = $("img").length;
    const imgNoAlt = $("img:not([alt])").length;
    const imgNoSize = $("img:not([width]):not([height])").length;
    const modernFmts = $('img[src*=".webp"], img[src*=".avif"]').length;

    const issues = [];
    if (!title) issues.push({ type: "missing_title", severity: "critical", message: "Missing page title" });
    if (!metaDesc) issues.push({ type: "missing_meta", severity: "warning", message: "Missing meta description" });
    if (h1s.length === 0) issues.push({ type: "missing_h1", severity: "critical", message: "Missing H1 tag" });
    if (h1s.length > 1) issues.push({ type: "multiple_h1", severity: "warning", message: `Multiple H1 tags (${h1s.length})` });
    if (wordCount < 300) issues.push({ type: "thin_content", severity: "warning", message: `Thin content (${wordCount} words)` });
    if (!canonical) issues.push({ type: "missing_canonical", severity: "info", message: "Missing canonical tag" });
    if (imgNoAlt > 0) issues.push({ type: "img_no_alt", severity: "warning", message: `${imgNoAlt} image${imgNoAlt > 1 ? "s" : ""} missing alt text` });
    if (imgTotal > 0 && modernFmts === 0) issues.push({ type: "img_format", severity: "info", message: "No WebP/AVIF images detected" });
    if (imgNoSize > 2) issues.push({ type: "img_no_size", severity: "info", message: `${imgNoSize} images missing width/height (layout shift risk)` });

    const criticals = issues.filter((i) => i.severity === "critical").length;
    const warnings = issues.filter((i) => i.severity === "warning").length;
    const infos = issues.filter((i) => i.severity === "info").length;
    const healthScore = Math.max(0, 100 - criticals * 25 - warnings * 10 - infos * 3);

    return { url, status: res.status, loadTime, title, metaDesc, h1Count: h1s.length, wordCount, canonical, healthScore, issues };
  } catch (err) {
    return {
      url,
      status: 0,
      loadTime: Date.now() - start,
      healthScore: 0,
      issues: [{ type: "fetch_error", severity: "critical", message: err.message }],
    };
  }
}

function summarizeIssues(pages) {
  const grouped = {};
  for (const page of pages) {
    for (const issue of page.issues) {
      if (!grouped[issue.type]) {
        grouped[issue.type] = { type: issue.type, severity: issue.severity, message: issue.message, count: 0, pages: [] };
      }
      grouped[issue.type].count++;
      grouped[issue.type].pages.push(page.url);
    }
  }
  const order = { critical: 0, warning: 1, info: 2 };
  return Object.values(grouped).sort(
    (a, b) => order[a.severity] - order[b.severity] || b.count - a.count
  );
}

function computeOverallHealth(pages) {
  if (!pages.length) return 0;
  return Math.round(pages.reduce((sum, p) => sum + (p.healthScore || 0), 0) / pages.length);
}
