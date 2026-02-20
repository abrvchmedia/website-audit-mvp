import axios from "axios";

const HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; AuditBot/1.0)" };

export async function runTechnicalAudit(url) {
  const base = new URL(url);

  const [sitemapRes, robotsRes, ttfbRes, redirectRes] = await Promise.allSettled([
    checkSitemap(base),
    checkRobots(base),
    measureTTFB(url),
    detectRedirectChain(url),
  ]);

  return {
    sitemap: sitemapRes.status === "fulfilled" ? sitemapRes.value : { found: false },
    robots: robotsRes.status === "fulfilled" ? robotsRes.value : { found: false },
    ttfb: ttfbRes.status === "fulfilled" ? ttfbRes.value : null,
    redirects: redirectRes.status === "fulfilled" ? redirectRes.value : { count: 0, chain: [] },
  };
}

async function checkSitemap(base) {
  const candidates = [
    `${base.origin}/sitemap.xml`,
    `${base.origin}/sitemap_index.xml`,
    `${base.origin}/sitemap/`,
  ];
  for (const u of candidates) {
    try {
      const res = await axios.head(u, {
        timeout: 6000,
        headers: HEADERS,
        validateStatus: (s) => s < 500,
      });
      if (res.status === 200) return { found: true, url: u };
    } catch {}
  }
  return { found: false };
}

async function checkRobots(base) {
  try {
    const res = await axios.get(`${base.origin}/robots.txt`, {
      timeout: 6000,
      headers: HEADERS,
      validateStatus: () => true,
    });
    if (res.status !== 200) return { found: false };

    const text = res.data;
    const disallowAll = /Disallow:\s*\/\s*$/.test(text);
    const sitemapMatch = text.match(/Sitemap:\s*(.+)/i);

    return {
      found: true,
      disallowAll,
      sitemapUrl: sitemapMatch ? sitemapMatch[1].trim() : null,
      preview: text.slice(0, 400),
    };
  } catch {
    return { found: false };
  }
}

async function measureTTFB(url) {
  const start = Date.now();
  await axios.get(url, {
    timeout: 15000,
    headers: HEADERS,
    maxRedirects: 5,
    validateStatus: () => true,
    responseType: "stream",
  }).then((res) => {
    res.data.destroy(); // Don't wait for full body
  });
  return Date.now() - start;
}

async function detectRedirectChain(url) {
  const chain = [];
  let current = url;

  for (let i = 0; i < 8; i++) {
    try {
      const res = await axios.get(current, {
        timeout: 5000,
        maxRedirects: 0,
        validateStatus: () => true,
        headers: HEADERS,
      });
      chain.push({ url: current, status: res.status });
      if (res.status >= 300 && res.status < 400 && res.headers.location) {
        current = new URL(res.headers.location, current).href;
      } else {
        break;
      }
    } catch {
      break;
    }
  }

  return { count: Math.max(0, chain.length - 1), chain };
}
