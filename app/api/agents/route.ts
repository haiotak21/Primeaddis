import { NextResponse } from "next/server"
import connectDB from "@/lib/database"
import User from "@/models/User"
import Property from "@/models/Property"

// Lists agents (and admins) that have properties, supports basic text search
export async function GET(req: Request) {
  try {
    await connectDB()

    let parsedUrl;
    try {
      parsedUrl = new URL(req.url);
    } catch (e) {
      const base = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
      parsedUrl = new URL(req.url, base);
    }
    const search = (parsedUrl.searchParams.get("search") || "").trim().toLowerCase()
    const limit = Number.parseInt(parsedUrl.searchParams.get("limit") || "20")

    // Find users with role agent or admin
    const roleQuery = { role: { $in: ["agent", "admin"] } }
    const textQuery: any = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {}

    // Limit initial user set
    const users = await User.find({ ...roleQuery, ...textQuery })
      .select("name email profileImage role")
      .limit(limit)
      .lean()

    if (users.length === 0) {
      return NextResponse.json({ agents: [] })
    }

    const ids = users.map((u) => u._id)

    // Count properties per user for quick signal
    const counts = await Property.aggregate([
      { $match: { listedBy: { $in: ids } } },
      { $group: { _id: "$listedBy", totalListings: { $sum: 1 } } },
    ])

    const countsMap = new Map<string, number>(counts.map((c: any) => [String(c._id), c.totalListings]))

    const agents = users
      .map((u: any) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        profileImage: u.profileImage,
        totalListings: countsMap.get(String(u._id)) || 0,
      }))
      .filter((a) => a.totalListings > 0)

    return NextResponse.json({ agents })
  } catch (error) {
    console.error("List agents error:", error)
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 })
  }
}
