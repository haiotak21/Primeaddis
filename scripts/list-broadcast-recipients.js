#!/usr/bin/env node
// Lists users who would receive new-property broadcast emails
// Usage: node scripts/list-broadcast-recipients.js

require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI missing in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const dbName =
      process.env.MONGODB_DB ||
      (() => {
        // Try to parse DB from the connection string
        const m = uri.match(/\/(.*?)\?/);
        return m ? m[1] : "primeaddis";
      })();

    const db = client.db();
    const users = db.collection("users");

    const query = { role: "user", isActive: true, marketingOptIn: true };
    const count = await users.countDocuments(query);
    console.log(`Recipients count: ${count}`);

    const sample = await users
      .find(query)
      .project({ email: 1, name: 1 })
      .limit(100)
      .toArray();
    console.log("Sample recipients (up to 100):");
    sample.forEach((u, i) =>
      console.log(`${i + 1}. ${u.email}${u.name ? ` - ${u.name}` : ""}`)
    );
  } catch (err) {
    console.error("Error listing recipients:", err);
  } finally {
    await client.close();
  }
}

main();
