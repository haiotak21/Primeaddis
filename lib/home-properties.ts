// Ensure the referenced models are registered before populate
import Property from "../models/Property";
import "@/models/User";
import { connectDB } from "@/lib/database";
import { serializeBson } from "@/lib/serialize";

export async function getHomeProperties(limit = 7) {
  try {
    await connectDB();
  } catch (e) {
    console.warn("Home properties: DB unavailable, showing empty list");
    return [];
  }
  // Show currently featured (non-expired) first, then newest active
  const now = new Date()
  // Featured properties should be shown on the home page regardless of
  // their current `status` (so sold/rented featured listings don't disappear).
  const featuredQuery = {
    featured: true,
    $or: [{ featuredUntil: { $exists: false } }, { featuredUntil: { $gte: now } }],
  }
  // Regular (non-featured) items must still be active
  const regularQuery = { status: "active", $or: [{ featured: false }, { featured: { $exists: false } }] }

  const [featured, regular] = await Promise.all([
    Property.find(featuredQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("listedBy", "name profileImage")
      .lean(),
    Property.find(regularQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("listedBy", "name profileImage")
      .lean(),
  ])

  const combined = [...featured, ...regular].slice(0, limit)
  const properties = combined
  return serializeBson(properties);
}

export async function getFeaturedHomeProperties(limit = 12) {
  try {
    await connectDB();
  } catch (e) {
    console.warn("Featured home properties: DB unavailable, showing empty list");
    return [];
  }

  const now = new Date();
  // Include featured properties even if they are sold/rented so the
  // featured carousel on the home page remains consistent.
  const featuredQuery = {
    featured: true,
    $or: [{ featuredUntil: { $exists: false } }, { featuredUntil: { $gte: now } }],
  };

  const featured = await Property.find(featuredQuery)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("listedBy", "name profileImage")
    .lean();

  return serializeBson(featured);
}

export async function getNewHomeProperties(limit = 10) {
  try {
    await connectDB();
  } catch (e) {
    console.warn("New home properties: DB unavailable, showing empty list");
    return [];
  }

  // Latest active properties without any date window limit
  const latest = await Property.find({ status: "active" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("listedBy", "name profileImage")
    .lean();

  return serializeBson(latest);
}
