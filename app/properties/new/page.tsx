"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CoordinatePicker from "@/components/properties/coordinate-picker";
import { FileUpload } from "@/components/ui/file-upload";
export default function NewPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    type: "house",
    listingType: "sale",
    address: "",
    city: "",
    region: "",
    lat: "",
    lng: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    yearBuilt: "",
    amenities: "",
    images: [] as string[], // Now an array of URLs
    imagesUrlInput: "",
    videoUrl: "",
    vrTourUrl: "",
    realEstate: "",
  });

  // Handle file upload via custom event from FileUpload -> upload to API -> store returned URLs
  useEffect(() => {
    const handler = async (e: any) => {
      const files: File[] = e?.detail?.files || [];
      if (!files.length) return;
      try {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        if (!res.ok)
          throw new Error((await res.json())?.error || "Upload failed");
        const data = await res.json();
        const urls: string[] = (data.uploads || [])
          .map((u: any) => u.url)
          .filter(Boolean);
        if (urls.length) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...urls],
          }));
        }
      } catch (err: any) {
        console.error("Upload error:", err?.message || err);
        setError("Image upload failed. Please try again.");
      }
    };
    window.addEventListener("file-upload:change", handler as any);
    return () =>
      window.removeEventListener("file-upload:change", handler as any);
  }, [setFormData]);

  // Real estate agencies for dropdown
  const [realEstates, setRealEstates] = useState<
    { _id: string; name: string }[]
  >([]);
  useEffect(() => {
    axios.get("/api/realestates?limit=50").then((res) => {
      setRealEstates(res.data.realEstates || []);
    });
  }, []);

  // Redirect unauthenticated users using an effect to avoid setState during render
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  // Hoisted handler to avoid "Cannot access before initialization"
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Quick client-side validations matching server rules (with friendlier messages)
      if (!formData.title || formData.title.trim().length < 5) {
        setLoading(false);
        setError("Title must be at least 5 characters.");
        return;
      }
      if (!formData.description || formData.description.trim().length < 20) {
        setLoading(false);
        setError("Description must be at least 20 characters.");
        return;
      }
      if (!formData.address || formData.address.trim().length < 2) {
        setLoading(false);
        setError("Address is required (at least 2 characters).");
        return;
      }
      if (!formData.city || formData.city.trim().length < 2) {
        setLoading(false);
        setError("City is required (at least 2 characters).");
        return;
      }
      if (!formData.region || formData.region.trim().length < 2) {
        setLoading(false);
        setError("Region is required (at least 2 characters).");
        return;
      }
      // Combine URLs from input and uploaded files
      let imagesArr: string[] = [];
      if (formData.imagesUrlInput) {
        imagesArr = formData.imagesUrlInput
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean);
      }
      if (formData.images && Array.isArray(formData.images)) {
        imagesArr = imagesArr.concat(formData.images);
      }
      if (imagesArr.length < 1) {
        setLoading(false);
        setError("Please add at least one image (URL or upload).");
        return;
      }

      // Ethiopia bounds (must match server)
      const ETH_BOUNDS = {
        minLat: 3.4,
        maxLat: 14.9,
        minLng: 32.9,
        maxLng: 48.0,
      };

      const latNum = Number.parseFloat(formData.lat);
      const lngNum = Number.parseFloat(formData.lng);

      if (
        Number.isNaN(latNum) ||
        Number.isNaN(lngNum) ||
        latNum < ETH_BOUNDS.minLat ||
        latNum > ETH_BOUNDS.maxLat ||
        lngNum < ETH_BOUNDS.minLng ||
        lngNum > ETH_BOUNDS.maxLng
      ) {
        setLoading(false);
        setError(
          "Coordinates must be within Ethiopia. Latitude 3.4–14.9, Longitude 32.9–48.0. Try Addis Ababa (8.9806, 38.7578)."
        );
        return;
      }

      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        type: formData.type,
        listingType: formData.listingType,
        location: {
          address: formData.address,
          city: formData.city,
          region: formData.region,
          coordinates: {
            lat: latNum,
            lng: lngNum,
          },
        },
        specifications: {
          bedrooms: formData.bedrooms
            ? Number.parseInt(formData.bedrooms)
            : undefined,
          bathrooms: formData.bathrooms
            ? Number.parseInt(formData.bathrooms)
            : undefined,
          area: Number.parseFloat(formData.area),
          yearBuilt: formData.yearBuilt
            ? Number.parseInt(formData.yearBuilt)
            : undefined,
        },
        amenities: formData.amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        images: imagesArr,
        videoUrl: formData.videoUrl || undefined,
        vrTourUrl: formData.vrTourUrl || undefined,
        realEstate: formData.realEstate,
      };

      await axios.post("/api/properties", propertyData);
      router.push("/dashboard");
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.details && Array.isArray(data.details) && data.details.length) {
        const msg = data.details
          .map((d: any) => d.message || `${d.path?.join(".")}: invalid`)
          .join("\n");
        setError(data.error ? `${data.error}\n${msg}` : msg);
      } else {
        setError(data?.error || "Failed to create property");
      }
    } finally {
      setLoading(false);
    }
  }

  // Hoisted coordinate handlers
  function handleCoordsChange(lat: string, lng: string) {
    setFormData({ ...formData, lat, lng });
  }
  function handleResolve(v: {
    address?: string;
    city?: string;
    region?: string;
    lat: string;
    lng: string;
  }) {
    setFormData((prev) => ({
      ...prev,
      address: v.address || prev.address,
      city: v.city || prev.city,
      region: v.region || prev.region,
      lat: v.lat,
      lng: v.lng,
    }));
  }

  // Conditional rendering block
  let content;
  if (status === "loading" || status === "unauthenticated") {
    content = (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        {status === "loading" ? "Loading..." : "Redirecting to sign in..."}
      </div>
    );
  } else if (
    session &&
    !["agent", "admin", "superadmin"].includes(session.user.role)
  ) {
    content = (
      <div className="flex min-h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Only agents can create property listings.
          </AlertDescription>
        </Alert>
      </div>
    );
  } else {
    content = (
      <div className="min-h-screen bg-muted/40">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create Property Listing</h1>
            <p className="mt-2 text-muted-foreground">
              Add a new property to the marketplace
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Create Property</CardTitle>
              <CardDescription>
                Fill in the information about your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title</Label>
                  <Input
                    id="title"
                    placeholder="Beautiful 3BR House in Downtown"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="500000"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Property Type</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="realEstate">Real Estate Agency</Label>
                    <Select
                      value={formData.realEstate}
                      onValueChange={(value) =>
                        setFormData({ ...formData, realEstate: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select agency" />
                      </SelectTrigger>
                      <SelectContent>
                        {realEstates.map((r) => (
                          <SelectItem key={r._id} value={r._id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listingType">Listing Type</Label>
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
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main St"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Addis Ababa"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">State/Region</Label>
                      <Input
                        id="region"
                        placeholder="Addis Ababa"
                        value={formData.region}
                        onChange={(e) =>
                          setFormData({ ...formData, region: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <CoordinatePicker
                    lat={formData.lat}
                    lng={formData.lng}
                    onChange={handleCoordsChange}
                    onResolve={handleResolve}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ethiopia-only: Latitude 3.4–14.9, Longitude 32.9–48.0. Try
                    Addis Ababa (8.9806, 38.7578).
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Specifications</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        placeholder="3"
                        value={formData.bedrooms}
                        onChange={(e) =>
                          setFormData({ ...formData, bedrooms: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        placeholder="2"
                        value={formData.bathrooms}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bathrooms: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area">Area (sq ft)</Label>
                      <Input
                        id="area"
                        type="number"
                        placeholder="2000"
                        value={formData.area}
                        onChange={(e) =>
                          setFormData({ ...formData, area: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yearBuilt">Year Built</Label>
                      <Input
                        id="yearBuilt"
                        type="number"
                        placeholder="2020"
                        value={formData.yearBuilt}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            yearBuilt: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                  <Input
                    id="amenities"
                    placeholder="Pool, Gym, Parking, Garden"
                    value={formData.amenities}
                    onChange={(e) =>
                      setFormData({ ...formData, amenities: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Property Images</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="images"
                      placeholder="Paste image URLs, comma-separated"
                      value={formData.imagesUrlInput}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          imagesUrlInput: e.target.value,
                        }))
                      }
                    />
                    <FileUpload eventName="file-upload:change" multiple />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {((formData.imagesUrlInput &&
                      formData.imagesUrlInput.split(",").filter(Boolean)
                        .length > 0) ||
                      (formData.images && formData.images.length > 0)) &&
                      [
                        ...(formData.imagesUrlInput
                          ? formData.imagesUrlInput
                              .split(",")
                              .map((i) => i.trim())
                              .filter(Boolean)
                          : []),
                        ...(formData.images || []),
                      ].map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Property image ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded border"
                        />
                      ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL (optional)</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://your-video-provider.com/watch/xyz"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vrTourUrl">VR Tour Link (optional)</Label>
                  <Input
                    id="vrTourUrl"
                    type="url"
                    placeholder="https://your-vr-provider.com/tour/abc"
                    value={formData.vrTourUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, vrTourUrl: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Property"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return content;
}
