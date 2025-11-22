require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const fetch = global.fetch || require("node-fetch");

const MONGODB_URI = process.env.MONGODB_URI;
const SERVER_CANDIDATES = [
  process.env.TEST_SERVER_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not set in .env.local");
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI, { dbName: undefined });
  const db = mongoose.connection.db;
  const prop = await db.collection("properties").findOne({});
  if (!prop) {
    console.error("No property found in DB to send inquiry for.");
    process.exit(1);
  }
  console.log("Using property id:", prop._id.toString(), "title:", prop.title);

  const payload = {
    propertyId: prop._id.toString(),
    name: "Test User",
    email: "tester@example.com",
    phone: "+1234567890",
    message: "This is an automated test inquiry.",
  };

  let lastErr = null;
  for (const SERVER of SERVER_CANDIDATES) {
    try {
      console.log("Trying server:", SERVER);
      const res = await fetch(`${SERVER}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        timeout: 20000,
      });
      const text = await res.text();
      console.log("Response status:", res.status);
      console.log("Response body:", text);
      lastErr = null;
      break;
    } catch (err) {
      console.error(
        "Failed to POST to",
        SERVER,
        err && err.message ? err.message : err
      );
      lastErr = err;
    }
  }
  if (lastErr) {
    throw lastErr;
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
