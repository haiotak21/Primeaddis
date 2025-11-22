#!/usr/bin/env node
const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");

// Load .env.local if present so the script can read MONGODB_URI automatically
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
}

function toSlug(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function run() {
  let MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/primeaddis";
  // Trim surrounding quotes if present
  MONGODB_URI = String(MONGODB_URI).trim().replace(/^"|"$/g, "");
  console.log("Connecting to MongoDB at", MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message || err);
    process.exit(1);
  }

  const coll = mongoose.connection.collection("properties");
  console.log("Scanning properties collection for missing slugs...");

  const cursor = coll.find(
    {},
    { projection: { title: 1, location: 1, slug: 1 } }
  );
  let updated = 0;
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    try {
      if (doc.slug && String(doc.slug).trim().length > 0) continue;
      const title = doc.title || "";
      const city = (doc.location && doc.location.city) || "";
      const region = (doc.location && doc.location.region) || "";
      const base = toSlug(`${title} ${city} ${region}`);
      let slug = base || String(doc._id);

      // Ensure uniqueness: if conflict, append short id suffix
      const conflict = await coll.findOne({ slug });
      if (conflict && String(conflict._id) !== String(doc._id)) {
        slug = `${base}-${String(doc._id).slice(-6)}`;
      }

      await coll.updateOne({ _id: doc._id }, { $set: { slug } });
      updated++;
      if (updated % 100 === 0) console.log(`Updated ${updated} properties...`);
    } catch (err) {
      console.error("Failed to update document", doc._id, err.message || err);
    }
  }

  console.log(`Done. Updated ${updated} properties.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
