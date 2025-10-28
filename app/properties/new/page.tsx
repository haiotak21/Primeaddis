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
    // UI restyled to match provided design while preserving handlers and map component
    const mapRef = (node: HTMLDivElement | null) => {
      // no-op ref; used for potential scroll into view via button
      (window as any).__mapAnchor = node;
    };
    const scrollToMap = () => {
      const el: HTMLElement | null = (window as any).__mapAnchor;
      if (el && el.scrollIntoView)
        el.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    content = (
      <div className="min-h-screen bg-[#f4fafe]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-10 lg:px-20 py-8">
          <div className="mb-8">
            <p className="text-[#03063b] text-4xl font-black leading-tight tracking-[-0.033em]">
              Create Property
            </p>
            <p className="text-[#47739e] text-base mt-2">
              Add a new property to the marketplace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="rounded-xl border border-[#dfe6e9] bg-white p-6 shadow-sm">
              <h2 className="text-[#03063b] text-[22px] font-bold mb-6">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      Property Title
                    </p>
                    <input
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b8bff66]"
                      placeholder="Enter property title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      Price ($)
                    </p>
                    <input
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b8bff66]"
                      placeholder="Enter price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      Property Type
                    </p>
                    <select
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b8bff66] bg-white"
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
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      Description
                    </p>
                    <textarea
                      className="min-h-36 px-4 py-3 border border-[#dfe6e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b8bff66]"
                      placeholder="Add a detailed description of the property"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      Real Estate Agency
                    </p>
                    <select
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b8bff66] bg-white"
                      value={formData.realEstate}
                      onChange={(e) =>
                        setFormData({ ...formData, realEstate: e.target.value })
                      }
                    >
                      <option value="">Select agency</option>
                      {realEstates.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div>
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      Listing Type
                    </p>
                    <select
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b8bff66] bg-white"
                      value={formData.listingType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          listingType: e.target.value,
                        })
                      }
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      Amenities
                    </p>
                    <input
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b8bff66]"
                      placeholder="e.g., Swimming Pool, Gym, Garden"
                      value={formData.amenities}
                      onChange={(e) =>
                        setFormData({ ...formData, amenities: e.target.value })
                      }
                    />
                    <p className="text-[#47739e] text-sm mt-1.5">
                      Enter amenities separated by commas.
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-xl border border-[#dfe6e9] bg-white p-6 shadow-sm">
              <h2 className="text-[#03063b] text-[22px] font-bold mb-6">
                Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col gap-6">
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      Address
                    </p>
                    <input
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b8bff66]"
                      placeholder="e.g., 123 Main Street"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      City
                    </p>
                    <input
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b8bff66]"
                      placeholder="e.g., Addis Ababa"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      State/Region
                    </p>
                    <input
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b8bff66]"
                      placeholder="e.g., Addis Ababa"
                      value={formData.region}
                      onChange={(e) =>
                        setFormData({ ...formData, region: e.target.value })
                      }
                      required
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={scrollToMap}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b8bff]/10 px-4 py-2.5 text-sm font-semibold text-[#0b8bff] transition-colors hover:bg-[#0b8bff]/20"
                  >
                    <span className="material-symbols-outlined text-base">
                      add_location_alt
                    </span>
                    Add from map
                  </button>
                  <div ref={mapRef}>
                    <CoordinatePicker
                      lat={formData.lat}
                      lng={formData.lng}
                      onChange={handleCoordsChange}
                      onResolve={handleResolve}
                    />
                  </div>
                  <p className="text-xs text-[#47739e] text-center">
                    Click on the location in Ethiopia to set coordinates
                    automatically.
                  </p>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-6">
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      Latitude
                    </p>
                    <input
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg bg-gray-100"
                      readOnly
                      value={formData.lat}
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      Longitude
                    </p>
                    <input
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg bg-gray-100"
                      readOnly
                      value={formData.lng}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="rounded-xl border border-[#dfe6e9] bg-white p-6 shadow-sm">
              <h2 className="text-[#03063b] text-[22px] font-bold mb-6">
                Specifications
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <label className="flex flex-col">
                  <p className="text-[#03063b] text-base font-medium pb-2">
                    Bedrooms
                  </p>
                  <input
                    className="h-12 px-4 border border-[#dfe6e9] rounded-lg"
                    placeholder="e.g., 3"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bedrooms: e.target.value })
                    }
                  />
                </label>
                <label className="flex flex-col">
                  <p className="text-[#03063b] text-base font-medium pb-2">
                    Bathrooms
                  </p>
                  <input
                    className="h-12 px-4 border border-[#dfe6e9] rounded-lg"
                    placeholder="e.g., 2"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bathrooms: e.target.value })
                    }
                  />
                </label>
                <label className="flex flex-col">
                  <p className="text-[#03063b] text-base font-medium pb-2">
                    Area (sq ft)
                  </p>
                  <input
                    className="h-12 px-4 border border-[#dfe6e9] rounded-lg"
                    placeholder="e.g., 1800"
                    type="number"
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                    required
                  />
                </label>
                <label className="flex flex-col">
                  <p className="text-[#03063b] text-base font-medium pb-2">
                    Year Built
                  </p>
                  <input
                    className="h-12 px-4 border border-[#dfe6e9] rounded-lg"
                    placeholder="e.g., 2015"
                    type="number"
                    value={formData.yearBuilt}
                    onChange={(e) =>
                      setFormData({ ...formData, yearBuilt: e.target.value })
                    }
                  />
                </label>
              </div>
            </div>

            {/* Media */}
            <div className="rounded-xl border border-[#dfe6e9] bg-white p-6 shadow-sm">
              <h2 className="text-[#03063b] text-[22px] font-bold mb-6">
                Media
              </h2>
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-[#03063b] text-base font-medium pb-2">
                    Property Images
                  </p>
                  <div className="flex justify-center items-center w-full">
                    {/* Keep existing FileUpload behavior within a dropzone-styled container */}
                    <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#dfe6e9] border-dashed rounded-lg cursor-pointer bg-[#f4fafe]/30 hover:bg-[#f4fafe]/60">
                      <FileUpload eventName="file-upload:change" multiple />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      Property Image Insert URL
                    </p>
                    <input
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imagesUrlInput}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          imagesUrlInput: e.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      Video URL{" "}
                      <span className="text-[#47739e] font-normal">
                        (Optional)
                      </span>
                    </p>
                    <input
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg"
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, videoUrl: e.target.value })
                      }
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#03063b] text-base font-medium pb-2">
                      VR Tour Link{" "}
                      <span className="text-[#47739e] font-normal">
                        (Optional)
                      </span>
                    </p>
                    <input
                      className="h-12 px-4 border border-[#dfe6e9] rounded-lg"
                      placeholder="https://example.com/vr-tour"
                      value={formData.vrTourUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, vrTourUrl: e.target.value })
                      }
                    />
                  </label>
                </div>

                {/* Thumbnails preview */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {((formData.imagesUrlInput &&
                    formData.imagesUrlInput.split(",").filter(Boolean).length >
                      0) ||
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
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto rounded-lg bg-[#0b8bff] hover:bg-[#0b8bff]/90 text-white px-8 py-3"
              >
                {loading ? "Creating..." : "Create Property"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto border border-[#dfe6e9] text-[#47739e] px-8 py-3"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  return content;
}
