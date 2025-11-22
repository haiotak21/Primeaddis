import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import connectDB from "@/lib/database";
import Inquiry from "@/models/Inquiry";

export async function GET(req: NextRequest) {
  const session = await requireRole(["admin", "superadmin"]);
  if (session instanceof NextResponse) return session;
  try {
    await connectDB();
    const count = await Inquiry.countDocuments({ responded: false });
    return NextResponse.json({ count });
  } catch (err) {
    console.error('Error counting inquiries', err);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
