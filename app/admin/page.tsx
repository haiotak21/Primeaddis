import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatsCard } from "@/components/dashboard/stats-card";
// Removed Card UI imports in favor of custom styled sections aligning to the new design
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-col items-center text-center gap-1 sm:gap-2 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight">
          {isAgent ? "Agent Dashboard" : "Admin Dashboard"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {isAgent
            ? "Manage your listings, invites, and reviews"
            : "Manage your platform and monitor activity"}
        </p>
      </header>

      {/* Stats Grid styled like the reference */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <div className="flex flex-col gap-1 rounded-xl p-4 sm:p-5 lg:p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="material-symbols-outlined text-[#0b8bff] text-2xl sm:text-3xl">
              group
            </span>
            <p className="text-base sm:text-lg font-bold leading-tight">
              {stats.totalUsers || 0}
            </p>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-normal">
            Registered users
          </p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl p-4 sm:p-5 lg:p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="material-symbols-outlined text-[#0b8bff] text-2xl sm:text-3xl">
              support_agent
            </span>
            <p className="text-base sm:text-lg font-bold leading-tight">
              {stats.totalAgents || 0}
            </p>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-normal">
            Active agents
          </p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl p-4 sm:p-5 lg:p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="material-symbols-outlined text-[#0b8bff] text-2xl sm:text-3xl">
              home_work
            </span>
            <p className="text-base sm:text-lg font-bold leading-tight">
              {stats.totalProperties || 0}
            </p>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-normal">
            {stats.activeProperties || 0} active
          </p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl p-4 sm:p-5 lg:p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="material-symbols-outlined text-orange-500 text-2xl sm:text-3xl">
              notification_important
            </span>
            <p className="text-base sm:text-lg font-bold leading-tight">
              {stats.pendingProperties || 0}
            </p>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-normal">
            Properties awaiting review
          </p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl p-4 sm:p-5 lg:p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="material-symbols-outlined text-[#0b8bff] text-2xl sm:text-3xl">
              attach_money
            </span>
            <p className="text-base sm:text-lg font-bold leading-tight">
              <CurrencyAmount amountUsd={stats.totalRevenue || 0} />
            </p>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-normal">
            all-time earnings
          </p>
        </div>
      </section>

      {/* Role-specific sections as accordion for usability */}
      <Accordion type="multiple" className="mb-6 sm:mb-8">
        <AccordionItem value="section-properties">
          <AccordionTrigger className="py-3 sm:py-4 text-sm sm:text-base">
            Property Management
          </AccordionTrigger>
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
          <AccordionTrigger className="py-3 sm:py-4 text-sm sm:text-base">
            Users Management
          </AccordionTrigger>
          <AccordionContent>
            {isSuperadmin ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Create agent accounts directly. They can sign in immediately.
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
          <AccordionTrigger className="py-3 sm:py-4 text-sm sm:text-base">
            Review Management
          </AccordionTrigger>
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
          <AccordionTrigger className="py-3 sm:py-4 text-sm sm:text-base">
            Analytics
          </AccordionTrigger>
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
        <section className="mt-6 sm:mt-8">
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold leading-tight">
              Latest Payments transactions on the platform
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-sm min-h-60">
            {recentPayments.length === 0 ? (
              <p className="text-center text-muted-foreground text-base sm:text-lg">
                No payments yet
              </p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentPayments.map((payment: any) => (
                  <div
                    key={payment._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-3 sm:pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        {payment.userId?.name || "Unknown User"}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {payment.type === "subscription"
                          ? `${payment.planType} subscription`
                          : "Featured listing"}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-sm sm:text-base">
                        <CurrencyAmount amountUsd={payment.amount} />
                      </p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
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
