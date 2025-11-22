"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/helpers";
import { FeatureDialog } from "@/components/ui/feature-dialog";

type PropertyDoc = {
  _id: string;
  title: string;
  images?: string[];
  listedBy?: { name?: string; email?: string };
  createdAt: string | Date;
  location?: { address?: string; city?: string; region?: string };
  featured?: boolean;
  featuredUntil?: string | Date | null;
};

export default function AdminFeaturedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [featured, setFeatured] = useState<PropertyDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status === "authenticated") fetchFeatured();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function fetchFeatured() {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/properties/featured");
      setFeatured(res.data.properties || []);
    } catch (e) {
      setFeatured([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnfeature(id: string) {
    try {
      await axios.put(`/api/admin/properties/${id}/feature`, {
        featured: false,
      });
      fetchFeatured();
    } catch (e) {
      // noop
    }
  }
  // Feature dialog state for extending
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [featureTargetId, setFeatureTargetId] = useState<string | null>(null);

  function handleExtend(id: string) {
    setFeatureTargetId(id);
    setFeatureDialogOpen(true);
  }

  async function confirmExtend(inputValue: string) {
    if (!featureTargetId) return;
    try {
      let payload: any = { featured: true };
      if (inputValue && inputValue.trim()) {
        const n = Number(inputValue.trim());
        if (!Number.isNaN(n)) {
          const cur = new Date();
          const d = new Date();
          d.setDate(cur.getDate() + Math.max(1, Math.floor(n)));
          payload.featuredUntil = d.toISOString();
        } else {
          payload.featuredUntil = inputValue.trim();
        }
      }
      await axios.put(
        `/api/admin/properties/${featureTargetId}/feature`,
        payload
      );
      fetchFeatured();
    } catch (e) {
      // noop
    } finally {
      setFeatureDialogOpen(false);
      setFeatureTargetId(null);
    }
  }

  if (status === "loading" || loading)
    return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full max-w-6xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Featured Properties</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage properties currently marked as featured.
          </p>
        </header>

        {featured.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-center text-sm text-gray-500">
            No featured properties found.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Property
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Agent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Featured Until
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {featured.map((p) => (
                    <tr key={p._id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={
                                p.images?.[0] ||
                                "/placeholder.svg?height=96&width=128"
                              }
                              alt={p.title}
                              className="object-cover h-12 w-16"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-[#03063b] dark:text-white">
                              {p.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {p.location?.city || p.location?.address || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#03063b]">
                        {p.listedBy?.name || p.listedBy?.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {p.featuredUntil
                          ? formatDate(p.featuredUntil)
                          : "No expiry"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExtend(p._id)}
                            className="text-sm px-3 py-1 bg-white border rounded-md"
                          >
                            Extend
                          </button>
                          <button
                            onClick={() => handleUnfeature(p._id)}
                            className="text-sm px-3 py-1 bg-amber-50 text-amber-600 rounded-md"
                          >
                            Unfeature
                          </button>
                          <a
                            href={`/admin/properties/${p._id}/edit`}
                            className="text-sm px-3 py-1 bg-white border rounded-md"
                          >
                            Edit
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <FeatureDialog
          open={featureDialogOpen}
          defaultValue="30"
          onOpenChange={(open) => setFeatureDialogOpen(open)}
          onConfirm={(value) => confirmExtend(value)}
        />
      </div>
    </div>
  );
}
