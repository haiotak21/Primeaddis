import { NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import connectDB from "@/lib/database";
import Review from "@/models/Review";
import Property from "@/models/Property"

// Approve or reject review if it belongs to agent's property
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["agent", "admin", "superadmin"]);
    if (session instanceof NextResponse) return session;

    const { action } = await req.json().catch(() => ({ action: "" }));
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connectDB();

  const review = await Review.findById(params.id).lean();
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const status = action === "approve" ? "approved" : "rejected";
  await Review.findByIdAndUpdate(params.id, { status });

    return NextResponse.json({ message: `Review ${status}` });
  } catch (e) {
    console.error("agent review update error", e);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
