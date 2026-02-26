#!/usr/bin/env ts-node
import { connectDB } from "../lib/database"
import Property from "@/models/Property"
import { toSlug } from "../lib/slugify"

async function run() {
  console.log("Connecting to database...")
  await connectDB()
  console.log("Scanning properties for missing slugs...")

  const cursor = Property.find({}).cursor()
  let updated = 0
  for await (const doc of cursor) {
    const anyDoc: any = doc
    if (anyDoc.slug && String(anyDoc.slug).trim().length > 0) continue

    const base = toSlug(`${anyDoc.title} ${anyDoc.location?.city || ""} ${anyDoc.location?.region || ""}`)
    let slug = base || String(anyDoc._id)

    // Ensure uniqueness: if conflict, append short id suffix
    const conflict = await Property.findOne({ slug })
    if (conflict) {
      slug = `${base}-${String(anyDoc._id).slice(-6)}`
    }

    anyDoc.slug = slug
    try {
      await anyDoc.save()
      updated++
      if (updated % 100 === 0) console.log(`Updated ${updated} properties...`)
    } catch (err: any) {
      console.error(`Failed to update ${anyDoc._id}:`, err?.message || err)
    }
  }

  console.log(`Done. Updated ${updated} properties.`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
