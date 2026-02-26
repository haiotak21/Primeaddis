import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
<<<<<<< HEAD
import Property from "../../../models/Property";
=======
import Property from "../../../models/Property"
>>>>>>> 8a5255dad9d7d8475daa8dee58d14ba6f4cd2054
import RealEstate from "@/models/RealEstate";

// Compare real estate companies by performance and pricing
export async function POST(req: Request) {
  try {
    await connectDB();
    const { realEstateIds } = await req.json();
    if (!Array.isArray(realEstateIds) || realEstateIds.length < 1) {
      return NextResponse.json({ error: "realEstateIds array is required" }, { status: 400 });
    }

    // Validate companies exist
    const companies = await RealEstate.find({ _id: { $in: realEstateIds } })
      .select("name website logo")
      .lean();
    if (companies.length === 0) {
      return NextResponse.json({ realEstates: [], metrics: {} });
    }

    const aggregation = await Property.aggregate([
      { $match: { realEstate: { $in: companies.map((c) => c._id) } } },
      {
        $group: {
          _id: "$realEstate",
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          sold: { $sum: { $cond: [{ $eq: ["$status", "sold"] }, 1, 0] } },
          rented: { $sum: { $cond: [{ $eq: ["$status", "rented"] }, 1, 0] } },
          saleCount: { $sum: { $cond: [{ $eq: ["$listingType", "sale"] }, 1, 0] } },
          rentCount: { $sum: { $cond: [{ $eq: ["$listingType", "rent"] }, 1, 0] } },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    const metrics = aggregation.reduce((acc: any, row: any) => {
      acc[String(row._id)] = {
        total: row.total,
        active: row.active,
        sold: row.sold,
        rented: row.rented,
        saleCount: row.saleCount,
        rentCount: row.rentCount,
        avgPrice: row.avgPrice || 0,
        minPrice: row.minPrice ?? null,
        maxPrice: row.maxPrice ?? null,
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ realEstates: companies, metrics });
  } catch (error) {
    console.error("Compare real estates error:", error);
    return NextResponse.json({ error: "Failed to compare real estates" }, { status: 500 });
  }
}
