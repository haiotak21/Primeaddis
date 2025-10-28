"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/utils/helpers";

type PropertyDoc = {
  _id: string;
  title: string;
  images?: string[];
  status?: string;
  listedBy?: { name?: string; email?: string };
  createdAt: string | Date;
  location?: { address?: string; city?: string; region?: string };
};

export default function AdminPropertiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [pendingProperties, setPendingProperties] = useState<PropertyDoc[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");
  // pagination for All list
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (session && !["admin", "superadmin"].includes(session.user.role))
      router.push("/dashboard");
    if (status === "authenticated") {
      Promise.all([fetchAllProperties(1), fetchPendingProperties()]).finally(
        () => setLoading(false)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function fetchPendingProperties() {
    try {
      const res = await axios.get("/api/admin/properties/pending");
      setPendingProperties(res.data.properties || []);
    } catch (e) {
      setPendingProperties([]);
    }
  }

  async function fetchAllProperties(nextPage: number) {
    try {
      const res = await axios.get("/api/properties", {
        params: { status: "active", limit, page: nextPage },
      });
      setAllProperties(res.data.properties || []);
      const pg = res.data.pagination || { page: nextPage, limit, total: 0 };
      setPage(pg.page);
      setLimit(pg.limit);
      setTotal(pg.total);
    } catch (e) {
      setAllProperties([]);
      setTotal(0);
    }
  }

  async function handleApprove(propertyId: string) {
    try {
      await axios.put(`/api/admin/properties/${propertyId}/approve`);
      setPendingProperties((prev) => prev.filter((p) => p._id !== propertyId));
      fetchAllProperties(page);
    } catch (e) {
      // no-op
    }
  }

  async function handleReject(propertyId: string) {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await axios.put(`/api/admin/properties/${propertyId}/reject`, { reason });
      setPendingProperties((prev) => prev.filter((p) => p._id !== propertyId));
    } catch (e) {
      // no-op
    }
  }

  // Confirm dialog events for delete
  useEffect(() => {
    const onConfirm = async () => {
      if (!deleteId) return;
      await axios.delete(`/api/properties/${deleteId}`);
      setPendingProperties((prev) => prev.filter((p) => p._id !== deleteId));
      setAllProperties((prev) => prev.filter((p) => p._id !== deleteId));
      setDeleteId(null);
    };
    const onOpenChange = (e: any) => {
      if (!e?.detail?.open) setDeleteId(null);
    };
    window.addEventListener("admin-prop-delete:confirm", onConfirm as any);
    window.addEventListener(
      "admin-prop-delete:open-change",
      onOpenChange as any
    );
    return () => {
      window.removeEventListener("admin-prop-delete:confirm", onConfirm as any);
      window.removeEventListener(
        "admin-prop-delete:open-change",
        onOpenChange as any
      );
    };
  }, [deleteId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4fafe] dark:bg-[#0f1923]">
      <div className="w-full max-w-7xl mx-auto p-6 lg:p-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-col">
              <h1 className="text-[#03063b] dark:text-white text-3xl font-bold tracking-tight">
                Property Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base mt-1">
                Review and approve pending property listings
              </p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-[#03063b] dark:text-gray-300">
                  All:{" "}
                  <span className="font-semibold">
                    {total || allProperties.length}
                  </span>
                </p>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
                <p className="text-sm text-[#03063b] dark:text-gray-300">
                  Pending:{" "}
                  <span className="font-semibold">
                    {pendingProperties.length}
                  </span>
                </p>
              </div>
            </div>
            <a
              href="/properties/new"
              className="flex items-center justify-center gap-2 h-10 px-6 bg-[#0b8bff] text-white rounded-lg text-sm font-semibold hover:bg-[#0b8bff]/90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Property
            </a>
          </div>
        </header>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
          <nav aria-label="Tabs" className="flex -mb-px space-x-6">
            <button
              className={`${
                activeTab === "all"
                  ? "border-[#0b8bff] text-[#0b8bff] font-semibold"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
              } shrink-0 border-b-2 px-1 pb-3 text-sm`}
              onClick={() => setActiveTab("all")}
            >
              All Properties
            </button>
            <button
              className={`${
                activeTab === "pending"
                  ? "border-[#0b8bff] text-[#0b8bff] font-semibold"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
              } shrink-0 border-b-2 px-1 pb-3 text-sm`}
              onClick={() => setActiveTab("pending")}
            >
              Pending Review
            </button>
          </nav>
        </div>

        {/* Filters (UI only) */}
        <div className="bg-white dark:bg-gray-900/40 p-4 rounded-lg border border-gray-200 dark:border-gray-800 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Status: All", "Property Type", "Agent", "Date Listed"].map(
              (label) => (
                <button
                  key={label}
                  className="flex h-10 w-full items-center justify-between gap-x-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-left"
                >
                  <p className="text-[#03063b] dark:text-gray-300 text-sm font-medium">
                    {label}
                  </p>
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                    expand_more
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Property Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assigned Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date Listed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {(activeTab === "all" ? allProperties : pendingProperties)
                  .length === 0 ? (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                      colSpan={5}
                    >
                      {activeTab === "all"
                        ? "No properties found"
                        : "No pending properties"}
                    </td>
                  </tr>
                ) : (
                  (activeTab === "all" ? allProperties : pendingProperties).map(
                    (property) => {
                      const imgSrc =
                        property.images?.[0] ||
                        "/placeholder.svg?height=96&width=96";
                      const agentName = property.listedBy?.name || "Unknown";
                      const created = formatDate(property.createdAt);
                      const statusValue =
                        property.status ||
                        (activeTab === "all" ? "active" : "pending");
                      const statusStyles =
                        statusValue === "active"
                          ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                          : statusValue === "pending"
                          ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
                          : statusValue === "sold" || statusValue === "rented"
                          ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";

                      return (
                        <tr key={property._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img
                                  src={imgSrc}
                                  alt={property.title}
                                  className="h-12 w-12 rounded-md object-cover"
                                />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-[#03063b] dark:text-white">
                                  {property.title}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {property.location?.address ||
                                    property.location?.city ||
                                    ""}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles}`}
                            >
                              {statusValue.charAt(0).toUpperCase() +
                                statusValue.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#03063b] dark:text-gray-300">
                            {agentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {created}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {activeTab === "pending" ? (
                                <>
                                  <button
                                    onClick={() => handleApprove(property._id)}
                                    className="text-green-600 hover:text-green-700"
                                    title="Approve"
                                  >
                                    <span className="material-symbols-outlined text-xl">
                                      check_circle
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleReject(property._id)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Reject"
                                  >
                                    <span className="material-symbols-outlined text-xl">
                                      cancel
                                    </span>
                                  </button>
                                  <a
                                    href={`/properties/${property._id}`}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="View"
                                  >
                                    <span className="material-symbols-outlined text-xl">
                                      visibility
                                    </span>
                                  </a>
                                </>
                              ) : (
                                <>
                                  <a
                                    href={`/admin/properties/${property._id}/edit`}
                                    className="text-[#0b8bff] hover:text-[#0b8bff]/80"
                                    title="Edit"
                                  >
                                    <span className="material-symbols-outlined text-xl">
                                      edit
                                    </span>
                                  </a>
                                  <a
                                    href={`/properties/${property._id}`}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="View"
                                  >
                                    <span className="material-symbols-outlined text-xl">
                                      visibility
                                    </span>
                                  </a>
                                  <button
                                    onClick={() => setDeleteId(property._id)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Delete"
                                  >
                                    <span className="material-symbols-outlined text-xl">
                                      delete
                                    </span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for All tab */}
          {activeTab === "all" && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {total > 0 ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold">
                      {(page - 1) * limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {Math.min(page * limit, total)}
                    </span>{" "}
                    of <span className="font-semibold">{total}</span> results
                  </>
                ) : (
                  <>No results</>
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => fetchAllProperties(page - 1)}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled={page * limit >= total}
                  onClick={() => fetchAllProperties(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Confirm dialog */}
        <ConfirmDialog
          open={!!deleteId}
          title="Delete property?"
          description="This action cannot be undone."
          confirmText="Delete"
          confirmEvent="admin-prop-delete:confirm"
          openChangeEvent="admin-prop-delete:open-change"
        />
      </div>
    </div>
  );
}
