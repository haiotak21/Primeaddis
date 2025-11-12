"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatPrice } from "@/utils/helpers";

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>({});
  const [favCounts, setFavCounts] = useState<Record<string, number>>({});
  const [favProps, setFavProps] = useState<
    Record<string, { id: string; title: string; slug?: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [jobRunning, setJobRunning] = useState<{
    snap?: boolean;
    unfeature?: boolean;
  }>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (session && !["admin", "superadmin"].includes(session.user.role)) {
      router.push("/dashboard");
    }

    if (status === "authenticated") {
      fetchAnalytics();
      fetchFavoritesCounts();
      fetchSnapshots();
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

  const fetchFavoritesCounts = async () => {
    try {
      const res = await axios.get("/api/admin/favorites");
      const { counts, favorites } = res.data || {};
      setFavCounts(counts || {});
      // Map property id -> metadata (title/slug) from favorites list
      const map: Record<string, { id: string; title: string; slug?: string }> =
        {};
      (favorites || []).forEach((f: any) => {
        if (f?.property?.id && !map[f.property.id]) {
          map[f.property.id] = {
            id: f.property.id,
            title: f.property.title,
            slug: f.property.slug,
          };
        }
      });
      setFavProps(map);
    } catch (e) {
      // ignore
    }
  };

  const fetchSnapshots = async () => {
    try {
      const res = await axios.get("/api/admin/favorite-snapshots", {
        params: { days: 30 },
      });
      setSnapshots(res.data?.snapshots || []);
    } catch (e) {
      // ignore
    }
  };

  const triggerSnapshot = async () => {
    try {
      setJobRunning((s) => ({ ...s, snap: true }));
      await axios.post("/api/admin/jobs/snapshot-favorites");
      await fetchSnapshots();
      alert("Snapshot created.");
    } catch {
      alert("Failed to snapshot.");
    } finally {
      setJobRunning((s) => ({ ...s, snap: false }));
    }
  };

  const triggerUnfeature = async () => {
    try {
      setJobRunning((s) => ({ ...s, unfeature: true }));
      await axios.post("/api/admin/jobs/unfeature-expired");
      alert("Unfeature sweep completed.");
    } catch {
      alert("Failed to run unfeature sweep.");
    } finally {
      setJobRunning((s) => ({ ...s, unfeature: false }));
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Platform insights and metrics
          </p>
        </div>

        {/* User Analytics */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">User Metrics</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.userStats?.total || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.userStats?.active || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.userStats?.agents || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
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
            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Total Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.propertyStats?.total || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Active Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.propertyStats?.active || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Pending Approval
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.propertyStats?.pending || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Featured</CardTitle>
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
            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(analytics.revenueStats?.total || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(analytics.revenueStats?.thisMonth || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
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

        {/* Top Favorited Properties */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">
            Top Favorited Properties
          </h2>
          {Object.keys(favCounts).length === 0 ? (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              No favorites yet
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-left">
                    <th className="p-3 font-medium">Property</th>
                    <th className="p-3 font-medium">Favorites</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(favCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([id, count]) => {
                      const meta = favProps[id];
                      const title = meta?.title || id;
                      const href = meta?.slug
                        ? `/properties/${meta.slug}`
                        : `/properties/${id}`;
                      return (
                        <tr key={id} className="border-t">
                          <td className="p-3">
                            <a
                              className="underline"
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {title}
                            </a>
                          </td>
                          <td className="p-3 font-semibold">{count}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Favorites over time + Job controls */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2 border border-primary/20 dark:bg-gray-900/30 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Favorites Over Time (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              {snapshots.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  No data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={snapshots.map((s: any) => ({
                      date: new Date(s.date).toISOString().slice(5, 10),
                      total: s.total,
                    }))}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#0b8bff"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {session?.user?.role === "superadmin" && (
            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Maintenance Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={triggerSnapshot}
                    disabled={!!jobRunning.snap}
                    className="h-9 px-3 rounded-md bg-[#0b8bff] text-white disabled:opacity-60"
                  >
                    {jobRunning.snap ? "Running…" : "Create Snapshot"}
                  </button>
                  <button
                    onClick={triggerUnfeature}
                    disabled={!!jobRunning.unfeature}
                    className="h-9 px-3 rounded-md bg-amber-600 text-white disabled:opacity-60"
                  >
                    {jobRunning.unfeature ? "Running…" : "Unfeature Expired"}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
