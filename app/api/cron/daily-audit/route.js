import { connectDB } from "@/lib/mongodb";
import TrackedSite from "@/models/TrackedSite";
import Audit from "@/models/Audit";
import { runFullAudit } from "@/services/auditService";

export const maxDuration = 60;

export async function GET(req) {
  // Vercel cron passes CRON_SECRET as a Bearer token
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const sites = await TrackedSite.find({ active: true }).limit(10);
    const results = [];

    for (const site of sites) {
      try {
        const audit = await runFullAudit(site.url);

        // Check for score drop alert
        const dropped =
          site.lastAuthorityScore &&
          site.lastAuthorityScore - audit.authorityScore >= (site.alertThreshold || 5);

        await Audit.create({ ...audit, alert: dropped ? "score_drop" : null });

        await TrackedSite.updateOne(
          { _id: site._id },
          { lastAuthorityScore: audit.authorityScore, lastAuditAt: new Date() }
        );

        results.push({ domain: site.domain, score: audit.authorityScore, dropped });
      } catch (err) {
        results.push({ domain: site.domain, error: err.message });
      }
    }

    return Response.json({ ran: results.length, results }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
