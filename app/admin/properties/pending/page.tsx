"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { formatDate } from "@/utils/helpers";

type PropertyDoc = {
  _id: string;
  title: string;
  images?: string[];
  listedBy?: { name?: string; email?: string };
  createdAt: string | Date;
  location?: { address?: string; city?: string };
};

export default function PendingReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (session && !["admin", "superadmin"].includes(session.user.role))
      router.push("/dashboard");
    if (status === "authenticated") {
      fetchPending().finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function fetchPending() {
    try {
      const res = await axios.get("/api/admin/properties/pending");
      setProperties(res.data.properties || []);
    } catch (e) {
      setProperties([]);
    }
  }

  async function handleApprove(id: string) {
    try {
      await axios.put(`/api/admin/properties/${id}/approve`);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch {}
  }

  async function handleReject(id: string) {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await axios.put(`/api/admin/properties/${id}/reject`, { reason });
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch {}
  }

  const total = properties.length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="font-display bg-[#f4fafe] dark:bg-[#0f1923] text-[#03063b] min-h-screen w-full">
      <main className="w-full p-6 lg:p-10">
        <div className="w-full max-w-7xl mx-auto">
          <header className="mb-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-[#03063b] dark:text-white text-3xl font-bold tracking-tight">
                  Properties Pending Review
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base mt-1">
                  Approve or reject new property submissions.
                </p>
              </div>
              <div className="relative">
                <button className="size-12 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                    style={{
                      backgroundImage: `url(${
                        session?.user?.image ||
                        "/placeholder.svg?height=80&width=80"
                      })`,
                    }}
                    aria-label="Admin avatar"
                  />
                </button>
              </div>
            </div>
          </header>

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {properties.length === 0 ? (
                    <tr>
                      <td
                        className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                        colSpan={5}
                      >
                        No pending properties
                      </td>
                    </tr>
                  ) : (
                    properties.map((p) => {
                      const img =
                        p.images?.[0] || "/placeholder.svg?height=96&width=96";
                      const agent = p.listedBy?.name || "Unknown";
                      const addr =
                        p.location?.address || p.location?.city || "";
                      return (
                        <tr key={p._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 size-12">
                                <img
                                  className="size-12 rounded-lg object-cover"
                                  src={img}
                                  alt={p.title}
                                />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-[#03063b] dark:text-white">
                                  {p.title}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {addr}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#03063b] dark:text-gray-300">
                            {agent}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(p.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                              Pending
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="flex items-center justify-center gap-2 h-9 px-4 bg-[#0b8bff] text-white rounded-lg text-sm font-semibold hover:bg-[#0b8bff]/90 transition-colors shadow-sm"
                                onClick={() => handleApprove(p._id)}
                              >
                                Approve
                              </button>
                              <button
                                className="flex items-center justify-center gap-2 h-9 px-4 bg-gray-200 dark:bg-gray-700 text-[#03063b] dark:text-white rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                onClick={() => handleReject(p._id)}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {total > 0 ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-[#03063b] dark:text-gray-300">
                      1
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-[#03063b] dark:text-gray-300">
                      {total}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-[#03063b] dark:text-gray-300">
                      {total}
                    </span>{" "}
                    results
                  </>
                ) : (
                  <>No results</>
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
