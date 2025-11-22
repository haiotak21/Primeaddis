import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import connectDB from "@/lib/database";
import Inquiry from "@/models/Inquiry";

export async function DELETE(req: NextRequest, { params }: { params: Record<string, string> }) {
  const session = await requireRole(["admin", "superadmin"]);
  if (session instanceof NextResponse) return session;
  try {
    await connectDB();
    const id = params?.id as string;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await Inquiry.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Record<string, string> }) {
  const session = await requireRole(["admin", "superadmin"]);
  if (session instanceof NextResponse) return session;
  try {
    await connectDB();
    const id = params?.id as string;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const body = await req.json();
    const updates: any = {};
    if (typeof body.responded === "boolean") updates.responded = body.responded;
    await Inquiry.findByIdAndUpdate(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}
