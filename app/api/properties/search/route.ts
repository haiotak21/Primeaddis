import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
<<<<<<< HEAD
import Property from "../../../../models/Property"
=======
import Property from "../../../models/Property"
>>>>>>> 8a5255dad9d7d8475daa8dee58d14ba6f4cd2054

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    let parsedUrl;
    try {
      parsedUrl = new URL(req.url);
    } catch (e) {
      const base = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
      parsedUrl = new URL(req.url, base);
    }
    const query = parsedUrl.searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    // Ethiopia bounds (lat/lng)
    const ETH = { minLat: 3.4, maxLat: 14.9, minLng: 32.9, maxLng: 48.0 }

    const properties = await Property.find({
      status: "active",
      "location.coordinates.lat": { $gte: ETH.minLat, $lte: ETH.maxLat },
      "location.coordinates.lng": { $gte: ETH.minLng, $lte: ETH.maxLng },
      $or: [
        { title: new RegExp(query, "i") },
        { description: new RegExp(query, "i") },
        { "location.city": new RegExp(query, "i") },
        { "location.region": new RegExp(query, "i") },
      ],
    })
      .populate("listedBy", "name email profileImage")
      .limit(20)
      .lean()

    return NextResponse.json({ properties })
  } catch (error) {
    console.error("Error searching properties:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
