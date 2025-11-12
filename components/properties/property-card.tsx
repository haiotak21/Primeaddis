"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, BedDouble, Bath, Ruler, Scan, Heart } from "lucide-react";
import CurrencyAmount from "@/components/common/currency-amount";
import { CompareButton } from "@/components/properties/compare-button";
import type { IProperty } from "@/models";
import PropertyCardFooter from "@/components/properties/property-card-footer";
import { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface PropertyCardProps {
  property: IProperty & { listedBy?: { name: string; profileImage?: string } };
  compactSpecs?: boolean; // reduce spec-row text size (used on properties page only)
}

export function PropertyCard({ property, compactSpecs }: PropertyCardProps) {
  const img = property.images?.[0] || "/placeholder.svg?height=200&width=400";
  const forText = property.listingType === "sale" ? "For Sale" : "For Rent";
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      const callback =
        typeof window !== "undefined" ? window.location.href : "/properties";
      router.push(`/auth/signup?callbackUrl=${encodeURIComponent(callback)}`);
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await axios.post("/api/users/favorites", { propertyId: property._id });
      setSaved(true);
      toast({ title: "Saved", description: "Property added to favorites." });
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to save favorite.";
      toast({ title: "Error", description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
        <Link
          href={`/properties/${property._id}`}
          className="relative w-full h-48 sm:h-56 block"
        >
          <Image src={img} alt={property.title} fill className="object-cover" />
          {/* For Sale / For Rent */}
          <span
            className={`absolute top-4 left-4 text-white text-xs font-semibold px-3 py-1 rounded-full ${
              property.listingType === "sale" ? "bg-green-500" : "bg-blue-500"
            }`}
          >
            {forText}
          </span>
          {property.featured && (
            <span className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Featured
            </span>
          )}
          {/* VR badge */}
          {property.vrTourUrl && (
            <span className="absolute top-4 right-4 bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center">
              <Scan className="size-3 mr-1" /> VR Tour
            </span>
          )}
        </Link>

        <div className="p-3 sm:p-6 flex-grow flex flex-col">
          <Link href={`/properties/${property._id}`} className="block">
            <h3 className="text-[13px] sm:text-xl font-bold text-gray-800 dark:text-white mb-1 truncate">
              {property.title}
            </h3>
            <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-4 flex items-center">
              <MapPin className="size-4 mr-1" />
              {property.location?.city}, {property.location?.region}
            </p>

            {/* Specs bar */}
            <div className="spec-row flex items-center justify-between text-gray-700 dark:text-gray-300 border-t border-b border-gray-200 dark:border-gray-700 py-1.5 sm:py-3 mb-2 sm:mb-4">
              <div
                className={`spec-item flex items-center ${
                  compactSpecs
                    ? "text-[10px] sm:text-xs"
                    : "text-[11px] sm:text-sm"
                }`}
              >
                <BedDouble className="mr-2 size-4 sm:size-5 text-gray-500" />
                <span>
                  {property.specifications?.bedrooms ?? 0}
                  <span className="sm:hidden"> bds</span>
                  <span className="hidden sm:inline"> beds</span>
                </span>
              </div>
              <div
                className={`spec-item flex items-center ${
                  compactSpecs
                    ? "text-[10px] sm:text-xs"
                    : "text-[11px] sm:text-sm"
                }`}
              >
                <Bath className="mr-2 size-4 sm:size-5 text-gray-500" />
                <span>
                  {property.specifications?.bathrooms ?? 0}
                  <span className="sm:hidden"> ba</span>
                  <span className="hidden sm:inline"> baths</span>
                </span>
              </div>
              <div
                className={`spec-item flex items-center ${
                  compactSpecs
                    ? "text-[10px] sm:text-xs"
                    : "text-[11px] sm:text-sm"
                }`}
              >
                <Ruler className="mr-2 size-4 sm:size-5 text-gray-500" />
                <span>
                  {property.specifications?.area ?? 0}
                  <span className="sm:hidden"> sqft</span>
                  <span className="hidden sm:inline"> sq ft</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Price + Compare */}
          <div className="flex justify-between items-center mb-3 sm:mb-5">
            <p className="text-lg sm:text-2xl font-bold text-primary dark:text-white">
              <CurrencyAmount amountUsd={property.price} />
            </p>
            {/* Keep existing CompareButton functionality */}
            <div className="[&_button]:!border [&_button]:!border-gray-300 dark:[&_button]:!border-gray-600 [&_button]:!px-2 sm:[&_button]:!px-3 [&_button]:!py-1.5 [&_button]:!text-[11px] sm:[&_button]:!text-sm [&_button]:!rounded-md [&_button]:!text-gray-600 dark:[&_button]:!text-gray-300 [&_button:hover]:!text-primary dark:[&_button:hover]:!text-white">
              <CompareButton
                property={property}
                size="sm"
                labels={{ add: "Compare", added: "Added" }}
              />
            </div>
          </div>

          {/* CTA row */}
          <div className="mt-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSave}
              aria-pressed={saved}
              className="flex items-center"
            >
              <Heart
                className={`mr-1 h-4 w-4 transition-colors ${
                  saved
                    ? "fill-red-500 stroke-red-500"
                    : "stroke-gray-400 group-hover:stroke-red-500"
                }`}
              />
              <span className="text-sm">{saved ? "Saved" : "Save"}</span>
            </Button>
            <Link
              href={`/properties/${property._id}`}
              className="flex-1 text-center bg-primary text-white font-semibold py-2 sm:py-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
            >
              View Details
            </Link>
          </div>
        </div>

        {/* Listed by footer preserved */}
        <div className="border-t p-3 sm:p-4">
          <PropertyCardFooter
            propertyId={String(property._id)}
            listedBy={property.listedBy}
          />
        </div>
      </div>
      {/* No modal needed anymore. Logged-out users are redirected to signup, logged-in users save immediately. */}
    </>
  );
}
