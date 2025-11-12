import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import User from "@/models/User"
import { requireAuth } from "@/lib/middleware/auth"

// DELETE remove from favorites
// Next.js 15: params is async for dynamic Route Handlers
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { id } = await params
    user.favorites = user.favorites.filter((fav) => fav.toString() !== id)
    await user.save()

    return NextResponse.json({ message: "Removed from favorites" })
  } catch (error) {
    console.error("Error removing from favorites:", error)
    return NextResponse.json({ error: "Failed to remove from favorites" }, { status: 500 })
  }
}
