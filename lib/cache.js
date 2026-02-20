import { connectDB } from "@/lib/mongodb";
import Audit from "@/models/Audit";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedAudit(url) {
  try {
    await connectDB();
    const since = new Date(Date.now() - CACHE_TTL_MS);
    return await Audit.findOne({ url, createdAt: { $gte: since } }).sort({
      createdAt: -1,
    });
  } catch {
    return null;
  }
}
