import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import Property from "@/models/Property"
import Notification from "@/models/Notification"
import { requireRole } from "@/lib/middleware/auth"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["admin", "superadmin"])
    if (session instanceof NextResponse) return session

    await connectDB()

    const property = await Property.findByIdAndUpdate(params.id, { status: "active" }, { new: true })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Create notification for property owner
    await Notification.create({
      userId: property.listedBy,
      message: `Your property "${property.title}" has been approved and is now live!`,
      type: "approval",
      relatedId: property._id,
    })

    return NextResponse.json({ property })
  } catch (error) {
    console.error("Error approving property:", error)
    return NextResponse.json({ error: "Failed to approve property" }, { status: 500 })
  }
}
