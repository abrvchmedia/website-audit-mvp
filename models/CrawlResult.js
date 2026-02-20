import mongoose from "mongoose";

const PageSchema = new mongoose.Schema(
  {
    url: String,
    status: Number,
    loadTime: Number,
    title: String,
    metaDesc: String,
    h1Count: Number,
    wordCount: Number,
    canonical: String,
    healthScore: Number,
    issues: [{ type: String, severity: String, message: String }],
  },
  { _id: false }
);

const IssueSchema = new mongoose.Schema(
  {
    type: String,
    severity: String,
    message: String,
    count: Number,
    pages: [String],
  },
  { _id: false }
);

const CrawlResultSchema = new mongoose.Schema({
  url: String,
  domain: { type: String, index: true },
  pagesChecked: Number,
  overallHealthScore: Number,
  pages: [PageSchema],
  issues: [IssueSchema],
  duplicateTitles: [{ title: String, pages: [String] }],
  createdAt: { type: Date, default: Date.now },
});

CrawlResultSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.models.CrawlResult ||
  mongoose.model("CrawlResult", CrawlResultSchema);
