import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import Property from "@/models/Property"
import Notification from "@/models/Notification"
import { requireRole } from "@/lib/middleware/auth"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["admin", "superadmin"])
    if (session instanceof NextResponse) return session

    const { reason } = await req.json()

    await connectDB()

    const property = await Property.findByIdAndUpdate(params.id, { status: "draft" }, { new: true })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Create notification for property owner
    await Notification.create({
      userId: property.listedBy,
      message: `Your property "${property.title}" was rejected. Reason: ${reason || "Does not meet guidelines"}`,
      type: "approval",
      relatedId: property._id,
    })

    return NextResponse.json({ property })
  } catch (error) {
    console.error("Error rejecting property:", error)
    return NextResponse.json({ error: "Failed to reject property" }, { status: 500 })
  }
}
