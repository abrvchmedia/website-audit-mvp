import { connectDB } from "@/lib/mongodb";
import Audit from "@/models/Audit";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");
    const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

    const query = domain ? { domain } : {};
    const audits = await Audit.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        "url domain authorityScore seo performance accessibility bestPractices securityScore contentScore technicalHealth searchVisibility brandSignals createdAt alert"
      );

    return Response.json(audits, { status: 200 });
  } catch (err) {
    console.error("History error:", err.message);
    return Response.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
