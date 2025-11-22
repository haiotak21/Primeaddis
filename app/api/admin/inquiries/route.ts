import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import connectDB from "@/lib/database";
import Inquiry from "@/models/Inquiry";

export async function GET(req: NextRequest) {
  const session = await requireRole(["admin", "superadmin"]);
  if (session instanceof NextResponse) return session;
  try {
    await connectDB();
    let parsedUrl;
    try {
      parsedUrl = new URL(req.url);
    } catch (e) {
      const base = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
      parsedUrl = new URL(req.url, base);
    }
    const { searchParams } = parsedUrl;
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Inquiry.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Inquiry.countDocuments(),
    ]);
    return NextResponse.json({ inquiries: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

// Item routes (DELETE/PATCH) live under `app/api/admin/inquiries/[id]/route.ts`
