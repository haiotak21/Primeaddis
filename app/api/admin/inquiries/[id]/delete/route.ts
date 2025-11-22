import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import connectDB from "@/lib/database";
import Inquiry from "@/models/Inquiry";

export async function POST(req: NextRequest, { params }: { params: Record<string, string> }) {
  const session = await requireRole(["admin", "superadmin"]);
  if (session instanceof NextResponse) return session;
  try {
    await connectDB();
    const id = params?.id as string;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await Inquiry.findByIdAndDelete(id);
    // Redirect back to admin inquiries list
    const base = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
    return NextResponse.redirect(new URL('/admin/inquiries', base));
  } catch (error) {
    console.error("Error deleting inquiry via form:", error);
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
