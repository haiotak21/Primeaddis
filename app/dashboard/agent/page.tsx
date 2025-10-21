import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/database";
import Property from "@/models/Property";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import React from "react";
import AgentCharts from "../../../components/dashboard/agent-charts";

type Metric = {
  label: string;
  value: number | string;
  sub?: string;
};

async function getAgentMetrics(userId: string) {
  await connectDB();

  const total = await Property.countDocuments({ listedBy: userId });
  const active = await Property.countDocuments({
    listedBy: userId,
    status: "active",
  });
  const sold = await Property.countDocuments({
    listedBy: userId,
    status: { $in: ["sold", "rented"] },
  });

  const avgPriceAgg = await Property.aggregate([
    { $match: { listedBy: new (require("mongoose").Types.ObjectId)(userId) } },
    { $group: { _id: null, avg: { $avg: "$price" } } },
  ]);
  const avgPrice = avgPriceAgg[0]?.avg || 0;

  // Past 6 months trend by month
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);
  const monthly = await Property.aggregate([
    {
      $match: {
        listedBy: new (require("mongoose").Types.ObjectId)(userId),
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
        avgPrice: { $avg: "$price" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return { total, active, sold, avgPrice, monthly };
}

export default async function AgentDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");
  const role = session.user.role;
  if (!["agent", "admin", "superadmin"].includes(role)) redirect("/dashboard");

  const { total, active, sold, avgPrice, monthly } = await getAgentMetrics(
    session.user.id
  );

  const monthlyData = monthly.map((m: any) => ({
    month: m._id,
    count: m.count,
    avgPrice: Math.round(m.avgPrice || 0),
  }));

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Agent Analytics</h1>
          <p className="mt-2 text-muted-foreground">
            Your listings performance and trends
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sold/Rented</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sold}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Average Price (USD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(avgPrice).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <AgentCharts monthlyData={monthlyData} />
      </div>
    </div>
  );
}
