"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Scan,
  Heart,
  ArrowRightLeft,
} from "lucide-react";
import { useCompare } from "@/contexts/compare-context";
import CurrencyAmount from "@/components/common/currency-amount";
import type { IProperty } from "@/models";
import PropertyCardFooter from "@/components/properties/property-card-footer";
import { useMemo, useState } from "react";
import { toSlug } from "@/lib/slugify";
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
  const statusVal = (property as any).status as string | undefined;
  const isInactive = statusVal === "sold" || statusVal === "rented";
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(property._id as string);

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
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col w-full max-w-sm mx-auto">
      {/* IMAGE SECTION - Hero aspect ratio */}
      <div className="relative aspect-[3/2] w-full bg-gray-200 overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={img}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

        {/* Status Badge (Top Left) */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {(() => {
            const st = (property as any).status;
            if (st === "sold") {
              return (
                <span
                  className={`bg-white/95 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded shadow-sm text-gray-900 flex items-center gap-1.5 uppercase tracking-wide`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  SOLD
                </span>
              );
            }
            if (st === "rented") {
              return (
                <span
                  className={`bg-white/95 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded shadow-sm text-gray-900 flex items-center gap-1.5 uppercase tracking-wide`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                  RENTED
                </span>
              );
            }
            return (
              <span
                className={`bg-white/95 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded shadow-sm text-gray-900 flex items-center gap-1.5 uppercase tracking-wide`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    property.listingType === "sale"
                      ? "bg-red-600"
                      : "bg-purple-600"
                  }`}
                />
                {forText.toUpperCase()}
              </span>
            );
          })()}
          {property.vrTourUrl && (
            <span className="bg-indigo-600/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded shadow-sm text-white uppercase tracking-wide">
              3D Tour
            </span>
          )}
        </div>

        {/* Save Icon (Top Right) */}
        <button
          onClick={onSave}
          className="absolute top-3 right-3 p-1.5 rounded-full transition-all duration-200 hover:bg-black/20 active:scale-95 focus:outline-none"
        >
          <Heart
            className={`w-7 h-7 filter drop-shadow-md ${
              saved
                ? "fill-red-500 text-red-500"
                : "text-white fill-black/40 hover:fill-red-500/50"
            }`}
            strokeWidth={2}
          />
        </button>

        {/* Broker Name (Bottom Left on Image) */}
        {property.listedBy?.name && (
          <div className="absolute bottom-2 left-3 text-[10px] text-white font-medium uppercase tracking-wider drop-shadow-md opacity-90">
            {property.listedBy?.name}
          </div>
        )}
      </div>

      {/* CONTENT SECTION */}
      <div className="flex flex-col flex-grow">
        <div className="px-4 pt-3 pb-2">
          {/* Price & Stats Row */}
          <div className="flex items-baseline justify-between mb-1">
            {(() => {
              const st = (property as any).status;
              const isInactive = st === "sold" || st === "rented";
              return (
                <>
                  <span
                    className={`text-2xl font-bold ${
                      isInactive
                        ? "text-gray-400 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    <CurrencyAmount amountUsd={property.price} />
                  </span>
                  {isInactive && (
                    <span
                      className={`text-sm font-bold uppercase tracking-wide ${
                        st === "sold" ? "text-red-600" : "text-red-600"
                      }`}
                    >
                      {st === "sold" ? "SOLD" : "RENTED"}
                    </span>
                  )}
                </>
              );
            })()}
          </div>

          {/* Specs Row */}
          <div className="flex items-center text-gray-700 text-sm mb-1.5">
            <span className="font-bold text-gray-900">
              {property.specifications?.bedrooms ?? 0}
            </span>{" "}
            <span className="ml-1 mr-2 text-gray-600">bds</span>
            <span className="text-gray-300 mx-1">|</span>
            <span className="font-bold text-gray-900 ml-1">
              {property.specifications?.bathrooms ?? 0}
            </span>{" "}
            <span className="ml-1 mr-2 text-gray-600">ba</span>
            <span className="text-gray-300 mx-1">|</span>
            <span className="font-bold text-gray-900 ml-1">
              {property.specifications?.area ?? 0}
            </span>{" "}
            <span className="ml-1 text-gray-600">sqft</span>
            <span className="text-gray-300 mx-2">-</span>
            <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">
              {property.listingType}
            </span>
          </div>

          {/* Address */}
          <div className="text-sm text-gray-500 truncate">
            {property.title} — {property.location?.city},{" "}
            {property.location?.region}
          </div>
        </div>

        {/* ACTION BUTTONS FOOTER */}
        <div className="mt-auto px-4 py-3 border-t border-gray-100 bg-gray-50/50 grid grid-cols-[auto_1fr] gap-3">
          {/* Compare Button */}
          <button
            disabled={isInactive}
            onClick={(e) => {
              if (isInactive) return;
              e.preventDefault();
              e.stopPropagation();
              if (inCompare) removeFromCompare(property._id as string);
              else addToCompare(property as any);
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
              inCompare
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            } ${
              isInactive
                ? "opacity-60 cursor-not-allowed pointer-events-none"
                : ""
            }`}
            title="Compare Property"
            aria-disabled={isInactive}
          >
            <ArrowRightLeft
              className={`w-3.5 h-3.5 ${
                inCompare ? "text-blue-600" : "text-gray-400"
              }`}
            />
            <span className="hidden sm:inline">
              {inCompare ? "Added" : "Compare"}
            </span>
          </button>

          {/* Main Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/properties/${toSlug(
                `${property.title} ${property.location?.city || ""} ${
                  property.location?.region || ""
                }`
              )}`}
              onClick={(e) => {
                if (isInactive) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              className={`flex items-center justify-center px-3 py-2 bg-white border border-blue-600 text-blue-600 text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-blue-50 transition-colors ${
                isInactive
                  ? "opacity-60 cursor-not-allowed pointer-events-none"
                  : ""
              }`}
              aria-disabled={isInactive}
            >
              Contact
            </Link>
            <Link
              href={`/properties/${toSlug(
                `${property.title} ${property.location?.city || ""} ${
                  property.location?.region || ""
                }`
              )}`}
              onClick={(e) => {
                if (isInactive) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              className={`flex items-center justify-center px-3 py-2 bg-blue-600 border border-blue-600 text-white text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-blue-700 transition-colors shadow-sm ${
                isInactive
                  ? "opacity-60 cursor-not-allowed pointer-events-none"
                  : ""
              }`}
              aria-disabled={isInactive}
            >
              Details
            </Link>
          </div>
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
  );
}
