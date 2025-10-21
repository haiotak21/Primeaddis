"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import CoordinatePicker from "@/components/properties/coordinate-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminPropertyEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<any>(null);
  const handleCoordsChange = (lat: string, lng: string) => {
    setFormData((prev: any) => ({ ...prev, lat, lng }));
  };
  const handleResolve = (v: {
    address?: string;
    city?: string;
    region?: string;
    lat: string;
    lng: string;
  }) => {
    setFormData((prev: any) => ({
      ...prev,
      address: v.address || prev.address,
      city: v.city || prev.city,
      region: v.region || prev.region,
      lat: v.lat,
      lng: v.lng,
    }));
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    // Allow agents, admins and superadmins to open edit page. Ownership is enforced on save at API level.
    if (
      session &&
      !["agent", "admin", "superadmin"].includes(session.user.role)
    )
      router.push("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`/api/properties/${id}`);
        const p = res.data.property;
        setFormData({
          title: p.title,
          description: p.description,
          price: p.price,
          type: p.type,
          listingType: p.listingType,
          address: p.location.address,
          city: p.location.city,
          region: p.location.region,
          lat: String(p.location.coordinates.lat),
          lng: String(p.location.coordinates.lng),
          bedrooms: p.specifications?.bedrooms ?? "",
          bathrooms: p.specifications?.bathrooms ?? "",
          area: p.specifications?.area ?? "",
          yearBuilt: p.specifications?.yearBuilt ?? "",
          amenities: Array.isArray(p.amenities) ? p.amenities.join(", ") : "",
          images: Array.isArray(p.images) ? p.images.join(", ") : "",
          vrTourUrl: p.vrTourUrl || "",
        });
      } catch (e) {
        setError("Failed to load property");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const latNum = Number.parseFloat(formData.lat);
      const lngNum = Number.parseFloat(formData.lng);
      const body = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        type: formData.type,
        listingType: formData.listingType,
        location: {
          address: formData.address,
          city: formData.city,
          region: formData.region,
          coordinates: { lat: latNum, lng: lngNum },
        },
        specifications: {
          bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
          bathrooms: formData.bathrooms
            ? Number(formData.bathrooms)
            : undefined,
          area: Number(formData.area),
          yearBuilt: formData.yearBuilt
            ? Number(formData.yearBuilt)
            : undefined,
        },
        amenities: String(formData.amenities)
          .split(",")
          .map((a: string) => a.trim())
          .filter(Boolean),
        images: String(formData.images)
          .split(",")
          .map((i: string) => i.trim())
          .filter(Boolean),
        vrTourUrl: formData.vrTourUrl || undefined,
      };
      await axios.put(`/api/properties/${id}`, body);
      router.push("/admin/properties");
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.error || "Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Property</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Listing Type</Label>
                <Select
                  value={formData.listingType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, listingType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <Input
                      value={formData.region}
                      onChange={(e) =>
                        setFormData({ ...formData, region: e.target.value })
                      }
                    />
                  </div>
                </div>
                <CoordinatePicker
                  lat={formData.lat}
                  lng={formData.lng}
                  onChange={handleCoordsChange}
                  onResolve={handleResolve}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <Input
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bedrooms: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bathrooms</Label>
                  <Input
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bathrooms: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Area</Label>
                  <Input
                    type="number"
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year Built</Label>
                  <Input
                    value={formData.yearBuilt}
                    onChange={(e) =>
                      setFormData({ ...formData, yearBuilt: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Amenities (comma-separated)</Label>
                <Input
                  value={formData.amenities}
                  onChange={(e) =>
                    setFormData({ ...formData, amenities: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Images (comma-separated URLs)</Label>
                <Input
                  value={formData.images}
                  onChange={(e) =>
                    setFormData({ ...formData, images: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>VR Tour Link</Label>
                <Input
                  value={formData.vrTourUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, vrTourUrl: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
