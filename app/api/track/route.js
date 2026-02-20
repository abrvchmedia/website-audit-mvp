import { connectDB } from "@/lib/mongodb";
import TrackedSite from "@/models/TrackedSite";

export async function GET() {
  try {
    await connectDB();
    const sites = await TrackedSite.find({ active: true }).sort({ createdAt: -1 });
    return Response.json(sites, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { url, keywords = [], competitors = [] } = await req.json();
  if (!url) return Response.json({ error: "url required" }, { status: 400 });

  try {
    const { hostname: domain } = new URL(url);
    await connectDB();
    const site = await TrackedSite.findOneAndUpdate(
      { url },
      { url, domain, keywords, competitors, active: true },
      { upsert: true, new: true }
    );
    return Response.json(site, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { url } = await req.json();
  try {
    await connectDB();
    await TrackedSite.updateOne({ url }, { active: false });
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
