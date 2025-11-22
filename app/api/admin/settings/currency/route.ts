import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/database";
import Settings from "@/models/Settings";
import { requireRole } from "@/lib/middleware/auth";

const ALLOWED_ROLES = ["superadmin"] as const;

export async function GET() {
  try {
    await connectDB();
    const doc = await Settings.findOne().lean();
    return NextResponse.json({ currency: doc?.currency || "ETB", exchangeRate: doc?.exchangeRate ?? 1 });
  } catch (error) {
    console.error("GET settings/currency error:", error);
    return NextResponse.json({ currency: "ETB", exchangeRate: 1 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireRole(ALLOWED_ROLES as unknown as string[]);
  if (session instanceof NextResponse) return session;
  try {
    const body = await req.json();
    const currency = String(body.currency || "ETB").toUpperCase();
    const exchangeRate = Number(body.exchangeRate) || 1;
    await connectDB();
    const doc = await Settings.findOne();
    if (!doc) {
      await Settings.create({ currency, exchangeRate });
    } else {
      doc.currency = currency;
      doc.exchangeRate = exchangeRate;
      await doc.save();
    }
    return NextResponse.json({ success: true, currency, exchangeRate });
  } catch (error) {
    console.error("PUT settings/currency error:", error);
    return NextResponse.json({ error: "Failed to update currency settings" }, { status: 500 });
  }
}

export const runtime = "nodejs";
