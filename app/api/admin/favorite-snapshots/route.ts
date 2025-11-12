import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import FavoriteSnapshot from "@/models/FavoriteSnapshot";
import { requireRole } from "@/lib/middleware/auth";

// GET /api/admin/favorite-snapshots?days=30
export async function GET(req: NextRequest) {
  const session = await requireRole(["admin", "superadmin"]);
  if (session instanceof NextResponse) return session;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const days = Math.min(Math.max(Number(searchParams.get("days") || 30), 1), 180);
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days + 1);
    const snapshots = await FavoriteSnapshot.find({ date: { $gte: since } })
      .sort({ date: 1 })
      .lean();
    return NextResponse.json({ snapshots });
  } catch (e) {
    console.error("favorite snapshots get error", e);
    return NextResponse.json({ error: "Failed to fetch snapshots" }, { status: 500 });
  }
}
