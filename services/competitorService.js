import { fetchPageSpeed } from "@/lib/api/pagespeed";
import { fetchSecurityData } from "@/lib/api/security";
import { fetchWhoisData } from "@/lib/api/whois";
import { fetchContentData } from "@/lib/api/content";
import {
  getTechnicalHealth,
  getSearchVisibility,
  getBrandSignals,
  calculateAuthorityScore,
} from "@/utils/scoring";

export async function runCompetitorAudit(url) {
  const { hostname: domain } = new URL(url);

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
      : { contentScore: 0, schemaDetected: false, ogTagsDetected: false };

  const technicalHealth = getTechnicalHealth({
    performance: ps.performance,
    accessibility: ps.accessibility,
    bestPractices: ps.bestPractices,
    securityScore: sec.score,
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
    backlinkAuthority: 0,
    brandSignals,
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
    contentScore: content.contentScore,
    domainAgeScore: whois.domainAgeScore,
    domainAge: whois.ageYears,
    technicalHealth,
    searchVisibility,
    brandSignals,
    authorityScore,
  };
}
