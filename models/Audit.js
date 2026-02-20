import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema({
  url: String,
  performance: Number,
  accessibility: Number,
  seo: Number,
  bestPractices: Number,
  title: String,
  metaDescription: String,
  h1Count: Number,
  imageWithoutAlt: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Audit || mongoose.model("Audit", AuditSchema);
