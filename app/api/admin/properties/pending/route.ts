import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import Property from "@/models/Property"
import { requireRole } from "@/lib/middleware/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["admin", "superadmin"])
    if (session instanceof NextResponse) return session

    try {
      await connectDB()
    } catch (e) {
      // DB unavailable: degrade gracefully in dev so UI loads
      return NextResponse.json({ properties: [], dbUnavailable: true })
    }

    const properties = await Property.find({ status: "pending" })
      .populate("listedBy", "name email phone")
      .sort({ createdAt: -1 })
      .maxTimeMS(Number(process.env.MONGO_QUERY_MAX_TIME_MS || 1500))
      .lean()

    return NextResponse.json({ properties })
  } catch (error) {
    console.error("Error fetching pending properties:", error)
    const isDev = process.env.NODE_ENV !== "production"
    if (isDev) {
      return NextResponse.json({ properties: [], dbUnavailable: true })
    }
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}
