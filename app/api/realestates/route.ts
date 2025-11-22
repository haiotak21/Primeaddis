import { NextResponse } from "next/server"
import connectDB from "@/lib/database"
import RealEstate from "@/models/RealEstate"

// List all real estate agencies/companies
export async function GET(req: Request) {
  try {
    await connectDB()
    let parsedUrl;
    try {
      parsedUrl = new URL(req.url);
    } catch (e) {
      const base = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
      parsedUrl = new URL(req.url, base);
    }
    const { searchParams } = parsedUrl
    const search = (searchParams.get("search") || "").trim().toLowerCase()
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const query: any = search ? { name: { $regex: search, $options: "i" } } : {}

    // Ensure a few default agencies exist (idempotent upsert)
    const defaults = [
      "Janoboro Real Estate",
      "Abyssinia Real Estate",
      "Habesh Real Estate",
    ]
    try {
      await RealEstate.bulkWrite(
        defaults.map((name) => ({
          updateOne: {
            filter: { name },
            update: { $setOnInsert: { name } },
            upsert: true,
          },
        })),
        { ordered: false }
      )
    } catch (e) {
      // Ignore duplicate key errors or bulk write conflicts
    }

    // Migrate any older seed names to the new format; if both old and new exist, remove the old to avoid duplicates
    const renamePairs: Array<[string, string]> = [
      ["janoboro realstate", "Janoboro Real Estate"],
      ["abyssinia realstate", "Abyssinia Real Estate"],
      ["habesh realstate", "Habesh Real Estate"],
    ]
    for (const [oldName, newName] of renamePairs) {
      try {
        const oldDoc = await RealEstate.findOne({ name: oldName }).select("_id").lean()
        if (!oldDoc) continue
        const newDoc = await RealEstate.findOne({ name: newName }).select("_id").lean()
        if (newDoc) {
          await RealEstate.deleteOne({ _id: oldDoc._id })
        } else {
          await RealEstate.updateOne({ _id: oldDoc._id }, { $set: { name: newName } })
        }
      } catch {}
    }
    const realEstates = await RealEstate.find(query).limit(limit).lean()
    return NextResponse.json({ realEstates })
  } catch (error) {
    console.error("List real estates error:", error)
    return NextResponse.json({ error: "Failed to fetch real estates" }, { status: 500 })
  }
}

// Create a real estate agency/company
export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const name = String(body?.name || "").trim()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    const doc = await RealEstate.create({
      name,
      logo: body?.logo || undefined,
      description: body?.description || undefined,
      website: body?.website || undefined,
    })
    return NextResponse.json({ realEstate: doc }, { status: 201 })
  } catch (error: any) {
    const msg = error?.code === 11000 ? "Real estate already exists" : "Failed to create real estate"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
