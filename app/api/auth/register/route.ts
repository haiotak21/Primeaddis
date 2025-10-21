import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/database"
import User from "@/models/User"
import { registerSchema } from "@/utils/validation"

export async function POST(req: NextRequest) {
  try {
  const body = await req.json()

    // Validate input
  const validatedData = registerSchema.parse(body)
  // Normalize email to lowercase for consistent queries and storage
  const email = (validatedData.email || "").toLowerCase()

    await connectDB()

    // Check if user already exists
  const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await User.create({
      name: validatedData.name,
      email,
      password: hashedPassword,
      phone: validatedData.phone,
      role: "user",
    })

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
