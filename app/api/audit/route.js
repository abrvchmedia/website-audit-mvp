import { runFullAudit } from "@/services/auditService";
import { connectDB } from "@/lib/mongodb";
import Audit from "@/models/Audit";
import { getCachedAudit } from "@/lib/cache";
import { rateLimit } from "@/lib/rateLimit";

export const maxDuration = 60;

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = rateLimit(ip);
  if (!allowed) {
    return Response.json(
      { error: "Rate limit exceeded. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { url, forceRefresh = false } = body;
  if (!url) return Response.json({ error: "URL is required" }, { status: 400 });

  try {
    new URL(url);
  } catch {
    return Response.json({ error: "Invalid URL format" }, { status: 400 });
  }

  try {
    if (!forceRefresh) {
      const cached = await getCachedAudit(url);
      if (cached) {
        return Response.json({ ...cached.toObject(), cached: true }, { status: 200 });
      }
    }

    const auditData = await runFullAudit(url);

    try {
      await connectDB();
      await Audit.create(auditData);
    } catch (dbErr) {
      console.warn("MongoDB save skipped:", dbErr.message);
    }

    return Response.json(auditData, { status: 200 });
  } catch (err) {
    console.error("Audit error:", err.message);
    return Response.json(
      { error: "Audit failed", details: err.message },
      { status: 500 }
    );
  }
}
