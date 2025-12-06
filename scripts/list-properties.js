#!/usr/bin/env node
// Lists recent properties to help locate a property id
// Usage: node scripts/list-properties.js [limit]

require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function main() {
  const limit = Number(process.argv[2]) || 20;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI missing in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const props = db.collection("properties");

    const docs = await props
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .project({ title: 1, status: 1, listedBy: 1, createdAt: 1 })
      .toArray();
    if (!docs || docs.length === 0) {
      console.log("No properties found");
      return;
    }

    console.log(`Showing ${docs.length} recent properties:`);
    docs.forEach((d, i) => {
      console.log(
        `${i + 1}. id: ${d._id.toString()} | title: ${
          d.title || "(no title)"
        } | status: ${d.status || "(none)"} | listedBy: ${
          d.listedBy || "(unknown)"
        } | createdAt: ${d.createdAt}`
      );
    });
  } catch (err) {
    console.error("Error listing properties:", err);
  } finally {
    await client.close();
  }
}

main();
