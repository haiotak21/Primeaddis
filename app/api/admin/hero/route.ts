import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import Hero from "@/models/Hero"

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    // Return the first hero doc if exists, else empty default
    const hero = await Hero.findOne().lean()
    return NextResponse.json({ data: hero || null })
  } catch (error) {
    console.error("GET /api/admin/hero error:", error)
    return NextResponse.json({ error: "Failed to fetch hero" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const slidesInput = Array.isArray(body.slides) ? body.slides : []

    // Sanitize slides: ensure image is a non-empty string and looks like an HTTP(S) URL or a site-relative path
    const slides = slidesInput
      .map((s: any) => ({
        image: typeof s.image === "string" ? s.image.trim() : "",
        title: typeof s.title === "string" ? s.title.trim() : "",
        subtitle: typeof s.subtitle === "string" ? s.subtitle.trim() : "",
        link: typeof s.link === "string" ? s.link.trim() : "",
      }))
      .filter((s: any) => {
        if (!s.image) return false
        // allow absolute http(s) or root-relative paths
        return /^https?:\/\//i.test(s.image) || /^\//.test(s.image)
      })

    if (slides.length === 0) {
      return NextResponse.json({ error: "At least one slide with a valid image URL is required" }, { status: 400 })
    }

    await connectDB()

    const updated = await Hero.findOneAndUpdate(
      {},
      { $set: { slides } },
      { upsert: true, new: true }
    )

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("PUT /api/admin/hero error:", error)
    return NextResponse.json({ error: "Failed to update hero" }, { status: 500 })
  }
}
