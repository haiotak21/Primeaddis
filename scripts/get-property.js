#!/usr/bin/env node
// Prints property info (status/title) by id
// Usage: node scripts/get-property.js <propertyId>

require("dotenv").config({ path: ".env.local" });
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error("Usage: node scripts/get-property.js <propertyId>");
    process.exit(1);
  }

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

    const doc = await props.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      console.log("Property not found");
      process.exit(0);
    }

    console.log("Property:");
    console.log("id:", doc._id.toString());
    console.log("title:", doc.title);
    console.log("status:", doc.status);
    console.log("listedBy:", doc.listedBy);
    console.log("createdAt:", doc.createdAt);
    console.log("price:", doc.price);
  } catch (err) {
    console.error("Error fetching property:", err);
  } finally {
    await client.close();
  }
}

main();
