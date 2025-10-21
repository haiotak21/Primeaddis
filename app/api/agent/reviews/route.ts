import { NextResponse, NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import connectDB from "@/lib/database";
import Review from "@/models/Review";
import Property from "@/models/Property";

// GET reviews with optional filters (status, q)
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["agent", "admin", "superadmin"]);
    if (session instanceof NextResponse) return session;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const query: any = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) query.status = status;

    let reviewsQuery = Review.find(query)
      .populate("userId", "name email")
      .populate("propertyId", "title")
      .sort({ createdAt: -1 });

    let reviews = await reviewsQuery.lean();

    if (q) {
      const qLower = q.toLowerCase();
      reviews = reviews.filter((r: any) =>
        String(r.propertyId?.title || "").toLowerCase().includes(qLower) ||
        String(r.userId?.name || "").toLowerCase().includes(qLower),
      );
    }

    return NextResponse.json({ reviews });
  } catch (e) {
    console.error("agent reviews fetch error", e);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
