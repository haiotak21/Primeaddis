import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Property from "@/models/Property";
import { requireRole } from "@/lib/middleware/auth";

// POST /api/admin/jobs/unfeature-expired
// Unset featured for properties whose featuredUntil is in the past.
export async function POST() {
  const session = await requireRole(["admin", "superadmin"]);
  if (session instanceof NextResponse) return session;
  try {
    await connectDB();
    const now = new Date();
    const res = await Property.updateMany(
      { featured: true, featuredUntil: { $ne: null, $lt: now } },
      { $set: { featured: false, featuredUntil: null } }
    );
    return NextResponse.json({ ok: true, matched: res.matchedCount, modified: res.modifiedCount });
  } catch (e) {
    console.error("unfeature expired error", e);
    return NextResponse.json({ error: "Failed to unfeature expired" }, { status: 500 });
  }
}
