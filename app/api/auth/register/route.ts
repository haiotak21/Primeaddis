import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/database"
import User from "@/models/User"
import { sendMail } from "@/lib/mailer"
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

    // Send welcome email (fire-and-forget) — log failures for diagnostics
    ;(async () => {
      try {
        const subject = `Welcome to ${process.env.SITE_NAME || "PrimeAddis"}`
        const url = process.env.NEXTAUTH_URL || "http://localhost:3000"
        const html = `<p>Hi ${user.name || "there"},</p>
          <p>Welcome to ${process.env.SITE_NAME || "PrimeAddis"}! We're glad you joined.</p>
          <p>You can browse listings here: <a href="${url}/properties">Browse properties</a></p>
          <p>If you need help, reply to this email.</p>`
        await sendMail({ to: user.email, subject, html, from: process.env.SMTP_FROM })
      } catch (e) {
        console.error("Welcome email failed:", (e as any)?.message || e)
      }
    })()

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
