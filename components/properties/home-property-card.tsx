"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Scan,
  Heart,
  ArrowRightLeft,
} from "lucide-react";
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
import { useEffect } from "react";

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
  const [globalWhatsapp, setGlobalWhatsapp] = useState<string | null>(null);
  const statusVal = (property as any).status as string | undefined;
  const isInactive = statusVal === "sold" || statusVal === "rented";

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

  // Fetch global WhatsApp number once (admin-configured)
  useEffect(() => {
    let mounted = true;
    async function fetchWhatsapp() {
      try {
        const res = await fetch("/api/admin/settings/whatsapp");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data?.whatsappNumber) {
          const digits = String(data.whatsappNumber).replace(/\D/g, "");
          setGlobalWhatsapp(digits || null);
        }
      } catch (err) {
        // ignore
      }
    }
    fetchWhatsapp();
    return () => {
      mounted = false;
    };
  }, []);

  const onContactClick = (e: React.MouseEvent) => {
    if (isInactive) {
      // prevent interaction when property is sold/rented
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    // prefer global whatsapp number, fallback to listedBy.phone
    const agentPhone = (property as any)?.listedBy?.phone
      ? String((property as any).listedBy.phone).replace(/\D/g, "")
      : null;
    const targetNumber =
      globalWhatsapp && globalWhatsapp.length > 0 ? globalWhatsapp : agentPhone;
    if (!targetNumber) {
      toast({
        title: "WhatsApp contact unavailable",
        description: "No WhatsApp number is configured for this listing.",
      });
      return;
    }
    const locationSlug = toSlug(
      `${property.title} ${property.location?.city || ""} ${
        property.location?.region || ""
      }`
    );
    const propertyUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/properties/${locationSlug}`
        : `/properties/${locationSlug}`;
    const whatsappMessage = encodeURIComponent(
      `Hello, I'm interested in your property: ${property.title}. Here is the listing link: ${propertyUrl}`
    );
    const href = `https://wa.me/${targetNumber}?text=${whatsappMessage}`;
    window.open(href, "_blank");
  };

  return (
    <>
      <div className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col w-full">
        <div className="relative aspect-[3/2] w-full bg-gray-200 overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            {img && (
              <Image
                src={img}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

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

          <button
            onClick={onFavorite}
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

          {property.featured && (
            <span className="absolute top-3 right-12 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Featured
            </span>
          )}

          {property.listedBy?.name && (
            <div className="absolute bottom-2 left-3 text-[10px] text-white font-medium uppercase tracking-wider drop-shadow-md opacity-90">
              {property.listedBy?.name}
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow">
          <div className="px-4 pt-3 pb-2">
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
                      {price}
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
            </div>

            <div className="text-sm text-gray-500 truncate">
              {property.title} — {property.location?.city},{" "}
              {property.location?.region}
            </div>
          </div>

          <div className="mt-auto px-4 py-3 border-t border-gray-100 bg-gray-50/50 grid grid-cols-[auto_1fr] gap-3">
            <div>
              <button
                onClick={onCompare}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  inCompare
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
                title="Compare Property"
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
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onContactClick}
                disabled={isInactive}
                className={`flex items-center justify-center px-4 py-2 h-10 bg-white border border-blue-600 text-blue-600 text-sm font-bold uppercase tracking-wide rounded-lg hover:bg-blue-50 transition-colors ${
                  isInactive
                    ? "opacity-60 cursor-not-allowed pointer-events-none"
                    : ""
                }`}
                aria-label={`Contact about ${property.title} via WhatsApp`}
                aria-disabled={isInactive}
              >
                Contact
              </button>
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
                className={`flex items-center justify-center px-4 py-2 h-10 bg-blue-600 border border-blue-600 text-white text-sm font-bold uppercase tracking-wide rounded-lg hover:bg-blue-700 transition-colors shadow-sm ${
                  isInactive
                    ? "opacity-60 cursor-not-allowed pointer-events-none"
                    : ""
                }`}
                aria-disabled={isInactive}
              >
                DETAIL
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
