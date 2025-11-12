import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Favorite from "@/models/Favorite";
import FavoriteSnapshot from "@/models/FavoriteSnapshot";
import { requireRole } from "@/lib/middleware/auth";

// POST /api/admin/jobs/snapshot-favorites
// Creates a daily snapshot of total favorites and counts per property.
export async function POST() {
  const session = await requireRole(["admin", "superadmin"]);
  if (session instanceof NextResponse) return session;
  try {
    await connectDB();
    const favs = await Favorite.find().lean();
    const perProperty: Record<string, number> = {};
    for (const f of favs) {
      const id = String((f as any).propertyId);
      perProperty[id] = (perProperty[id] || 0) + 1;
    }
    const total = favs.length;
    const now = new Date();
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    await FavoriteSnapshot.updateOne(
      { date: day },
      { $set: { total, perProperty } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true, date: day, total, properties: Object.keys(perProperty).length });
  } catch (e) {
    console.error("snapshot favorites error", e);
    return NextResponse.json({ error: "Failed to snapshot favorites" }, { status: 500 });
  }
}
