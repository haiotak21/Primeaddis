import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import User from "@/models/User";
import { requireRole } from "@/lib/middleware/auth";

export async function POST(req: Request) {
  try {
    const session = await requireRole(["superadmin"]);
    if (session instanceof NextResponse) return session;

    // Parse and normalize input
    const body = await req.json().catch(() => null as any);
    const rawEmail = body?.email as string | undefined;
    if (!rawEmail || !rawEmail.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const email = rawEmail.trim().toLowerCase();

    await connectDB();

    // Try to find existing user first (case-insensitive by normalizing input)
    let user = await User.findOne({ email }).select("-password");
    if (user) {
      // Do not demote superadmins; otherwise promote to admin if needed
      if (user.role !== "superadmin" && user.role !== "admin") {
        user.role = "admin";
        await user.save();
      }
      return NextResponse.json({ user });
    }

    // Create a new admin user. Handle rare race condition with unique index.
    try {
      user = await User.create({ name: email.split("@")[0], email, role: "admin" });
      // Re-fetch without password just in case model select excludes
      user = await User.findOne({ email }).select("-password");
      return NextResponse.json({ user });
    } catch (err: any) {
      // If duplicate key error occurs (E11000), another writer created the user first; promote instead
      // MongoServerError code 11000 indicates unique index violation
      if (err?.code === 11000) {
        const existing = await User.findOne({ email }).select("-password");
        if (existing) {
          if (existing.role !== "superadmin" && existing.role !== "admin") {
            existing.role = "admin";
            await existing.save();
          }
          return NextResponse.json({ user: existing });
        }
      }
      throw err;
    }
  } catch (error) {
    console.error("Invite admin error:", error);
    return NextResponse.json({ error: "Failed to invite user" }, { status: 500 });
  }
}
