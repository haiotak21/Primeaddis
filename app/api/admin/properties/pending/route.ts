import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import Property from "@/models/Property"
import { requireRole } from "@/lib/middleware/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["admin", "superadmin"])
    if (session instanceof NextResponse) return session

    await connectDB()

    const properties = await Property.find({ status: "pending" })
      .populate("listedBy", "name email phone")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ properties })
  } catch (error) {
    console.error("Error fetching pending properties:", error)
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}
