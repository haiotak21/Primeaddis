import { NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import connectDB from "@/lib/database";
import Property from "@/models/Property";

export async function GET() {
  try {
    const session = await requireRole(["agent", "admin", "superadmin"]);
    if (session instanceof NextResponse) return session;

    await connectDB();

    const properties = await Property.find({ listedBy: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ properties });
  } catch (e) {
    console.error("agent properties fetch error", e);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}
