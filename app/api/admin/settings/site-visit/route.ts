import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/database";
import Settings from "@/models/Settings";
import { requireRole } from "@/lib/middleware/auth";

const ALLOWED_ROLES = ["superadmin"] as const;

export async function GET() {
  try {
    await connectDB();
    const doc = await Settings.findOne().lean();
    return NextResponse.json({ siteVisitEmailEnabled: !!doc?.siteVisitEmailEnabled });
  } catch (error) {
    console.error("GET settings/site-visit error:", error);
    return NextResponse.json({ siteVisitEmailEnabled: false });
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireRole(ALLOWED_ROLES as unknown as string[]);
  if (session instanceof NextResponse) return session;
  try {
    const { siteVisitEmailEnabled } = await req.json();
    await connectDB();
    const doc = await Settings.findOne();
    if (!doc) {
      await Settings.create({ siteVisitEmailEnabled: !!siteVisitEmailEnabled });
    } else {
      doc.siteVisitEmailEnabled = !!siteVisitEmailEnabled;
      await doc.save();
    }
    return NextResponse.json({ success: true, siteVisitEmailEnabled: !!siteVisitEmailEnabled });
  } catch (error) {
    console.error("PUT settings/site-visit error:", error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}

export const runtime = "nodejs";
