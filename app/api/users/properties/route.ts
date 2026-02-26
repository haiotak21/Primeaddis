import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import Property from "../../../models/Property"
import { requireAuth } from "@/lib/middleware/auth"

// GET user's properties
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    await connectDB()

    const properties = await Property.find({ listedBy: session.user.id }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ properties })
  } catch (error) {
    console.error("Error fetching user properties:", error)
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}
