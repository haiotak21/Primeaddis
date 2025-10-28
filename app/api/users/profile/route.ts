import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import User from "@/models/User"
import { requireAuth } from "@/lib/middleware/auth"

// GET user profile
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    await connectDB()

    const id = session.user.id
    let user = null as any
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(id)
    if (isValidObjectId) {
      user = await User.findById(id).select("-password").lean()
    }
    // Fallback by email (handles superadmin initial creation or legacy sessions)
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email }).select("-password").lean()
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

// PUT update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    const body = await req.json()

    await connectDB()

    const id = session.user.id
    const update = {
      name: body.name,
      phone: body.phone,
      profileImage: body.profileImage,
      lastLogin: new Date(),
    }

    let updatedUser = null as any
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(id)
    if (isValidObjectId) {
      updatedUser = await User.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
      }).select("-password")
    }
    // Fallback update by email (covers superadmin ephemeral id)
    if (!updatedUser && session.user.email) {
      updatedUser = await User.findOneAndUpdate(
        { email: session.user.email },
        update,
        { new: true, upsert: true, runValidators: true },
      ).select("-password")
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
