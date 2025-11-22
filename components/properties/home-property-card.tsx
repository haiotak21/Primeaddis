"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, BedDouble, Bath, Ruler, Scan, Heart } from "lucide-react";
import type { IProperty } from "@/models";
import { useCurrency } from "@/contexts/currency-context";
import { toSlug } from "@/lib/slugify";
import { SessionProvider } from "@/components/providers/session-provider";
import { useCompare } from "@/contexts/compare-context";
import { useState } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  property: IProperty;
};

export function HomePropertyCard({ property }: Props) {
  // Wrap the interactive bits in an inner component that consumes next-auth's
  // `useSession`. Some render paths were mounting this component outside the
  // expected provider tree which caused `useSession` to throw. Wrapping the
  // inner client consumer with our local `SessionProvider` ensures the hook
  // always has a provider.
  return (
    <SessionProvider>
      <HomePropertyCardInner property={property} />
    </SessionProvider>
  );
}

function HomePropertyCardInner({ property }: Props) {
  const { format } = useCurrency();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const img = property.images?.[0];
  const price = format(property.price);
  const forText = property.listingType === "sale" ? "For Sale" : "For Rent";
  const inCompare = isInCompare(property._id as string);
  const { data: session } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) removeFromCompare(property._id as string);
    else addToCompare(property);
  };

  const onFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      const callback =
        typeof window !== "undefined" ? window.location.href : "/";
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
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Failed to save favorite.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
        <div className="relative w-full h-36 sm:h-56">
          {img && (
            <Image
              src={img}
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
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
          {property.vrTourUrl && (
            <span className="absolute top-4 right-4 bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center">
              <Scan className="size-3 mr-1" /> VR Tour
            </span>
          )}
        </div>

        <div className="p-3.5 sm:p-6 flex-grow flex flex-col">
          <h3 className="text-[13px] sm:text-xl font-bold text-gray-800 dark:text-white mb-1 truncate">
            {property.title}
          </h3>
          <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-4 flex items-center">
            <MapPin className="size-4 mr-1" />
            {property.location?.city}, {property.location?.region}
          </p>

          <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 border-t border-b border-gray-200 dark:border-gray-700 py-2 sm:py-3 mb-2 sm:mb-4">
            <div className="flex items-center text-[11px] sm:text-sm">
              <BedDouble className="mr-2 size-4 sm:size-5 text-gray-500" />
              <span>
                {property.specifications?.bedrooms ?? 0}
                <span className="sm:hidden">bds</span>
                <span className="hidden sm:inline"> beds</span>
              </span>
            </div>
            <div className="flex items-center text-[11px] sm:text-sm">
              <Bath className="mr-2 size-4 sm:size-5 text-gray-500" />
              <span>
                {property.specifications?.bathrooms ?? 0}
                <span className="sm:hidden">ba</span>
                <span className="hidden sm:inline"> baths</span>
              </span>
            </div>
            <div className="flex items-center text-[11px] sm:text-sm">
              <Ruler className="mr-2 size-4 sm:size-5 text-gray-500" />
              <span>
                {property.specifications?.area ?? 0}
                <span className="sm:hidden">sqft</span>
                <span className="hidden sm:inline"> sq ft</span>
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-3.5 sm:mb-5">
            <p className="text-lg sm:text-2xl font-bold text-primary dark:text-white">
              {price}
            </p>
            <button
              onClick={onCompare}
              className="flex items-center text-[11px] sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1.5 rounded-md"
            >
              {/* compare arrows icon replacement */}
              <Scan className="size-3 sm:size-4 mr-1" />
              {inCompare ? "Added" : "Compare"}
            </button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onFavorite}
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
          </div>

          <Link
            href={`/properties/${toSlug(
              `${property.title} ${property.location?.city || ""} ${
                property.location?.region || ""
              }`
            )}`}
            className="block w-full text-center bg-primary text-white font-semibold py-2 sm:py-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors mt-auto text-sm sm:text-base"
          >
            View Property Details
          </Link>
        </div>
      </div>
      {/* No modal; logged-out users go to signup, logged-in users save instantly. */}
    </>
  );
}
