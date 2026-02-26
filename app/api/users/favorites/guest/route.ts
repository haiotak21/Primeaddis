import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import User from "@/models/User"
import Property from "../../../models/Property"
import Notification from "@/models/Notification"
import { sendMail } from "@/lib/mailer"
import Favorite from "@/models/Favorite"

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone, propertyId } = await req.json()

    if (!email || !propertyId) {
      return NextResponse.json({ error: "Email and propertyId are required" }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    await connectDB()

  const property = await Property.findById(propertyId).lean()
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 })

  let user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        name: name?.toString()?.trim() || normalizedEmail.split("@")[0],
        phone: phone?.toString()?.trim() || undefined,
        role: "user",
        isActive: true,
        favorites: [property._id],
      } as any)
    } else {
      // Update optional fields if provided
      if (name && !user.name) user.name = name
      if (phone && !user.phone) user.phone = phone
  const exists = (user.favorites || []).some((f) => f.toString() === String(property._id))
  if (!exists) user.favorites.push(propertyId)
      await user.save()
    }

    // Basic rate limiting: max 30 favorite creations in 10 minutes per user
    try {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000)
      const recentCount = await Favorite.countDocuments({ userId: user._id, createdAt: { $gte: tenMinsAgo } })
      if (recentCount >= 30) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
      }
    } catch {}

    // Upsert Favorite document (captures timestamp)
    try {
      await Favorite.updateOne(
        { userId: user._id, propertyId: property._id },
        { $setOnInsert: { userId: user._id, propertyId: property._id } },
        { upsert: true },
      )
    } catch {}

    // Notify admins
    ;(async () => {
      try {
        const admins = await User.find({ role: { $in: ["admin", "superadmin"] } }).select("_id email").lean()
        if (admins?.length) {
          await Notification.insertMany(
            admins.map((a: any) => ({
              userId: a._id,
              type: "favorite" as const,
              message: `${normalizedEmail} saved ${property.title} to favorites`,
              relatedId: property._id,
            })),
          )
        }
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPERADMIN_EMAIL
        if (adminEmail) {
          const url = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/properties/${property._id}`
          await sendMail({
            to: adminEmail,
            subject: `New favorite saved: ${property.title}`,
            html: `<p><b>${normalizedEmail}</b> added <a href="${url}">${property.title}</a> to favorites.</p>`,
          })
        }
      } catch (e) {
        console.warn("guest favorite notify failed", (e as any)?.message || e)
      }
    })()

    return NextResponse.json({ message: "Added to favorites" })
  } catch (error) {
    console.error("Error saving guest favorite:", error)
    return NextResponse.json({ error: "Failed to save favorite" }, { status: 500 })
  }
}
