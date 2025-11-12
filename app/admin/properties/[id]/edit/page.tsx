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
          financing: Array.isArray(p.financing) ? p.financing.join(", ") : "",
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
        financing: String(formData.financing)
          .split(",")
          .map((b: string) => b.trim())
          .filter(Boolean),
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

  // Styled UI to match provided design while preserving logic and map component
  const mapAnchorRef = (node: HTMLDivElement | null) => {
    (window as any).__editMapAnchor = node;
  };
  const scrollToMap = () => {
    const el: HTMLElement | null = (window as any).__editMapAnchor;
    if (el && el.scrollIntoView)
      el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen bg-[#f4fafe] dark:bg-[#0f1923] dark:text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-[#03063b] dark:text-white text-4xl font-black leading-tight tracking-tight">
            Edit Property
          </h1>
        </div>

        <form onSubmit={onSave} className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-900/30 border border-[#dfe6e9] dark:border-primary/20 p-6 rounded-xl shadow-sm">
            <h3 className="text-[#03063b] dark:text-white text-lg font-bold mb-6">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="flex flex-col w-full">
                  <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                    Property Title
                  </p>
                  <input
                    className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white focus:border-[#0b8bff] focus:ring-[#0b8bff]/50 placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex flex-col w-full">
                  <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                    Description
                  </p>
                  <textarea
                    className="min-h-32 p-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white focus:border-[#0b8bff] focus:ring-[#0b8bff]/50 placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </label>
              </div>
              <div>
                <label className="flex flex-col w-full">
                  <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                    Price ($)
                  </p>
                  <input
                    type="number"
                    className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white focus:border-[#0b8bff] focus:ring-[#0b8bff]/50 placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </label>
              </div>
              <div>
                <label className="flex flex-col w-full">
                  <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                    Property Type
                  </p>
                  <select
                    className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white focus:border-[#0b8bff] focus:ring-[#0b8bff]/50"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="land">Land</option>
                    <option value="office">Office</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex flex-col w-full">
                  <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                    Listing Type
                  </p>
                  <select
                    className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white focus:border-[#0b8bff] focus:ring-[#0b8bff]/50"
                    value={formData.listingType}
                    onChange={(e) =>
                      setFormData({ ...formData, listingType: e.target.value })
                    }
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-gray-900/30 border border-[#dfe6e9] dark:border-primary/20 p-6 rounded-xl shadow-sm">
            <h3 className="text-[#03063b] dark:text-white text-lg font-bold mb-6">
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex flex-col w-full">
                  <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                    Address
                  </p>
                  <input
                    className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white focus:border-[#0b8bff] focus:ring-[#0b8bff]/50 placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </label>
              </div>
              <div>
                <label className="flex flex-col w-full">
                  <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                    City
                  </p>
                  <input
                    className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white focus:border-[#0b8bff] focus:ring-[#0b8bff]/50 placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex flex-col w-full">
                  <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                    Region
                  </p>
                  <input
                    className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white focus:border-[#0b8bff] focus:ring-[#0b8bff]/50 placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                  />
                </label>
              </div>
              <div className="md:col-span-2">
                <div ref={mapAnchorRef}>
                  <CoordinatePicker
                    lat={formData.lat}
                    lng={formData.lng}
                    onChange={handleCoordsChange}
                    onResolve={handleResolve}
                  />
                </div>
                <p className="text-gray-500 dark:text-[#a0b3c6] text-sm mt-2">
                  Click on the location in Ethiopia to fill coordinates
                  automatically.
                </p>
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToMap}
                  className="flex-1 text-white bg-[#0b8bff] dark:bg-primary hover:bg-[#0b8bff]/90 dark:hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-[#0b8bff]/30 font-medium rounded-lg text-sm px-5 py-3 text-center"
                >
                  Add from map
                </button>
                <button
                  type="button"
                  onClick={() => scrollToMap()}
                  className="flex-1 text-[#0b8bff] dark:text-primary bg-[#0b8bff]/10 dark:bg-primary/20 hover:bg-[#0b8bff]/20 dark:hover:bg-primary/30 focus:ring-4 focus:outline-none focus:ring-[#0b8bff]/30 font-medium rounded-lg text-sm px-5 py-3 text-center"
                >
                  Add manually
                </button>
              </div>
            </div>
          </div>

          {/* Specifications & Amenities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900/30 border border-[#dfe6e9] dark:border-primary/20 p-6 rounded-xl shadow-sm">
              <h3 className="text-[#03063b] dark:text-white text-lg font-bold mb-6">
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="flex flex-col w-full">
                    <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                      Bedrooms
                    </p>
                    <input
                      className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bedrooms: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div>
                  <label className="flex flex-col w-full">
                    <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                      Bathrooms
                    </p>
                    <input
                      className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bathrooms: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div>
                  <label className="flex flex-col w-full">
                    <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                      Area (sqft)
                    </p>
                    <input
                      className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                      type="number"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div>
                  <label className="flex flex-col w-full">
                    <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                      Year Built
                    </p>
                    <input
                      className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                      type="number"
                      value={formData.yearBuilt}
                      onChange={(e) =>
                        setFormData({ ...formData, yearBuilt: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900/30 border border-[#dfe6e9] dark:border-primary/20 p-6 rounded-xl shadow-sm">
              <h3 className="text-[#03063b] dark:text-white text-lg font-bold mb-6">
                Amenities
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="flex flex-col w-full">
                    <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                      Amenities (comma-separated)
                    </p>
                    <input
                      className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                      value={formData.amenities}
                      onChange={(e) =>
                        setFormData({ ...formData, amenities: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div>
                  <label className="flex flex-col w-full">
                    <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                      Available Banks / Financing (comma-separated)
                    </p>
                    <input
                      className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                      value={formData.financing || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, financing: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white dark:bg-gray-900/30 border border-[#dfe6e9] dark:border-primary/20 p-6 rounded-xl shadow-sm">
            <h3 className="text-[#03063b] dark:text-white text-lg font-bold mb-6">
              Media
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="flex flex-col w-full">
                  <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                    Images (comma-separated URLs)
                  </p>
                  <input
                    className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                    value={formData.images}
                    onChange={(e) =>
                      setFormData({ ...formData, images: e.target.value })
                    }
                  />
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex flex-col w-full">
                  <p className="text-[#03063b] dark:text-white text-base font-medium pb-2">
                    VR Tour Link
                  </p>
                  <input
                    className="h-12 px-4 rounded-lg border border-gray-300 dark:border-[#2c3e50] bg-[#f4fafe] dark:bg-[#2c3e50] dark:text-white placeholder:text-[#47739e] dark:placeholder:text-[#a0b3c6]"
                    value={formData.vrTourUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, vrTourUrl: e.target.value })
                    }
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-8 py-3 rounded-lg border border-[#dfe6e9] dark:border-[#2c3e50] text-[#47739e] dark:text-[#a0b3c6] hover:bg-white/60 dark:hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#0b8bff] dark:bg-primary hover:bg-[#0b8bff]/90 dark:hover:bg-primary/90 text-white px-8 py-3 rounded-lg"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
