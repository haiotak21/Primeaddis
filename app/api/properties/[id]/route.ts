import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import Property from "@/models/Property"
import { requireAuth } from "@/lib/middleware/auth"

function isValidObjectId(id: string) {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)
}

// GET single property
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }
    await connectDB()

    const property = await Property.findById(id).populate("listedBy", "name email phone profileImage").lean()

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Increment views
    await Property.findByIdAndUpdate(id, { $inc: { views: 1 } })

    return NextResponse.json({ property })
  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 })
  }
}

// PUT update property
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    const body = await req.json()

    const { id } = await params
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    await connectDB()

    const property = await Property.findById(id)

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Check ownership or admin
    const isOwner = property.listedBy.toString() === session.user.id
    const isAdmin = ["admin", "superadmin"].includes(session.user.role)

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "You do not have permission to edit this property." }, { status: 403 })
    }

    const updatedProperty = await Property.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    return NextResponse.json({ property: updatedProperty })
  } catch (error) {
    console.error("Error updating property:", error)
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 })
  }
}

// DELETE property
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    const { id } = await params
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    await connectDB()

    const property = await Property.findById(id)

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Check ownership or admin
    const isOwner = property.listedBy.toString() === session.user.id
    const isAdmin = ["admin", "superadmin"].includes(session.user.role)

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "You do not have permission to delete this property." }, { status: 403 })
    }

    await Property.findByIdAndDelete(id)

    return NextResponse.json({ message: "Property deleted successfully" })
  } catch (error) {
    console.error("Error deleting property:", error)
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 })
  }
}
