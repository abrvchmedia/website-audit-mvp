import mongoose from "mongoose";

const KeywordRankSchema = new mongoose.Schema({
  domain: { type: String, index: true },
  keyword: String,
  rank: Number, // null = not in top 100
  url: String, // ranking URL
  checkedAt: { type: Date, default: Date.now },
});

KeywordRankSchema.index({ domain: 1, keyword: 1, checkedAt: -1 });
KeywordRankSchema.index({ checkedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.models.KeywordRank ||
  mongoose.model("KeywordRank", KeywordRankSchema);
