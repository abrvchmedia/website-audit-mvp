import { fetchPageSpeed } from "@/lib/api/pagespeed";
import { fetchSecurityData } from "@/lib/api/security";
import { fetchWhoisData } from "@/lib/api/whois";
import { fetchContentData } from "@/lib/api/content";
import { runTechnicalAudit } from "@/services/seo/technicalAudit";
import {
  calculateAuthorityScore,
  getTechnicalHealth,
  getSearchVisibility,
  getBrandSignals,
} from "@/utils/scoring";

export async function runFullAudit(url) {
  const { hostname: domain } = new URL(url);

  // All parallel — total time = slowest call
  const [psResult, secResult, whoisResult, contentResult, techResult] =
    await Promise.allSettled([
      fetchPageSpeed(url),
      fetchSecurityData(url),
      fetchWhoisData(domain),
      fetchContentData(url),
      runTechnicalAudit(url),
    ]);

  const ps =
    psResult.status === "fulfilled"
      ? psResult.value
      : { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 };

  const sec =
    secResult.status === "fulfilled"
      ? secResult.value
      : { score: 0, grade: "F", headers: {}, presentCount: 0, totalChecks: 6 };

  const whois =
    whoisResult.status === "fulfilled"
      ? whoisResult.value
      : { createdDate: null, domainAgeScore: 40, ageYears: null };

  const content =
    contentResult.status === "fulfilled"
      ? contentResult.value
      : {
          title: "",
          metaDescription: "",
          h1Count: 0,
          imageWithoutAlt: 0,
          wordCount: 0,
          contentScore: 0,
          schemaDetected: false,
          ogTagsDetected: false,
          canonicalDetected: false,
          headingDepth: 0,
        };

  const tech =
    techResult.status === "fulfilled"
      ? techResult.value
      : { sitemap: { found: false }, robots: { found: false }, ttfb: null, redirects: { count: 0, chain: [] } };

  // ── Authority Score Components ──────────────────────────────────────────────
  const technicalHealth = getTechnicalHealth({
    performance: ps.performance,
    accessibility: ps.accessibility,
    bestPractices: ps.bestPractices,
    securityScore: sec.score,
    hasSitemap: tech.sitemap.found,
    hasRobots: tech.robots.found,
    ttfb: tech.ttfb,
    redirectCount: tech.redirects.count,
  });

  const searchVisibility = getSearchVisibility({ seo: ps.seo });

  const brandSignals = getBrandSignals({
    domainAgeScore: whois.domainAgeScore,
    schemaDetected: content.schemaDetected,
    ogTagsDetected: content.ogTagsDetected,
  });

  const authorityScore = calculateAuthorityScore({
    technicalHealth,
    searchVisibility,
    contentDepth: content.contentScore,
    backlinkAuthority: 0, // Requires Ahrefs / Moz API key
    brandSignals,
  });

  return {
    url,
    domain,
    // PageSpeed
    performance: ps.performance,
    accessibility: ps.accessibility,
    seo: ps.seo,
    bestPractices: ps.bestPractices,
    // Security
    securityScore: sec.score,
    securityGrade: sec.grade,
    securityHeaders: sec.headers,
    securityHeadersPresent: sec.presentCount,
    securityHeadersTotal: sec.totalChecks,
    // Domain
    domainAge: whois.ageYears,
    domainAgeScore: whois.domainAgeScore,
    domainCreatedDate: whois.createdDate,
    // Technical
    hasSitemap: tech.sitemap.found,
    sitemapUrl: tech.sitemap.url || null,
    hasRobots: tech.robots.found,
    robotsDisallowAll: tech.robots.disallowAll || false,
    robotsPreview: tech.robots.preview || null,
    ttfb: tech.ttfb,
    redirectCount: tech.redirects.count,
    redirectChain: tech.redirects.chain,
    // Content
    title: content.title,
    metaDescription: content.metaDescription,
    h1Count: content.h1Count,
    imageWithoutAlt: content.imageWithoutAlt,
    wordCount: content.wordCount,
    headingDepth: content.headingDepth,
    schemaDetected: content.schemaDetected,
    ogTagsDetected: content.ogTagsDetected,
    canonicalDetected: content.canonicalDetected,
    contentScore: content.contentScore,
    // Authority components
    technicalHealth,
    searchVisibility,
    brandSignals,
    backlinkAuthority: 0,
    authorityScore,
  };
}
