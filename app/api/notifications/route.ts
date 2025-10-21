import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import Notification from "@/models/Notification"
import { requireAuth } from "@/lib/middleware/auth"

// GET user notifications
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    try {
      await connectDB()
    } catch (e) {
      // DB unavailable: return empty notifications to avoid client error
      return NextResponse.json({ notifications: [], unreadCount: 0, dbUnavailable: true })
    }

    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const userId = session.user.id as string
    // If id isn't a valid ObjectId (e.g., superadmin fallback older session), return empty
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(userId)
    if (!isValidObjectId) {
      return NextResponse.json({ notifications: [], unreadCount: 0 })
    }

    const query: any = { userId }
    if (unreadOnly) query.read = false

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50).lean()

    const unreadCount = await Notification.countDocuments({ userId, read: false })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    // In dev/fallback mode, don't break the UI: return empty list instead of 500
    return NextResponse.json({ notifications: [], unreadCount: 0, dbUnavailable: true })
  }
}
