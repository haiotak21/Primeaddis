import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Property from "@/models/Property";
import { requireRole } from "@/lib/middleware/auth";

// PUT /api/admin/properties/[id]/status
// Body: { status: 'active'|'pending'|'sold'|'rented'|'draft' }
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["admin", "superadmin"]);
    if (session instanceof NextResponse) return session;

    const body = await req.json().catch(() => ({}));
    const { status } = body as { status?: string };

    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "'status' is required" }, { status: 400 });
    }

    const allowed = ["active", "pending", "sold", "rented", "draft"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectDB();

    const resolvedParams: any = await (params as any);
    const property = await Property.findByIdAndUpdate(
      resolvedParams.id,
      { status },
      { new: true }
    );
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Error updating property status:", error);
    return NextResponse.json({ error: "Failed to update property status" }, { status: 500 });
  }
}
