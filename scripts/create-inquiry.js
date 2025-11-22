require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not set in .env.local");
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI, { dbName: undefined });
  const db = mongoose.connection.db;
  const prop = await db.collection("properties").findOne({});
  const inquiry = {
    propertyId: prop ? prop._id.toString() : null,
    propertyTitle: prop ? prop.title : "Manual test property",
    name: "Inserted Test User",
    email: "inserted-tester@example.com",
    phone: "+1999888777",
    message: "This inquiry was inserted directly for verification purposes.",
    responded: false,
    createdAt: new Date(),
  };
  const result = await db.collection("inquiries").insertOne(inquiry);
  console.log("Inserted inquiry id:", result.insertedId.toString());
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
