import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema({
  url: String,
  domain: String,
  // PageSpeed
  performance: Number,
  accessibility: Number,
  seo: Number,
  bestPractices: Number,
  // Security
  securityScore: Number,
  securityGrade: String,
  securityHeaders: mongoose.Schema.Types.Mixed,
  securityHeadersPresent: Number,
  securityHeadersTotal: Number,
  // Domain / WHOIS
  domainAge: String,
  domainAgeScore: Number,
  domainCreatedDate: String,
  // Technical
  hasSitemap: Boolean,
  sitemapUrl: String,
  hasRobots: Boolean,
  robotsDisallowAll: Boolean,
  robotsPreview: String,
  ttfb: Number,
  redirectCount: Number,
  redirectChain: mongoose.Schema.Types.Mixed,
  // Content
  title: String,
  metaDescription: String,
  h1Count: Number,
  imageWithoutAlt: Number,
  wordCount: Number,
  headingDepth: Number,
  schemaDetected: Boolean,
  ogTagsDetected: Boolean,
  canonicalDetected: Boolean,
  contentScore: Number,
  // Backlinks (placeholder)
  backlinkScore: Number,
  backlinkCount: Number,
  indexedPages: Number,
  // New authority components
  technicalHealth: Number,
  searchVisibility: Number,
  brandSignals: Number,
  backlinkAuthority: Number,
  authorityScore: Number,
  // Alerts
  alert: String,
  createdAt: { type: Date, default: Date.now },
});

AuditSchema.index({ domain: 1, createdAt: -1 });
AuditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.models.Audit || mongoose.model("Audit", AuditSchema);
