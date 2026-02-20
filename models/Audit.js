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
  // Backlinks (placeholder for paid API)
  backlinkScore: Number,
  backlinkCount: Number,
  indexedPages: Number,
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
  // Authority
  authorityScore: Number,
  createdAt: { type: Date, default: Date.now },
});

// TTL index — auto-delete after 90 days
AuditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.models.Audit || mongoose.model("Audit", AuditSchema);
