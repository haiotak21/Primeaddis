import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

async function main() {
  const { default: User } = await import("../models/User");
  const { default: Property } = await import("../models/Property");
  const { default: Favorite } = await import("../models/Favorite");

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  try {
    // Seed users
    const createdUsers = await User.insertMany([
      { email: "a@example.com", name: "A", role: "user", isActive: true },
      { email: "b@example.com", name: "B", role: "user", isActive: true },
      { email: "c@example.com", name: "C", role: "user", isActive: true },
    ] as any);
    const u1 = createdUsers[0];
    const u2 = createdUsers[1];
    const u3 = createdUsers[2];
    // Seed properties
    const createdProps = await Property.insertMany([
      { title: "P1", description: "Test description 1", price: 1, type: "house", location: { address: "a", city: "x", region: "r", coordinates: { lat: 8, lng: 38 } }, specifications: { area: 1 }, amenities: ["amenity"], images: ["i"], listedBy: u1._id, realEstate: new mongoose.Types.ObjectId(), listingType: "sale" },
      { title: "P2", description: "Test description 2", price: 1, type: "house", location: { address: "a", city: "x", region: "r", coordinates: { lat: 8, lng: 38 } }, specifications: { area: 1 }, amenities: ["amenity"], images: ["i"], listedBy: u1._id, realEstate: new mongoose.Types.ObjectId(), listingType: "sale" },
      { title: "P3", description: "Test description 3", price: 1, type: "house", location: { address: "a", city: "x", region: "r", coordinates: { lat: 8, lng: 38 } }, specifications: { area: 1 }, amenities: ["amenity"], images: ["i"], listedBy: u1._id, realEstate: new mongoose.Types.ObjectId(), listingType: "sale" },
    ] as any);
    const p1 = createdProps[0];
    const p2 = createdProps[1];
    const p3 = createdProps[2];

    // Seed favorites
    await Favorite.create([
      { userId: u1._id, propertyId: p1._id },
      { userId: u2._id, propertyId: p1._id },
      { userId: u3._id, propertyId: p2._id },
    ] as any);

    const favs = await Favorite.find().lean();
    if (favs.length !== 3) throw new Error("favorite seed failed");

    const counts: Record<string, number> = {};
    favs.forEach((f: any) => {
      const id = f.propertyId.toString();
      counts[id] = (counts[id] || 0) + 1;
    });

    if (counts[p1._id.toString()] !== 2) throw new Error("count mismatch for p1");
    if (counts[p2._id.toString()] !== 1) throw new Error("count mismatch for p2");
    if (counts[p3._id.toString()] !== undefined) throw new Error("unexpected count for p3");

    console.log("OK: favorites aggregation counts correct");
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
