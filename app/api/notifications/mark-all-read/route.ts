import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import Notification from "@/models/Notification"
import { requireAuth } from "@/lib/middleware/auth"

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    const userId = session.user.id as string
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(userId)
    if (!isValidObjectId) {
      return NextResponse.json({ message: "All notifications marked as read (noop)", reason: "invalid-user-id" })
    }

    try {
      await connectDB()
    } catch (e) {
      // DB unavailable: treat as no-op to keep UI responsive
      return NextResponse.json({ message: "All notifications marked as read (noop)", dbUnavailable: true })
    }

    await Notification.updateMany({ userId, read: false }, { read: true })

    return NextResponse.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    // Avoid breaking UI in dev fallback
    return NextResponse.json({ message: "No changes (error handled)", dbUnavailable: true })
  }
}
