import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import User from "@/models/User"
import Property from "@/models/Property"
import { requireAuth } from "@/lib/middleware/auth"

// GET user favorites
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    await connectDB()

    const user = await User.findById(session.user.id).populate({
      path: "favorites",
      populate: { path: "listedBy", select: "name email profileImage" },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ favorites: user.favorites })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}

// POST add to favorites
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    const { propertyId } = await req.json()

    await connectDB()

    const property = await Property.findById(propertyId)
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.favorites.includes(propertyId)) {
      return NextResponse.json({ error: "Property already in favorites" }, { status: 400 })
    }

    user.favorites.push(propertyId)
    await user.save()

    return NextResponse.json({ message: "Added to favorites" })
  } catch (error) {
    console.error("Error adding to favorites:", error)
    return NextResponse.json({ error: "Failed to add to favorites" }, { status: 500 })
  }
}
