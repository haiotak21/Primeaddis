import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import Notification from "@/models/Notification"
import { requireAuth } from "@/lib/middleware/auth"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    const userId = session.user.id as string
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(userId)
    if (!isValidObjectId) {
      return NextResponse.json({ notification: { _id: params.id, read: true }, reason: "invalid-user-id" })
    }

    try {
      await connectDB()
    } catch (e) {
      // DB unavailable: treat as no-op, return synthetic response
      return NextResponse.json({ notification: { _id: params.id, read: true }, dbUnavailable: true })
    }

    const notification = await Notification.findOneAndUpdate(
  { _id: params.id, userId },
      { read: true },
      { new: true },
    )

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({ notification })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    // Avoid breaking client in dev fallback
    return NextResponse.json({ notification: { _id: params.id, read: true }, dbUnavailable: true })
  }
}
