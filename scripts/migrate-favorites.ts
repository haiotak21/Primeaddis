import mongoose from "mongoose";
import User from "../models/User";
import Favorite from "../models/Favorite";
import connectDB from "../lib/database";

async function run() {
  await connectDB();
  const users = await User.find({ favorites: { $exists: true, $ne: [] } }).select("_id favorites").lean();
  let inserted = 0;
  for (const u of users as any[]) {
    for (const propId of (u.favorites || [])) {
      try {
        await Favorite.updateOne(
          { userId: u._id, propertyId: propId },
          { $setOnInsert: { userId: u._id, propertyId: propId } },
          { upsert: true },
        );
        inserted++;
      } catch {}
    }
  }
  console.log(`Backfill complete: ensured Favorite docs for ${inserted} entries`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
