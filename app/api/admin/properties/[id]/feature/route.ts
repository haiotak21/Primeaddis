import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Property from "@/models/Property";
import { requireRole } from "@/lib/middleware/auth";

// PUT /api/admin/properties/[id]/feature
// Body: { featured: boolean, featuredUntil?: string | null }
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["admin", "superadmin"]);
    if (session instanceof NextResponse) return session;

    const body = await req.json().catch(() => ({}));
    const { featured, featuredUntil } = body as { featured?: boolean; featuredUntil?: string | null };

    if (typeof featured !== "boolean") {
      return NextResponse.json({ error: "'featured' boolean is required" }, { status: 400 });
    }

    await connectDB();

    const update: any = { featured };
    if (featured) {
      if (featuredUntil) {
        const d = new Date(featuredUntil);
        if (Number.isNaN(d.getTime())) {
          return NextResponse.json({ error: "Invalid featuredUntil date" }, { status: 400 });
        }
        update.featuredUntil = d;
      } else {
        // default 30 days from now
        const d = new Date();
        d.setDate(d.getDate() + 30);
        update.featuredUntil = d;
      }
    } else {
      update.featuredUntil = null;
    }

    const property = await Property.findByIdAndUpdate(params.id, update, { new: true });
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Error toggling featured:", error);
    return NextResponse.json({ error: "Failed to update featured state" }, { status: 500 });
  }
}
