// ─── Score Range Tiers ────────────────────────────────────────────────────────

export function getScoreRange(score) {
  if (score >= 85)
    return {
      tier: "strong",
      label: "Strong Authority",
      tagline: "Your site has strong fundamentals. Focus on fine-tuning and staying ahead of competitors.",
      color: "emerald",
      textColor: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
      ring: "#34d399",
      emoji: "🏆",
    };
  if (score >= 70)
    return {
      tier: "moderate",
      label: "Moderate Authority",
      tagline: "Solid foundation with clear room to grow. Targeted improvements will push you into the top tier.",
      color: "blue",
      textColor: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/25",
      ring: "#60a5fa",
      emoji: "📈",
    };
  if (score >= 50)
    return {
      tier: "developing",
      label: "Developing Authority",
      tagline: "Multiple gaps are limiting your visibility. A structured improvement plan will deliver fast gains.",
      color: "yellow",
      textColor: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/25",
      ring: "#facc15",
      emoji: "⚠️",
    };
  if (score >= 30)
    return {
      tier: "weak",
      label: "Weak Authority",
      tagline: "Significant issues across multiple areas. Immediate action needed to compete in search.",
      color: "orange",
      textColor: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/25",
      ring: "#fb923c",
      emoji: "🔴",
    };
  return {
    tier: "critical",
    label: "Critical Authority",
    tagline: "Fundamental problems are preventing this site from ranking. Emergency fixes required.",
    color: "red",
    textColor: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    ring: "#f87171",
    emoji: "🚨",
  };
}

// ─── Recommendation Engine ────────────────────────────────────────────────────

export function generateRecommendations(report) {
  const recs = [];

  const add = (priority, area, issue, impact, service, effort, minGain, maxGain, tab) => {
    recs.push({ priority, area, issue, impact, service, effort, scoreEffect: `+${minGain}–${maxGain} pts`, minGain, maxGain, tab });
  };

  // ── PAGE SPEED ──────────────────────────────────────────────────────────────
  if (report.performance < 50) {
    add("critical", "Page Speed", `Critical performance score (${report.performance}/100)`,
      "Pages load too slowly — Google uses Core Web Vitals as a ranking signal and users abandon slow sites.",
      "Page Speed & Core Web Vitals Optimization", "medium", 8, 12, "Technical");
  } else if (report.performance < 75) {
    add("high", "Page Speed", `Below-average performance score (${report.performance}/100)`,
      "Slow load times cost you rankings and reduce conversions by up to 7% per second of delay.",
      "Performance Optimization Package", "medium", 5, 8, "Technical");
  } else if (report.performance < 90) {
    add("medium", "Page Speed", `Performance score could be stronger (${report.performance}/100)`,
      "Fine-tuning Core Web Vitals improves conversion rates and maintains ranking advantage.",
      "Core Web Vitals Tuning", "quick", 2, 5, "Technical");
  }

  if (report.ttfb > 1500) {
    add("critical", "Server Response Time", `TTFB is ${report.ttfb}ms — critically slow (target: <200ms)`,
      "Server response time is the first bottleneck affecting every page — Google and users both penalize it.",
      "Hosting Upgrade + Server-Side Optimization", "quick", 5, 10, "Technical");
  } else if (report.ttfb > 800) {
    add("high", "Server Response Time", `TTFB is ${report.ttfb}ms — above 800ms warning threshold`,
      "Slow server response compounds all other speed issues and tanks Core Web Vitals scores.",
      "Server Performance Optimization", "quick", 3, 6, "Technical");
  }

  // ── ON-PAGE SEO ─────────────────────────────────────────────────────────────
  if (report.seo < 60) {
    add("critical", "On-Page SEO", `SEO score is critically low (${report.seo}/100)`,
      "Major on-page issues are blocking search engine visibility across all target keywords.",
      "Full On-Page SEO Audit & Implementation", "medium", 12, 20, "Overview");
  } else if (report.seo < 80) {
    add("high", "On-Page SEO", `SEO score has significant gaps (${report.seo}/100)`,
      "Missing optimizations are limiting keyword rankings and organic traffic potential.",
      "On-Page SEO Optimization Package", "medium", 8, 12, "Overview");
  }

  if (!report.title) {
    add("critical", "Page Title Tag", "Homepage has no <title> tag",
      "Title tags are the single most important on-page SEO element — Google will auto-generate a poor substitute.",
      "Technical SEO Fix (same-day turnaround)", "quick", 3, 6, "Overview");
  }

  if (!report.metaDescription) {
    add("high", "Meta Description", "No meta description detected",
      "Missing meta descriptions reduce click-through rates from search results by up to 30%.",
      "Meta Tag Copywriting Service", "quick", 2, 4, "Overview");
  }

  if (report.h1Count === 0) {
    add("critical", "H1 Heading Tag", "No H1 heading found on the homepage",
      "H1 is the primary on-page keyword signal for Google — its absence directly hurts rankings.",
      "Content Structure Optimization", "quick", 3, 5, "Overview");
  } else if (report.h1Count > 1) {
    add("medium", "H1 Heading Tag", `${report.h1Count} H1 tags detected (should be exactly 1)`,
      "Multiple H1s dilute keyword focus and confuse search engines about your primary topic.",
      "On-Page Content Restructure", "quick", 1, 3, "Overview");
  }

  if (!report.canonicalDetected) {
    add("medium", "Canonical Tags", "No canonical tag on homepage",
      "Without canonicals, duplicate content can split link equity and cause indexing confusion.",
      "Technical SEO Implementation", "quick", 1, 3, "Overview");
  }

  if (!report.schemaDetected) {
    add("high", "Schema Markup", "No structured data (JSON-LD) detected",
      "Schema enables rich snippets in Google search results — proven to increase click-through rates by 20–30%.",
      "Schema Markup Implementation", "medium", 3, 6, "Overview");
  }

  if (!report.ogTagsDetected) {
    add("medium", "Open Graph / Social Tags", "No Open Graph tags found",
      "Missing OG tags create unprofessional link previews on social media — hurts brand trust and traffic.",
      "Social Meta Tag Setup", "quick", 1, 2, "Overview");
  }

  if (report.imageWithoutAlt > 0) {
    add("medium", "Image Alt Text", `${report.imageWithoutAlt} image${report.imageWithoutAlt > 1 ? "s" : ""} missing alt text`,
      "Alt text is used by Google for image search ranking and accessibility — missing it loses traffic.",
      "Image SEO Optimization", "quick", 1, 3, "Overview");
  }

  // ── CONTENT ─────────────────────────────────────────────────────────────────
  if (report.contentScore < 40) {
    add("critical", "Content Depth", `Content score is very low (${report.contentScore}/100)`,
      "Thin content is a major Google ranking factor — sites with comprehensive content dominate SERPs.",
      "Content Strategy & Writing Package", "long-term", 8, 15, "Overview");
  } else if (report.contentScore < 65) {
    add("high", "Content Depth", `Content score needs improvement (${report.contentScore}/100)`,
      "More comprehensive content signals expertise and authority to Google — a key ranking factor.",
      "Content Optimization & Expansion", "medium", 5, 10, "Overview");
  }

  if (report.wordCount < 300) {
    add("critical", "Word Count", `Homepage has only ${report.wordCount} words — Google calls this "thin content"`,
      "Pages under 300 words rarely rank in competitive niches. Competitors with 1,000+ words outrank thin pages.",
      "Homepage Content Rewrite (1,000+ words)", "medium", 4, 8, "Overview");
  } else if (report.wordCount < 600) {
    add("medium", "Word Count", `Homepage word count (${report.wordCount}) is below the recommended 600+ minimum`,
      "More content gives Google more signals to accurately rank your page for target keywords.",
      "Content Expansion Service", "medium", 2, 4, "Overview");
  }

  // ── SECURITY ────────────────────────────────────────────────────────────────
  if (report.securityScore < 20) {
    add("critical", "Security Headers", `Security grade: ${report.securityGrade} — only ${report.securityHeadersPresent}/${report.securityHeadersTotal} headers present`,
      "Severe security gaps expose visitors to attacks and can trigger Google 'Not Secure' warnings that kill conversions.",
      "Security Hardening Package", "quick", 6, 10, "Technical");
  } else if (report.securityScore < 50) {
    add("high", "Security Headers", `Security grade: ${report.securityGrade} — missing critical headers`,
      "Missing security headers leave the site vulnerable to clickjacking and cross-site scripting attacks.",
      "Security Headers Implementation", "quick", 4, 7, "Technical");
  } else if (report.securityScore < 80) {
    add("medium", "Security Headers", `Security score is ${report.securityScore}/100 — some headers missing`,
      "Incomplete security headers are checked by Google as part of the Best Practices score.",
      "Security Audit & Header Fix", "quick", 2, 4, "Technical");
  }

  // ── TECHNICAL ───────────────────────────────────────────────────────────────
  if (report.robotsDisallowAll) {
    add("critical", "Robots.txt", "robots.txt is blocking ALL search engine crawlers (Disallow: /)",
      "This site is completely invisible to Google — it cannot rank for any keyword.",
      "Emergency Robots.txt Fix (same-day)", "quick", 20, 30, "Technical");
  } else if (!report.hasRobots) {
    add("medium", "Robots.txt", "No robots.txt file detected",
      "Missing robots.txt means uncontrolled crawler access — sensitive pages may get indexed.",
      "Robots.txt Setup & Configuration", "quick", 1, 2, "Technical");
  }

  if (!report.hasSitemap) {
    add("high", "XML Sitemap", "No sitemap.xml found",
      "Without a sitemap, Google may miss important pages — especially critical for sites with 10+ pages.",
      "Sitemap Creation & Search Console Submission", "quick", 2, 4, "Technical");
  }

  if (report.redirectCount > 2) {
    add("high", "Redirect Chains", `${report.redirectCount} redirect hops detected`,
      "Each redirect in the chain adds load time, dilutes link equity, and can cause crawl budget waste.",
      "Redirect Chain Cleanup & 301 Audit", "quick", 2, 5, "Technical");
  }

  // ── BACKLINKS (always present) ───────────────────────────────────────────────
  add("high", "Backlink Authority", "Backlinks are contributing 0% to your Authority Score",
    "Backlinks are Google's #1 ranking signal — 20% of your Authority Score is untapped. Competitors with strong link profiles will always outrank you regardless of on-page work.",
    "Monthly Link Building Campaign", "long-term", 10, 20, "Overview");

  // ── DOMAIN AGE ──────────────────────────────────────────────────────────────
  if (report.domainAgeScore < 60) {
    add("low", "Domain Age", `Domain is relatively new (${report.domainAge ? report.domainAge + " years" : "age unknown"})`,
      "Newer domains have lower inherent trust with Google — aggressive link building can accelerate authority building.",
      "Accelerated Authority Building Package", "long-term", 3, 8, "Overview");
  }

  // Sort: critical → high → medium → low, then quick wins first within priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const effortOrder = { quick: 0, medium: 1, "long-term": 2 };

  return recs.sort(
    (a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      effortOrder[a.effort] - effortOrder[b.effort]
  );
}

// ─── Gain Estimator ───────────────────────────────────────────────────────────

export function estimateTotalGain(recs, priorities = ["critical", "high"]) {
  const filtered = recs.filter((r) => priorities.includes(r.priority));
  const min = Math.min(filtered.reduce((s, r) => s + r.minGain, 0), 45);
  const max = Math.min(filtered.reduce((s, r) => s + r.maxGain, 0), 65);
  return { min, max, count: filtered.length };
}

// ─── Sales Script Generator ───────────────────────────────────────────────────

export function generateSalesScript(report, recs) {
  const range = getScoreRange(report.authorityScore);
  const criticals = recs.filter((r) => r.priority === "critical");
  const highs = recs.filter((r) => r.priority === "high");
  const quickWins = recs.filter((r) => r.effort === "quick");
  const gain = estimateTotalGain(recs);
  const topIssue = criticals[0] || highs[0] || recs[0];

  const lines = [
    `Your website currently scores ${report.authorityScore}/100 on our Authority Score — placing it in the "${range.label}" tier.`,
    "",
    `${range.tagline}`,
    "",
    `The biggest issue holding you back right now is ${topIssue?.area}: ${topIssue?.issue?.toLowerCase()}.`,
    "",
    `We found ${recs.length} total improvement opportunities:`,
    `  • ${criticals.length} critical issue${criticals.length !== 1 ? "s" : ""} requiring immediate attention`,
    `  • ${highs.length} high-priority fix${highs.length !== 1 ? "es" : ""} with significant ranking impact`,
    `  • ${quickWins.length} quick wins we can implement this week`,
    "",
    `Based on our scoring model, addressing the critical and high-priority issues alone could increase your Authority Score by an estimated +${gain.min}–${gain.max} points.`,
    "",
    `The recommended service plan covers: ${[...new Set(criticals.concat(highs).map((r) => r.service))].slice(0, 3).join(", ")}.`,
  ];

  return lines.join("\n");
}
