import Image from "next/image";
import { notFound } from "next/navigation";
import connectDB from "@/lib/database";
import Property from "@/models/Property";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactAgentForm } from "@/components/properties/contact-agent-form";
import { CompareButton } from "@/components/properties/compare-button";
import RequestSiteVisitClient from "@/components/properties/request-site-visit-client";
import { formatDate } from "@/utils/helpers";
import CurrencyAmount from "@/components/common/currency-amount";
// Removed SocialShareButtons from this page per request (only keep Compare button here)
import { MessageCircle } from "lucide-react";
import { ShareDialogButton } from "@/components/properties/share-dialog";
import MortgageCalculator from "@/components/properties/mortgage-calculator";
import { GalleryModalButton } from "@/components/properties/gallery-modal";

function isValidObjectId(id: string) {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
}

async function getProperty(id: string) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const property = await Property.findById(id)
    .populate("listedBy", "name email phone profileImage")
    .lean();
  return property;
}

async function getSimilarProperties(property: any) {
  if (!property) return [];
  // Find properties with same type and city, and price within ±20%
  const minPrice = property.price * 0.8;
  const maxPrice = property.price * 1.2;
  const query = {
    _id: { $ne: property._id },
    type: property.type,
    "location.city": property.location.city,
    price: { $gte: minPrice, $lte: maxPrice },
    status: "active",
  };
  await connectDB();
  const similar = await Property.find(query)
    .limit(4)
    .select("_id title price images location type")
    .lean();
  return similar;
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15: params is async; await it before usage
  const { id } = await params;
  if (!isValidObjectId(id)) {
    notFound();
  }

  const property = await getProperty(id);
  if (!property) {
    notFound();
  }
  const similarProperties = await getSimilarProperties(property);

  // Demo: Static nearby amenities by city
  const nearbyAmenities: Array<{
    type: string;
    name: string;
    address: string;
  }> = [];
  if (property.location.city === "Addis Ababa") {
    nearbyAmenities.push(
      {
        type: "School",
        name: "Addis International School",
        address: "Bole, Addis Ababa",
      },
      {
        type: "Hospital",
        name: "St. Gabriel Hospital",
        address: "Bole, Addis Ababa",
      },
      {
        type: "Transit",
        name: "Bole Airport",
        address: "Airport Rd, Addis Ababa",
      }
    );
  } else if (property.location.city === "Adama") {
    nearbyAmenities.push(
      {
        type: "School",
        name: "Adama Science School",
        address: "Main St, Adama",
      },
      {
        type: "Hospital",
        name: "Adama General Hospital",
        address: "Central Ave, Adama",
      },
      {
        type: "Transit",
        name: "Adama Bus Terminal",
        address: "Bus Station, Adama",
      }
    );
  }

  // Build WhatsApp link and property URL
  const baseUrl = process.env.NEXTAUTH_URL || "";
  const propertyUrl = baseUrl
    ? `${baseUrl}/properties/${property._id}`
    : `/properties/${property._id}`;
  const whatsappNumber = (property as any).listedBy?.phone?.replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(
    `Hello, I'm interested in your property: ${property.title}. Here is the listing link: ${propertyUrl}`
  );
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : null;

  // Serialize for client component boundaries
  const toStringIfObjectId = (val: any) =>
    val && typeof val === "object" && typeof val.toString === "function"
      ? val.toString()
      : val;
  const safeProperty = {
    ...property,
    _id: toStringIfObjectId(property._id),
    listedBy:
      (property as any).listedBy &&
      typeof (property as any).listedBy === "object"
        ? {
            ...(((property as any).listedBy as any)._id
              ? {
                  _id: toStringIfObjectId(
                    ((property as any).listedBy as any)._id
                  ),
                }
              : {}),
            name: (property as any).listedBy?.name,
            email: (property as any).listedBy?.email,
            profileImage: (property as any).listedBy?.profileImage,
          }
        : toStringIfObjectId((property as any).listedBy),
    realEstate: toStringIfObjectId((property as any).realEstate),
    featuredUntil: (property as any).featuredUntil
      ? new Date((property as any).featuredUntil).toISOString()
      : (property as any).featuredUntil,
    createdAt: (property as any).createdAt
      ? new Date((property as any).createdAt).toISOString()
      : (property as any).createdAt,
    updatedAt: (property as any).updatedAt
      ? new Date((property as any).updatedAt).toISOString()
      : (property as any).updatedAt,
  } as any;

  return (
    <div className="bg-[#f4fafe] text-[#03063b] min-h-screen">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Gallery - 4x2 grid with main image and thumbnails */}
        <div className="mb-8 @container">
          <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
            {/* Main Image */}
            <div className="col-span-4 md:col-span-2 row-span-2 rounded-xl overflow-hidden relative">
              <Image
                src={property.images?.[0] || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Top-right small */}
            <div className="hidden md:block col-span-1 row-span-1 rounded-xl overflow-hidden relative">
              <Image
                src={
                  property.images?.[1] ||
                  property.images?.[0] ||
                  "/placeholder.svg"
                }
                alt={`${property.title} photo 2`}
                fill
                className="object-cover"
              />
            </div>
            {/* Top-right small 2 */}
            <div className="hidden md:block col-span-1 row-span-1 rounded-xl overflow-hidden relative">
              <Image
                src={
                  property.images?.[2] ||
                  property.images?.[0] ||
                  "/placeholder.svg"
                }
                alt={`${property.title} photo 3`}
                fill
                className="object-cover"
              />
            </div>
            {/* Bottom-right wide with overlay */}
            <div className="hidden md:block col-span-2 row-span-1 rounded-xl overflow-hidden relative">
              <Image
                src={
                  property.images?.[3] ||
                  property.images?.[0] ||
                  "/placeholder.svg"
                }
                alt={`${property.title} photo 4`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <GalleryModalButton
                  images={property.images || []}
                  title={property.title}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and actions */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black leading-tight tracking-tight">
                    {property.title}
                  </h1>
                  <div className="mt-1 flex items-center text-base text-[#03063b]/70">
                    <span className="material-symbols-outlined text-lg mr-2">
                      location_on
                    </span>
                    <span>
                      {property.location.address}, {property.location.city},{" "}
                      {property.location.region}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="size-10 rounded-full border border-[#dde8f0] flex items-center justify-center hover:bg-[#f4fafe] transition-colors"
                    aria-label="Favorite"
                  >
                    <span className="material-symbols-outlined">
                      favorite_border
                    </span>
                  </button>
                  <ShareDialogButton url={propertyUrl} title={property.title} />
                </div>
              </div>

              {/* Quick specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#dde8f0] mt-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-[#0b8bff]">
                    bed
                  </span>
                  <div>
                    <div className="text-[#03063b] text-lg font-bold">
                      {property.specifications.bedrooms || 0}
                    </div>
                    <div className="text-[#03063b]/70 text-sm">Bedrooms</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-[#0b8bff]">
                    bathtub
                  </span>
                  <div>
                    <div className="text-[#03063b] text-lg font-bold">
                      {property.specifications.bathrooms || 0}
                    </div>
                    <div className="text-[#03063b]/70 text-sm">Bathrooms</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-[#0b8bff]">
                    square_foot
                  </span>
                  <div>
                    <div className="text-[#03063b] text-lg font-bold">
                      {property.specifications.area?.toLocaleString()} sq
                      {"\u00A0"}ft
                    </div>
                    <div className="text-[#03063b]/70 text-sm">Sqft</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-[#0b8bff]">
                    home_work
                  </span>
                  <div>
                    <div className="text-[#03063b] text-lg font-bold capitalize">
                      {property.type}
                    </div>
                    <div className="text-[#03063b]/70 text-sm">
                      Property Type
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About this property */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-3">About this property</h3>
              <div className="text-[#03063b]/80 space-y-4 text-base leading-relaxed">
                <p className="whitespace-pre-line">{property.description}</p>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                  {property.amenities.map((amenity: string, idx: number) => {
                    const a = amenity.toLowerCase();
                    let icon = "check_circle";
                    if (a.includes("pool")) icon = "pool";
                    else if (a.includes("garage")) icon = "garage";
                    else if (a.includes("deck")) icon = "deck";
                    else if (a.includes("air") || a.includes("ac"))
                      icon = "ac_unit";
                    else if (a.includes("fireplace")) icon = "fireplace";
                    else if (a.includes("laundry"))
                      icon = "local_laundry_service";
                    else if (a.includes("kitchen")) icon = "countertops";
                    else if (a.includes("bbq") || a.includes("grill"))
                      icon = "outdoor_grill";
                    else if (a.includes("security")) icon = "security";
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#0b8bff]">
                          {icon}
                        </span>
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Note: Contact Agent handled via sidebar button/dialog to match design */}
          </div>

          {/* Right Column - Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-[#03063b]/70">Asking Price</p>
                <div className="text-4xl font-black text-[#03063b] mb-4">
                  <CurrencyAmount amountUsd={property.price} />
                </div>
                <div className="mt-4 space-y-3">
                  {/* Use ContactAgentForm which renders its own button and dialog */}
                  <ContactAgentForm
                    propertyId={String(property._id)}
                    propertyTitle={property.title}
                  />

                  {/* Schedule viewing (RequestSiteVisitClient) */}
                  <div className="relative">
                    <RequestSiteVisitClient
                      propertyId={String(property._id)}
                      propertyTitle={property.title}
                    />
                  </div>

                  {property.vrTourUrl && (
                    <Button
                      asChild
                      className="w-full h-12 px-6 rounded-lg bg-[#0b8bff]/10 text-[#0b8bff] hover:bg-[#0b8bff]/20 text-base font-bold tracking-wide"
                    >
                      <a href={`/properties/${property._id}/vr`}>
                        View VR Tour
                      </a>
                    </Button>
                  )}

                  {whatsappHref && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full h-12 px-6 rounded-lg bg-green-600 hover:bg-green-700 text-white text-base font-bold tracking-wide">
                        <MessageCircle className="mr-2 h-4 w-4" /> Chat on
                        WhatsApp
                      </Button>
                    </a>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs text-[#51607a]">Listed by:</span>
                  <div className="flex items-center gap-3">
                    {(property as any).listedBy?.profileImage && (
                      <div className="relative h-8 w-8 overflow-hidden rounded-full">
                        <Image
                          src={
                            (property as any).listedBy?.profileImage ||
                            "/placeholder.svg"
                          }
                          alt={(property as any).listedBy?.name || "Agent"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {(property as any).listedBy?.name || "Agent"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Compare only (share removed as it's already available elsewhere) */}
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-center">
                  <CompareButton
                    property={safeProperty}
                    variant="ghost"
                    size="lg"
                    className="gap-2 whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive py-2 has-[>svg]:px-3 w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#0b8bff]/10 text-[#0b8bff] text-base font-bold leading-normal tracking-wide hover:bg-[#0b8bff]/20 transition-colors"
                  />
                </div>
              </div>

              {/* Mortgage Calculator */}
              <MortgageCalculator price={property.price} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
