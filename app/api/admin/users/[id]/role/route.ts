import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import User from "@/models/User"
import { requireRole } from "@/lib/middleware/auth"
import bcrypt from "bcryptjs"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["superadmin"])
    if (session instanceof NextResponse) return session

    const { role, password } = await req.json()

    if (!["user", "agent", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // When promoting to admin or agent, require a password so they can sign in directly
    if ((role === "admin" || role === "agent") && (!password || String(password).length < 8)) {
      return NextResponse.json({ error: "Password (min 8 chars) is required when setting role to admin/agent" }, { status: 400 })
    }

  await connectDB()

  const { id } = await params
  const userDoc = await User.findById(id).select("+password")
    
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    userDoc.role = role
    if (role === "admin" || role === "agent") {
      const hash = await bcrypt.hash(String(password), 10)
      ;(userDoc as any).password = hash
      userDoc.isActive = true
    }
    await userDoc.save()

    const user = await User.findById(id).select("-password")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
  }
}
