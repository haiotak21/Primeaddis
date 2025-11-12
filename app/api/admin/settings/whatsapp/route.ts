import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/database";
import Settings from "@/models/Settings";
import { requireRole } from "@/lib/middleware/auth";

// Allow both admin and superadmin to manage the WhatsApp number
const ALLOWED_ROLES = ["admin", "superadmin"] as const;

export async function GET() {
  try {
    await connectDB();
    const doc = await Settings.findOne().lean();
    return NextResponse.json({ whatsappNumber: doc?.whatsappNumber || "" });
  } catch (error) {
    console.error("GET settings/whatsapp error:", error);
    return NextResponse.json({ whatsappNumber: "" });
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireRole(ALLOWED_ROLES as unknown as string[]);
  if (session instanceof NextResponse) return session;
  try {
    const { whatsappNumber } = await req.json();
    // Keep digits only; allow leading + in UI but store digits to be used with wa.me
    const digits = String(whatsappNumber || "").replace(/\D/g, "");

    await connectDB();
    const doc = await Settings.findOne();
    if (!doc) {
      await Settings.create({ whatsappNumber: digits });
    } else {
      doc.whatsappNumber = digits;
      await doc.save();
    }
    return NextResponse.json({ success: true, whatsappNumber: digits });
  } catch (error) {
    console.error("PUT settings/whatsapp error:", error);
    return NextResponse.json({ error: "Failed to update WhatsApp number" }, { status: 500 });
  }
}

export const runtime = "nodejs";
