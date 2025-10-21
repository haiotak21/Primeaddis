import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import User from "@/models/User";
import { requireRole } from "@/lib/middleware/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["superadmin"]);
    if (session instanceof NextResponse) return session;

    await connectDB();

    const { id } = await params;

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.role === "superadmin") {
      return NextResponse.json({ error: "Cannot delete superadmin" }, { status: 400 });
    }
    if ((user as any)._id.toString() === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
