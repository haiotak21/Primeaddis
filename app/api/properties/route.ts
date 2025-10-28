import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import Property from "@/models/Property"
import { requireAuth } from "@/lib/middleware/auth"
import { propertySchema } from "@/utils/validation"
import SavedSearch from "@/models/SavedSearch"
import Notification from "@/models/Notification"
import User from "@/models/User"
import { sendMail } from "@/lib/mailer"

// GET all properties with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const type = searchParams.get("type")
    const listingType = searchParams.get("listingType")
    const city = searchParams.get("city")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const bedrooms = searchParams.get("bedrooms")
    const status = searchParams.get("status") || "active"

    const query: any = { status }

    // Ethiopia bounds (lat/lng)
    const ETH_BOUNDS = {
      minLat: 3.4,
      maxLat: 14.9,
      minLng: 32.9,
      maxLng: 48.0,
    }
    // Always restrict results to Ethiopia
    query["location.coordinates.lat"] = { $gte: ETH_BOUNDS.minLat, $lte: ETH_BOUNDS.maxLat }
    query["location.coordinates.lng"] = { $gte: ETH_BOUNDS.minLng, $lte: ETH_BOUNDS.maxLng }

    if (type) query.type = type
    if (listingType) query.listingType = listingType
    if (city) query["location.city"] = new RegExp(city, "i")
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number.parseInt(minPrice)
      if (maxPrice) query.price.$lte = Number.parseInt(maxPrice)
    }
    if (bedrooms) query["specifications.bedrooms"] = { $gte: Number.parseInt(bedrooms) }

    const skip = (page - 1) * limit

    const queryMax = Number(process.env.MONGO_QUERY_MAX_TIME_MS || 1500)
    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate("listedBy", "name email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .maxTimeMS(queryMax)
        .lean(),
      Property.countDocuments(query).maxTimeMS(queryMax),
    ])

    const res = NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
    res.headers.set("Cache-Control", "public, max-age=30, s-maxage=60")
    return res
  } catch (error) {
    console.error("Error fetching properties:", error)
    const msg = (error as any)?.message || "DB unavailable"
    // In dev, if DB is down, return empty results with a warning to avoid breaking the page
    const isDev = process.env.NODE_ENV !== "production"
    if (isDev) {
      return NextResponse.json({
        properties: [],
        pagination: { page: 1, limit: 12, total: 0, pages: 0 },
        warning: `properties endpoint degraded: ${msg}`,
      })
    }
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}

// POST create new property
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    const body = await req.json()

    // Validate input
    const validatedData = propertySchema.parse(body)

    // Enforce Ethiopia bounds for created properties (same as GET filtering)
    const ETH_BOUNDS = {
      minLat: 3.4,
      maxLat: 14.9,
      minLng: 32.9,
      maxLng: 48.0,
    }
    const { lat, lng } = validatedData.location.coordinates
    if (
      !(lat >= ETH_BOUNDS.minLat && lat <= ETH_BOUNDS.maxLat && lng >= ETH_BOUNDS.minLng && lng <= ETH_BOUNDS.maxLng)
    ) {
      return NextResponse.json(
        {
          error:
            "Coordinates must be within Ethiopia. Latitude 3.4 to 14.9, Longitude 32.9 to 48.0.",
          details: [
            { path: ["location", "coordinates", "lat"], message: `lat ${lat} out of bounds` },
            { path: ["location", "coordinates", "lng"], message: `lng ${lng} out of bounds` },
          ],
        },
        { status: 400 },
      )
    }

    await connectDB()

    // Check if user is agent or admin
    if (!["agent", "admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Only agents can create properties" }, { status: 403 })
    }

    const property = await Property.create({
      ...validatedData,
      listedBy: session.user.id,
      status: session.user.role === "agent" ? "pending" : "active",
    })

    // Fire and forget: send instant alerts to matching saved searches when listing is active
    ;(async () => {
      try {
        if ((property as any)?.status !== "active") return

        const doc = await Property.findById(property._id).lean()
        if (!doc) return

        const searches = await SavedSearch.find({ alertEnabled: true, alertFrequency: "instant" }).lean()

        const matchesCriteria = (criteria: Record<string, any>, p: any) => {
          if (!criteria) return true
          if (criteria.type && criteria.type !== "allTypes" && criteria.type !== p.type) return false
          if (criteria.listingType && criteria.listingType !== "allListings" && criteria.listingType !== p.listingType) return false
          if (criteria.city) {
            const city = p?.location?.city || ""
            if (!new RegExp(criteria.city, "i").test(city)) return false
          }
          if (criteria.minPrice && typeof p.price === "number" && p.price < Number(criteria.minPrice)) return false
          if (criteria.maxPrice && typeof p.price === "number" && p.price > Number(criteria.maxPrice)) return false
          if (criteria.bedrooms && criteria.bedrooms !== "any") {
            const beds = p?.specifications?.bedrooms ?? 0
            if (beds < Number(criteria.bedrooms)) return false
          }
          return true
        }

        const matched = searches.filter((s: any) => matchesCriteria(s.criteria || {}, doc))
        if (!matched.length) return

        // Fetch user emails for matched searches
        const userIds = matched.map((s: any) => s.user)
        const users = await User.find({ _id: { $in: userIds } }).lean()
        const userMap = Object.fromEntries(users.map((u: any) => [u._id.toString(), u]))

        const notifications = matched.map((s: any) => ({
          userId: s.user,
          message: `New ${doc.type || "property"} ${doc.listingType === "rent" ? "for rent" : "for sale"} in ${doc?.location?.city || "your area"} at ${doc.price}`,
          type: "new_listing" as const,
          relatedId: doc._id,
        }))
        await Notification.insertMany(notifications)

        // Send emails (fire and forget)
        for (const s of matched) {
          const user = userMap[s.user.toString?.() || s.user]
          if (!user?.email) continue
          const subject = `New property matches your saved search: ${doc.title}`
          const url = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/properties/${doc._id}`
          const html = `<p>Hello${user.name ? ` ${user.name}` : ""},</p>
            <p>A new property matches your saved search <b>${s.name}</b>:</p>
            <ul>
              <li><b>${doc.title}</b> - ${doc.type}, ${doc.listingType}, ${doc.location?.city || ""}</li>
              <li>Price: ${doc.price}</li>
            </ul>
            <p><a href="${url}">View property</a></p>
            <p>You are receiving this because you enabled alerts for this search.</p>`
          sendMail({ to: user.email, subject, html }).catch(() => {})
        }
      } catch (e) {
        console.warn("saved-search alert dispatch failed", (e as any)?.message || e)
      }
    })()

    return NextResponse.json({ property }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating property:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}
