import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import User from "@/models/User"
import Property from "@/models/Property"
import Payment from "@/models/Payment"
import { requireRole } from "@/lib/middleware/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["admin", "superadmin"])
    if (session instanceof NextResponse) return session

    try {
      await connectDB()
    } catch (e) {
      // DB unavailable: return safe defaults so admin UI still loads
      return NextResponse.json({
        stats: {
          totalUsers: 0,
          totalAgents: 0,
          totalProperties: 0,
          activeProperties: 0,
          pendingProperties: 0,
          totalRevenue: 0,
        },
        recentPayments: [],
        dbUnavailable: true,
      })
    }

    const [
      totalUsers,
      totalAgents,
      totalProperties,
      activeProperties,
      pendingProperties,
      totalRevenue,
      recentPayments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ["agent", "admin", "superadmin"] } }),
      Property.countDocuments(),
      Property.countDocuments({ status: "active" }),
      Property.countDocuments({ status: "pending" }),
      Payment.aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Payment.find({ status: "completed" }).sort({ createdAt: -1 }).limit(10).populate("userId", "name email").lean(),
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalAgents,
        totalProperties,
        activeProperties,
        pendingProperties,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentPayments,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    // As a safeguard, return defaults instead of 500 to avoid breaking admin UI in dev
    return NextResponse.json(
      {
        stats: {
          totalUsers: 0,
          totalAgents: 0,
          totalProperties: 0,
          activeProperties: 0,
          pendingProperties: 0,
          totalRevenue: 0,
        },
        recentPayments: [],
        dbUnavailable: true,
      },
      { status: 200 },
    )
  }
}
