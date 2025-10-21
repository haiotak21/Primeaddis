import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/utils/helpers";
import CurrencyAmount from "@/components/common/currency-amount";
import connectDB from "@/lib/database";
import User from "@/models/User";
import Property from "@/models/Property";
import Payment from "@/models/Payment";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import AgentCharts from "@/components/dashboard/agent-charts";
import React from "react";
import AgentInvite from "@/components/admin/agent-invite";
import AgentProperties from "@/components/admin/agent-properties";
import AgentReviews from "@/components/admin/agent-reviews";

async function getAdminStatsDirect() {
  try {
    await connectDB();
    const [
      totalUsers,
      totalAgents,
      totalProperties,
      activeProperties,
      pendingProperties,
      totalRevenue,
      recentPayments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ["agent", "admin", "superadmin"] } }),
      Property.countDocuments(),
      Property.countDocuments({ status: "active" }),
      Property.countDocuments({ status: "pending" }),
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.find({ status: "completed" })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "name email")
        .lean(),
    ]);
    return {
      stats: {
        totalUsers,
        totalAgents,
        totalProperties,
        activeProperties,
        pendingProperties,
        totalRevenue: (totalRevenue as any)[0]?.total || 0,
      },
      recentPayments,
    } as any;
  } catch (e) {
    // Safe defaults if DB unavailable
    return {
      stats: {
        totalUsers: 0,
        totalAgents: 0,
        totalProperties: 0,
        activeProperties: 0,
        pendingProperties: 0,
        totalRevenue: 0,
      },
      recentPayments: [],
    };
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !["agent", "admin", "superadmin"].includes(session.user.role)
  ) {
    redirect("/dashboard");
  }

  const { stats, recentPayments } = await getAdminStatsDirect();
  const isAgent = session.user.role === "agent";
  const isSuperadmin = session.user.role === "superadmin";

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {isAgent ? "Agent Dashboard" : "Admin Dashboard"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isAgent
              ? "Manage your listings, invites, and reviews"
              : "Manage your platform and monitor activity"}
          </p>
        </div>

        {/* Stats Grid (read-only) */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers || 0}
            description="Registered users"
            icon={
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />
          <StatsCard
            title="Total Agents"
            value={stats.totalAgents || 0}
            description="Active agents"
            icon={
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <StatsCard
            title="Total Properties"
            value={stats.totalProperties || 0}
            description={`${stats.activeProperties || 0} active`}
            icon={
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            }
          />
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingProperties || 0}
            description="Properties awaiting review"
            icon={
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatsCard
            title="Total Revenue"
            value={
              (<CurrencyAmount amountUsd={stats.totalRevenue || 0} />) as any
            }
            description="All-time earnings"
            icon={
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>

        {/* Role-specific sections as accordion for usability */}
        <Accordion type="multiple" className="mb-8">
          <AccordionItem value="section-properties">
            <AccordionTrigger>Property Management</AccordionTrigger>
            <AccordionContent>
              {isAgent ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Create, edit and delete your own properties
                    </p>
                    <Link href="/properties/new" className="underline">
                      Add Property
                    </Link>
                  </div>
                  <AgentProperties />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Admins can review and approve listings in{" "}
                  <Link href="/admin/properties" className="underline">
                    Properties
                  </Link>
                  .
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="section-users">
            <AccordionTrigger>Users Management</AccordionTrigger>
            <AccordionContent>
              {isSuperadmin ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Create agent accounts directly. They can sign in
                    immediately.
                  </p>
                  <AgentInvite />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Access restricted for your role. Only superadmin can create
                  agent accounts. You can still view users in {""}
                  <Link href="/admin/users" className="underline">
                    Users
                  </Link>
                  .
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="section-reviews">
            <AccordionTrigger>Review Management</AccordionTrigger>
            <AccordionContent>
              {isAgent ? (
                <AgentReviews />
              ) : (
                <div className="text-sm text-muted-foreground">
                  Go to{" "}
                  <Link className="underline" href="/admin/reviews">
                    Review Management
                  </Link>{" "}
                  for full moderation.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="section-analytics">
            <AccordionTrigger>Analytics</AccordionTrigger>
            <AccordionContent>
              {isAgent ? (
                <AgentAnalytics userId={session.user.id} />
              ) : (
                <div className="text-sm text-muted-foreground">
                  See{" "}
                  <Link href="/admin/analytics" className="underline">
                    Analytics
                  </Link>{" "}
                  for platform-wide metrics.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {!isAgent && (
            <AccordionItem value="section-payments">
              <AccordionTrigger>Payments & Settings</AccordionTrigger>
              <AccordionContent>
                {session.user.role === "superadmin" ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <Link href="/admin/payments" className="underline">
                        Payment Management
                      </Link>
                    </div>
                    <div>
                      <Link href="/admin/settings" className="underline">
                        System Settings
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Access restricted for your role.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {!isAgent && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>
                Latest transactions on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentPayments.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No payments yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentPayments.map((payment: any) => (
                    <div
                      key={payment._id}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {payment.userId?.name || "Unknown User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.type === "subscription"
                            ? `${payment.planType} subscription`
                            : "Featured listing"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          <CurrencyAmount amountUsd={payment.amount} />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Server component wrapper for agent analytics (reuse existing charts component)
async function AgentAnalytics({ userId }: { userId: string }) {
  // Reuse existing agent aggregates
  const data = await getAgentMetrics(userId);
  const monthlyData = data.monthly.map((m: any) => ({
    month: m._id,
    count: m.count,
    avgPrice: Math.round(m.avgPrice || 0),
  }));
  return (
    <div className="mt-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard title="Total Listings" value={data.total} description="" />
        <StatsCard title="Active" value={data.active} description="" />
        <StatsCard title="Sold/Rented" value={data.sold} description="" />
        <StatsCard
          title="Avg Price (USD)"
          value={Math.round(data.avgPrice).toLocaleString()}
          description=""
        />
      </div>
      {/* client charts */}
      <AgentCharts monthlyData={monthlyData} />
    </div>
  );
}

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
  const mongoose = (await import("mongoose")).default;
  const avgPriceAgg = await Property.aggregate([
    { $match: { listedBy: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, avg: { $avg: "$price" } } },
  ]);
  const avgPrice = avgPriceAgg[0]?.avg || 0;
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);
  const monthly = await Property.aggregate([
    {
      $match: {
        listedBy: new mongoose.Types.ObjectId(userId),
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
