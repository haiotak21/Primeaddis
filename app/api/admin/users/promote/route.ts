import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import User from "@/models/User";
import { requireRole } from "@/lib/middleware/auth";

export async function POST(req: Request) {
  try {
    const session = await requireRole(["superadmin"]);
    if (session instanceof NextResponse) return session;
    const body = await req.json().catch(() => null as any);
    const rawEmail = body?.email as string | undefined;
    if (!rawEmail || !rawEmail.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const email = rawEmail.trim().toLowerCase();
    await connectDB();
    // Find user first to avoid accidentally changing superadmin role
    const existing = await User.findOne({ email }).select("-password");
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (existing.role === "superadmin") {
      return NextResponse.json({ user: existing });
    }
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
    }
    const user = await User.findOne({ email }).select("-password");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Promote admin error:", error);
    return NextResponse.json({ error: "Failed to promote user" }, { status: 500 });
  }
}
