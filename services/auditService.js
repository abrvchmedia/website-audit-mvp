import { fetchPageSpeed } from "@/lib/api/pagespeed";
import { fetchSecurityData } from "@/lib/api/security";
import { fetchWhoisData } from "@/lib/api/whois";
import { fetchContentData } from "@/lib/api/content";
import { calculateAuthorityScore } from "@/utils/scoring";

export async function runFullAudit(url) {
  const { hostname: domain } = new URL(url);

  // Run all external calls in parallel
  const [psResult, secResult, whoisResult, contentResult] =
    await Promise.allSettled([
      fetchPageSpeed(url),
      fetchSecurityData(url),
      fetchWhoisData(domain),
      fetchContentData(url),
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

  const authorityScore = calculateAuthorityScore({
    seo: ps.seo,
    performance: ps.performance,
    domainAgeScore: whois.domainAgeScore,
    securityScore: sec.score,
    backlinkScore: 0, // Requires paid API (Ahrefs/Moz)
    contentScore: content.contentScore,
  });

  return {
    url,
    domain,
    performance: ps.performance,
    accessibility: ps.accessibility,
    seo: ps.seo,
    bestPractices: ps.bestPractices,
    securityScore: sec.score,
    securityGrade: sec.grade,
    securityHeaders: sec.headers,
    securityHeadersPresent: sec.presentCount,
    securityHeadersTotal: sec.totalChecks,
    domainAge: whois.ageYears,
    domainAgeScore: whois.domainAgeScore,
    domainCreatedDate: whois.createdDate,
    backlinkScore: 0,
    backlinkCount: null,
    indexedPages: null,
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
    authorityScore,
  };
}
