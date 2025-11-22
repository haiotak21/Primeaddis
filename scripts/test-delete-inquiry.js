require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const fetch = global.fetch || require("node-fetch");

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not set in .env.local");
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI, { dbName: undefined });
  const db = mongoose.connection.db;
  const doc = await db
    .collection("inquiries")
    .findOne({}, { sort: { createdAt: -1 } });
  if (!doc) {
    console.error("No inquiry found to delete");
    process.exit(1);
  }
  console.log("Will attempt DELETE for id", doc._id.toString());
  // Try both ports
  const servers = ["http://localhost:3000", "http://localhost:3001"];
  for (const s of servers) {
    try {
      const res = await fetch(
        `${s}/api/admin/inquiries/${doc._id.toString()}`,
        { method: "DELETE" }
      );
      console.log("Tried", s, "status", res.status);
      const txt = await res.text();
      console.log("Response:", txt);
    } catch (e) {
      console.error("Failed to call", s, e.message || e);
    }
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
