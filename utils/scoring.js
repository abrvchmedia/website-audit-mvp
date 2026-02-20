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

export function calculateAuthorityScore({
  seo = 0,
  performance = 0,
  domainAgeScore = 0,
  securityScore = 0,
  backlinkScore = 0,
  contentScore = 0,
}) {
  return Math.round(
    seo * 0.25 +
      performance * 0.15 +
      domainAgeScore * 0.1 +
      securityScore * 0.1 +
      backlinkScore * 0.2 +
      contentScore * 0.2
  );
}

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
