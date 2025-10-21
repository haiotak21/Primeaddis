import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import User from "@/models/User"
import Property from "@/models/Property"
import Payment from "@/models/Payment"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await connectDB()

    // User stats
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const agents = await User.countDocuments({ role: "agent" })
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const newThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })

    // Property stats
    const totalProperties = await Property.countDocuments()
    const activeProperties = await Property.countDocuments({ status: "active" })
    const pendingProperties = await Property.countDocuments({ status: "pending" })
    const featuredProperties = await Property.countDocuments({ isFeatured: true })

    // Revenue stats
    const payments = await Payment.find()
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
    const thisMonthPayments = await Payment.find({ createdAt: { $gte: thirtyDaysAgo } })
    const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0)
    const averageTransaction = payments.length > 0 ? totalRevenue / payments.length : 0

    return NextResponse.json({
      userStats: {
        total: totalUsers,
        active: activeUsers,
        agents,
        newThisMonth,
      },
      propertyStats: {
        total: totalProperties,
        active: activeProperties,
        pending: pendingProperties,
        featured: featuredProperties,
      },
      revenueStats: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        average: averageTransaction,
      },
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
