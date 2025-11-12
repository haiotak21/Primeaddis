import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

async function main() {
  const { default: Property } = await import("../models/Property");
  // Monkey-patch the middleware module export in the module cache (CommonJS)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const authMod = require("../lib/middleware/auth");
  const originalRequireRole = authMod.requireRole;
  authMod.requireRole = async (roles: string[]) => {
    // Always reject as non-admin
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  };

  const { PUT } = await import("../app/api/admin/properties/[id]/feature/route");

  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  try {
    const p = await Property.create({
      title: "X",
      description: "d",
      price: 1,
      type: "house",
      location: { address: "a", city: "c", region: "r", coordinates: { lat: 8, lng: 38 } },
      specifications: { area: 1 },
      amenities: ["a"],
      images: ["i"],
      listedBy: new mongoose.Types.ObjectId(),
      realEstate: new mongoose.Types.ObjectId(),
      listingType: "sale",
      status: "active",
    } as any);

    const req = { json: async () => ({ featured: true }) } as any;
    const res = await PUT(req, { params: { id: String(p._id) } });
    const status = (res as any)?._init?.status || (res as any).status || 200;
    if (status !== 403) throw new Error(`Expected 403 for non-admin but got ${status}`);

    console.log("OK: permission test for feature toggle rejected non-admin");
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
    // restore
    authMod.requireRole = originalRequireRole;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
