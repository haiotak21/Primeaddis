"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/utils/helpers";

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (session && !["admin", "superadmin"].includes(session.user.role)) {
      router.push("/dashboard");
    }

    if (status === "authenticated") {
      fetchAnalytics();
    }
  }, [status, session, router]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("/api/admin/analytics");
      setAnalytics(res.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4fafe]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-[#03063b] text-4xl font-black leading-tight tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-[#47739e]">Platform insights and metrics</p>
        </div>

        {/* User Analytics */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">User Metrics</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#03063b]">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.userStats?.total || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#03063b]">
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.userStats?.active || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#03063b]">
                  Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.userStats?.agents || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#03063b]">
                  New This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.userStats?.newThisMonth || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Property Analytics */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Property Metrics</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#03063b]">
                  Total Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.propertyStats?.total || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#03063b]">
                  Active Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.propertyStats?.active || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#03063b]">
                  Pending Approval
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.propertyStats?.pending || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#03063b]">
                  Featured
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.propertyStats?.featured || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Revenue Analytics */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Revenue Metrics</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#03063b]">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(analytics.revenueStats?.total || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#03063b]">
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(analytics.revenueStats?.thisMonth || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#03063b]">
                  Average Transaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(analytics.revenueStats?.average || 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
