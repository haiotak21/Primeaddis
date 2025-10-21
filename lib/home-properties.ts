// Ensure the referenced models are registered before populate
import Property from "@/models/Property";
import "@/models/User";
import { connectDB } from "@/lib/database";
import { serializeBson } from "@/lib/serialize";

export async function getHomeProperties(limit = 7) {
  await connectDB();
  // Only show active properties, sorted by newest
  const properties = await Property.find({ status: "active" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("listedBy", "name profileImage")
    .lean();
  return serializeBson(properties);
}
