import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import connectDB from "@/lib/database";
import SiteVisitRequest from "@/models/SiteVisitRequest";

export async function GET(req: NextRequest) {
  const session = await requireRole(["admin", "superadmin"]);
  if (session instanceof NextResponse) return session;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      SiteVisitRequest.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      SiteVisitRequest.countDocuments(),
    ]);
    return NextResponse.json({
      siteVisits: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching site visit requests:", error);
    return NextResponse.json({ error: "Failed to fetch site visit requests" }, { status: 500 });
  }
}
