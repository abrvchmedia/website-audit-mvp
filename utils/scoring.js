// ─── Authority Score (new formula) ───────────────────────────────────────────

export function calculateAuthorityScore({
  technicalHealth = 0,
  searchVisibility = 0,
  contentDepth = 0,
  backlinkAuthority = 0,
  brandSignals = 0,
}) {
  return Math.round(
    technicalHealth * 0.25 +
      searchVisibility * 0.25 +
      contentDepth * 0.2 +
      backlinkAuthority * 0.2 +
      brandSignals * 0.1
  );
}

// ─── Component score builders ─────────────────────────────────────────────────

export function getTechnicalHealth({
  performance = 0,
  accessibility = 0,
  bestPractices = 0,
  securityScore = 0,
  hasSitemap = false,
  hasRobots = false,
  ttfb = null,
  redirectCount = 0,
}) {
  let score = (performance + accessibility + bestPractices + securityScore) / 4;
  if (hasSitemap) score = Math.min(100, score + 4);
  if (hasRobots) score = Math.min(100, score + 2);
  if (ttfb !== null) {
    if (ttfb < 200) score = Math.min(100, score + 4);
    else if (ttfb > 800) score = Math.max(0, score - 8);
  }
  if (redirectCount > 1) score = Math.max(0, score - redirectCount * 3);
  return Math.round(score);
}

export function getSearchVisibility({ seo = 0, avgKeywordRank = null }) {
  if (avgKeywordRank === null) return seo;
  // Map avg rank to 0–100: rank 1 = 100, rank 20 = 0
  const rankScore = Math.max(0, Math.round(100 - (avgKeywordRank - 1) * 5.3));
  return Math.round(seo * 0.6 + rankScore * 0.4);
}

export function getBrandSignals({
  domainAgeScore = 40,
  schemaDetected = false,
  ogTagsDetected = false,
}) {
  let score = domainAgeScore * 0.5;
  if (schemaDetected) score += 30;
  if (ogTagsDetected) score += 20;
  return Math.min(100, Math.round(score));
}

// ─── Individual score helpers (kept from v1) ─────────────────────────────────

export function getDomainAgeScore(createdDate) {
  if (!createdDate) return 40;
  const years =
    (Date.now() - new Date(createdDate).getTime()) /
    (365.25 * 24 * 60 * 60 * 1000);
  if (years > 10) return 100;
  if (years > 5) return 80;
  if (years > 1) return 60;
  return 40;
}

export function getSecurityScore(headers = {}) {
  const checks = [
    "strict-transport-security",
    "x-frame-options",
    "x-content-type-options",
    "content-security-policy",
    "referrer-policy",
    "permissions-policy",
  ];
  const present = checks.filter((h) => headers[h]).length;
  return Math.round((present / checks.length) * 100);
}

export function getContentScore({
  wordCount = 0,
  h1Count = 0,
  schemaDetected = false,
  ogTagsDetected = false,
  canonicalDetected = false,
  headingDepth = 0,
}) {
  let score = 0;
  if (wordCount > 1000) score += 25;
  else if (wordCount > 500) score += 15;
  else if (wordCount > 200) score += 8;
  if (h1Count === 1) score += 20;
  else if (h1Count > 1) score += 10;
  if (headingDepth >= 3) score += 15;
  else if (headingDepth >= 2) score += 8;
  if (schemaDetected) score += 20;
  if (ogTagsDetected) score += 10;
  if (canonicalDetected) score += 10;
  return Math.min(score, 100);
}

export function getCrawlHealthScore(issues = []) {
  const penalties = issues.reduce((sum, i) => {
    const p = i.severity === "critical" ? 20 : i.severity === "warning" ? 8 : 3;
    return sum + p * Math.min(i.count, 5);
  }, 0);
  return Math.max(0, 100 - penalties);
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export function scoreTheme(score) {
  if (score >= 80)
    return {
      label: "Excellent",
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
      bar: "bg-emerald-400",
      ring: "#34d399",
    };
  if (score >= 60)
    return {
      label: "Good",
      text: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/25",
      bar: "bg-yellow-400",
      ring: "#facc15",
    };
  return {
    label: "Needs Work",
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    bar: "bg-red-400",
    ring: "#f87171",
  };
}
