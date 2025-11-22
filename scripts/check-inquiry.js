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
  const latest = await db
    .collection("inquiries")
    .find()
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();
  console.log("Latest inquiries:");
  console.log(JSON.stringify(latest, null, 2));
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
