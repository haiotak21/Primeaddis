import { NextResponse } from "next/server"
import connectDB from "@/lib/database"
import Property from "@/models/Property"
import User from "@/models/User"

// Compare agents by sales/rent performance and price bands
export async function POST(req: Request) {
  try {
    await connectDB()
    const { agentIds } = await req.json()
    if (!Array.isArray(agentIds) || agentIds.length < 1) {
      return NextResponse.json({ error: "agentIds array is required" }, { status: 400 })
    }

    // Validate and fetch basic agent info
    const agents = await User.find({ _id: { $in: agentIds } })
      .select("name email profileImage role")
      .lean()

    if (agents.length === 0) {
      return NextResponse.json({ agents: [], metrics: {} })
    }

    // Aggregate property metrics per agent
    const aggregation = await Property.aggregate([
      { $match: { listedBy: { $in: agents.map((a) => a._id) } } },
      {
        $addFields: {
          priceBand: {
            $switch: {
              branches: [
                { case: { $lt: ["$price", 1000000] }, then: "<1M" },
                { case: { $and: [{ $gte: ["$price", 1000000] }, { $lt: ["$price", 5000000] }] }, then: "1M-5M" },
                { case: { $and: [{ $gte: ["$price", 5000000] }, { $lt: ["$price", 10000000] }] }, then: "5M-10M" },
              ],
              default: ">=10M",
            },
          },
        },
      },
      {
        $group: {
          _id: "$listedBy",
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          sold: { $sum: { $cond: [{ $eq: ["$status", "sold"] }, 1, 0] } },
          rented: { $sum: { $cond: [{ $eq: ["$status", "rented"] }, 1, 0] } },
          saleCount: { $sum: { $cond: [{ $eq: ["$listingType", "sale"] }, 1, 0] } },
          rentCount: { $sum: { $cond: [{ $eq: ["$listingType", "rent"] }, 1, 0] } },
          avgPrice: { $avg: "$price" },
          priceBands: { $push: "$priceBand" },
        },
      },
    ])

    // Count price bands per agent
    const metrics = aggregation.reduce((acc: any, row: any) => {
      const bandsArray: string[] = row.priceBands || []
      const bands = bandsArray.reduce(
        (b: any, band: string) => ({ ...b, [band]: (b[band] || 0) + 1 }),
        { "<1M": 0, "1M-5M": 0, "5M-10M": 0, ">=10M": 0 },
      )
      acc[String(row._id)] = {
        total: row.total,
        active: row.active,
        sold: row.sold,
        rented: row.rented,
        saleCount: row.saleCount,
        rentCount: row.rentCount,
        avgPrice: row.avgPrice || 0,
        priceBands: bands,
      }
      return acc
    }, {})

    return NextResponse.json({ agents, metrics })
  } catch (error) {
    console.error("Compare agents error:", error)
    return NextResponse.json({ error: "Failed to compare agents" }, { status: 500 })
  }
}
