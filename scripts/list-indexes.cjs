#!/usr/bin/env node
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const fs = require("fs");

// Load .env.local if present
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
}

let uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set in environment or .env.local");
  process.exit(2);
}
// Trim surrounding quotes if present (handles quoted values in .env.local)
uri = uri.trim().replace(/^"|"$/g, "");

async function run() {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    const parsed = (() => {
      try {
        return new URL(uri);
      } catch {
        return null;
      }
    })();
    const dbName = parsed ? parsed.pathname.replace("/", "") : "primeaddis";
    const db = client.db(dbName);
    const coll = db.collection("properties");
    const indexes = await coll.indexes();
    console.log("Indexes for collection properties:");
    console.log(JSON.stringify(indexes, null, 2));
  } catch (err) {
    console.error("Failed to list indexes:", err.message || err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
