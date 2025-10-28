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

    try {
      await connectDB()
    } catch (e) {
      // DB unavailable: degrade gracefully in dev so UI loads
      return NextResponse.json({ favorites: [], dbUnavailable: true })
    }

    const userId = session.user.id as string
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(userId)
    if (!isValidObjectId) {
      // Invalid id in session (e.g., dev fallback sessions) -> return empty list
      return NextResponse.json({ favorites: [] })
    }

    const user = await User.findById(userId)
      .maxTimeMS(Number(process.env.MONGO_QUERY_MAX_TIME_MS || 1500))
      .populate({
        path: "favorites",
        populate: { path: "listedBy", select: "name email profileImage" },
      })
      .lean()

    if (!user) {
      const isDev = process.env.NODE_ENV !== "production"
      if (isDev) return NextResponse.json({ favorites: [] })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ favorites: (user as any).favorites || [] })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    // In dev/fallback, don't break the UI
    const isDev = process.env.NODE_ENV !== "production"
    if (isDev) return NextResponse.json({ favorites: [], dbUnavailable: true })
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
