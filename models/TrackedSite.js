import mongoose from "mongoose";

const TrackedSiteSchema = new mongoose.Schema({
  url: { type: String, unique: true },
  domain: String,
  keywords: [String],
  competitors: [String],
  active: { type: Boolean, default: true },
  lastAuthorityScore: Number,
  alertThreshold: { type: Number, default: 5 },
  lastAuditAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TrackedSite ||
  mongoose.model("TrackedSite", TrackedSiteSchema);
