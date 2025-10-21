"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/properties/property-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/helpers";
import CurrencyAmount from "@/components/common/currency-amount";
import Image from "next/image";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminPropertiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingProperties, setPendingProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (session && !["admin", "superadmin"].includes(session.user.role)) {
      router.push("/dashboard");
    }

    if (status === "authenticated") {
      // Load both views initially for snappy tab switching
      Promise.all([fetchAllProperties(), fetchPendingProperties()]).finally(
        () => setLoading(false)
      );
    }
  }, [status, session, router]);

  const fetchPendingProperties = async () => {
    try {
      const res = await axios.get("/api/admin/properties/pending");
      setPendingProperties(res.data.properties || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const fetchAllProperties = async () => {
    try {
      // Default GET /api/properties returns active properties; bump limit for admin view
      const res = await axios.get("/api/properties", {
        params: { status: "active", limit: 50 },
      });
      setAllProperties(res.data.properties || []);
    } catch (error) {
      console.error("Error fetching all properties:", error);
    }
  };

  const handleApprove = async (propertyId: string) => {
    try {
      await axios.put(`/api/admin/properties/${propertyId}/approve`);
      setPendingProperties((prev) =>
        prev.filter((p: any) => p._id !== propertyId)
      );
      // After approval, refresh All list so it appears there
      fetchAllProperties();
    } catch (error) {
      console.error("Error approving property:", error);
    }
  };

  const handleReject = async (propertyId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await axios.put(`/api/admin/properties/${propertyId}/reject`, { reason });
      setPendingProperties((prev) =>
        prev.filter((p: any) => p._id !== propertyId)
      );
    } catch (error) {
      console.error("Error rejecting property:", error);
    }
  };

  // Confirm dialog event handlers (must be before any conditional return)
  useEffect(() => {
    const onConfirm = async () => {
      if (!deleteId) return;
      await axios.delete(`/api/properties/${deleteId}`);
      setPendingProperties((prev: any[]) =>
        prev.filter((p: any) => p._id !== deleteId)
      );
      setAllProperties((prev: any[]) =>
        prev.filter((p: any) => p._id !== deleteId)
      );
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
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Property Management</h1>
              <p className="mt-2 text-muted-foreground">
                Review and approve pending property listings
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>
                  All:{" "}
                  <span className="font-medium text-foreground">
                    {allProperties.length}
                  </span>
                </span>
                <span>
                  Pending:{" "}
                  <span className="font-medium text-foreground">
                    {pendingProperties.length}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session?.user?.role && (
                <Badge variant="secondary" className="capitalize">
                  {session.user.role}
                </Badge>
              )}
              <Button asChild>
                <a href="/properties/new">Add Property</a>
              </Button>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("all")}
            >
              All Properties
            </Button>
            <Button
              variant={activeTab === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("pending")}
            >
              Pending Review
            </Button>
          </div>
        </div>

        {activeTab === "all" ? (
          allProperties.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">No properties found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start listing to see properties here
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allProperties.map((property: any) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )
        ) : pendingProperties.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold">No pending properties</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  All properties have been reviewed
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingProperties.map((property: any) => (
              <Card key={property._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{property.title}</CardTitle>
                      <CardDescription>
                        Listed by {property.listedBy.name} (
                        {property.listedBy.email})
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="relative h-48 overflow-hidden rounded-lg">
                      <Image
                        src={
                          property.images[0] ||
                          "/placeholder.svg?height=200&width=300"
                        }
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Description
                        </p>
                        <p className="line-clamp-2">{property.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-semibold">
                            <CurrencyAmount amountUsd={property.price} />
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-semibold capitalize">
                            {property.type}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Location
                          </p>
                          <p className="font-semibold">
                            {property.location.city}, {property.location.region}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Listed
                          </p>
                          <p className="font-semibold">
                            {formatDate(property.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => handleApprove(property._id)}>
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(property._id)}
                        >
                          Reject
                        </Button>
                        <Button variant="outline" asChild>
                          <a
                            href={`/properties/${property._id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Details
                          </a>
                        </Button>
                        <Button variant="secondary" asChild>
                          <a href={`/admin/properties/${property._id}/edit`}>
                            Edit
                          </a>
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteId(property._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
