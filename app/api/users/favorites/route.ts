import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import User from "@/models/User"
import Property from "@/models/Property"
import Favorite from "@/models/Favorite"
import Notification from "@/models/Notification"
import { sendMail } from "@/lib/mailer"
import { requireAuth } from "@/lib/middleware/auth"

// GET user favorites
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    try {
      await connectDB()
    } catch (e) {
      // DB unavailable: degrade gracefully in dev so UI loads
      return NextResponse.json({ favorites: [], dbUnavailable: true })
    }

    const userId = session.user.id as string
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(userId)
    if (!isValidObjectId) {
      // Invalid id in session (e.g., dev fallback sessions) -> return empty list
      return NextResponse.json({ favorites: [] })
    }

    const user = await User.findById(userId)
      .maxTimeMS(Number(process.env.MONGO_QUERY_MAX_TIME_MS || 1500))
      .populate({
        path: "favorites",
        populate: { path: "listedBy", select: "name email profileImage" },
      })
      .lean()

    if (!user) {
      const isDev = process.env.NODE_ENV !== "production"
      if (isDev) return NextResponse.json({ favorites: [] })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ favorites: (user as any).favorites || [] })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    // In dev/fallback, don't break the UI
    const isDev = process.env.NODE_ENV !== "production"
    if (isDev) return NextResponse.json({ favorites: [], dbUnavailable: true })
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}

// POST add to favorites
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    const { propertyId } = await req.json()

    await connectDB()

    const property = await Property.findById(propertyId)
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Upsert Favorite document (captures timestamp)
    try {
      await Favorite.updateOne(
        { userId: user._id, propertyId },
        { $setOnInsert: { userId: user._id, propertyId } },
        { upsert: true },
      )
    } catch (e) {
      // ignore duplicate key race
    }

    if (!user.favorites.includes(propertyId)) {
      user.favorites.push(propertyId)
      await user.save()
    }

    // Notify admins about the new favorite (fire-and-forget)
    ;(async () => {
      try {
        const admins = await User.find({ role: { $in: ["admin", "superadmin"] } })
          .select("_id email")
          .lean()
        if (admins?.length) {
          const notifications = admins.map((a: any) => ({
            userId: a._id,
            type: "favorite" as const,
            message: `${user.email || user.name || "A user"} saved ${property.title} to favorites`,
            relatedId: property._id,
          }))
          try {
            await Notification.insertMany(notifications)
          } catch (err: any) {
            // Fallback for deployments running an older Notification schema without 'favorite' enum
            const msg = String(err?.message || "")
            const isEnumError =
              err?.name === "ValidationError" || msg.includes("is not a valid enum value for path `type`")
            if (isEnumError) {
              const fallback = notifications.map((n) => ({ ...n, type: "system" as const }))
              await Notification.insertMany(fallback)
            } else {
              throw err
            }
          }
        }

        const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPERADMIN_EMAIL
        const canEmail =
          process.env.NODE_ENV === "production" &&
          !!process.env.SMTP_HOST &&
          !!process.env.SMTP_USER &&
          !!process.env.SMTP_PASS &&
          !!adminEmail
        if (canEmail) {
          const url = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/properties/${property._id}`
          // Fire-and-forget; suppress transport errors in non-critical path
          sendMail({
            to: adminEmail as string,
            subject: `New favorite saved: ${property.title}`,
            html: `<p>User <b>${user.email || user.name || "Unknown"}</b> added <a href="${url}">${property.title}</a> to favorites.</p>`,
          }).catch(() => {})
        }
      } catch (e) {
        // Avoid noisy logs in dev when SMTP is not configured
      }
    })()

  return NextResponse.json({ message: "Added to favorites" })
  } catch (error) {
    console.error("Error adding to favorites:", error)
    return NextResponse.json({ error: "Failed to add to favorites" }, { status: 500 })
  }
}
