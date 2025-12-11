import Image from "next/image";
import Link from "next/link";
import { toSlug } from "@/lib/slugify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactAgentForm } from "@/components/properties/contact-agent-form";
import { CompareButton } from "@/components/properties/compare-button";
import RequestSiteVisitClient from "@/components/properties/request-site-visit-client";
import MortgageCalculator from "@/components/properties/mortgage-calculator";
import { MessageCircle } from "lucide-react";
import { ShareDialogButton } from "@/components/properties/share-dialog";
import { GalleryModalButton } from "@/components/properties/gallery-modal";
import FavoriteButton from "@/components/properties/favorite-button";
import CurrencyAmount from "@/components/common/currency-amount";

type Props = {
  property: any;
  globalSettings?: any;
  similarProperties?: any[];
};

export default function PropertyDetailServer({
  property,
  globalSettings,
  similarProperties,
}: Props) {
  const baseUrl =
    process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
  const locationSlug = toSlug(
    `${property.title} ${property.location?.city || ""} ${
      property.location?.region || ""
    }`
  );
  const propertyUrl = baseUrl
    ? `${baseUrl}/properties/${property.slug || locationSlug}`
    : `/properties/${property.slug || locationSlug}`;

  const globalWhatsapp = (globalSettings as any)?.whatsappNumber;
  const whatsappNumber =
    globalWhatsapp && String(globalWhatsapp).trim().length > 0
      ? String(globalWhatsapp).replace(/\D/g, "")
      : (property as any).listedBy?.phone?.replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(
    `Hello, I'm interested in your property: ${property.title}. Here is the listing link: ${propertyUrl}`
  );
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : null;

  // Build JSON-LD structured data for rich results
  const schemaType = ((): string => {
    const t = String(property.type || "").toLowerCase();
    if (t.includes("apartment") || t.includes("flat")) return "Apartment";
    if (t.includes("house") || t.includes("villa")) return "House";
    return "Residence";
  })();

  const images = Array.isArray(property.images)
    ? property.images
    : property.images
    ? [property.images]
    : [];
  const latitude = property.location?.lat || property.lat || null;
  const longitude = property.location?.lng || property.lng || null;
  const street = property.location?.address || property.street || "";
  const priceUsd = Number(property.price) || 0;

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: property.title,
    image: images,
    description: property.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: property.location?.city || "",
      addressRegion: property.location?.region || "",
      addressCountry: "ET",
    },
    offers: {
      "@type": "Offer",
      price: property.price || undefined,
      priceCurrency: "ETB",
      availability:
        property.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/Unavailable",
      url: propertyUrl,
    },
  };

  if (latitude && longitude) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: Number(latitude),
      longitude: Number(longitude),
    };
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Gallery - renders exactly as many images as uploaded (no duplicates) */}
        <div className="mb-8 @container">
          <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
            <div className="col-span-4 md:col-span-2 row-span-2 rounded-xl overflow-hidden relative">
              <Image
                src={property.images?.[0] || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                unoptimized
              />
              <div className="absolute inset-0 md:hidden bg-black/20 flex items-center justify-center">
                <GalleryModalButton
                  images={property.images || []}
                  title={property.title}
                />
              </div>
              {!property.images?.[3] && (
                <div className="absolute inset-0 hidden md:flex bg-black/20 items-center justify-center">
                  <GalleryModalButton
                    images={property.images || []}
                    title={property.title}
                  />
                </div>
              )}
            </div>

            {property.images?.[1] && (
              <div className="hidden md:block col-span-1 row-span-1 rounded-xl overflow-hidden relative">
                <Image
                  src={property.images[1]}
                  alt={`${property.title} photo 2`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            {property.images?.[2] && (
              <div className="hidden md:block col-span-1 row-span-1 rounded-xl overflow-hidden relative">
                <Image
                  src={property.images[2]}
                  alt={`${property.title} photo 3`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            {property.images?.[3] && (
              <div className="hidden md:block col-span-2 row-span-1 rounded-xl overflow-hidden relative">
                <Image
                  src={property.images[3]}
                  alt={`${property.title} photo 4`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <GalleryModalButton
                    images={property.images || []}
                    title={property.title}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-primary/20 bg-card dark:bg-gray-900/30 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black leading-tight tracking-tight text-foreground">
                    {property.title}
                  </h1>
                  <div className="mt-1 flex items-center text-base text-muted-foreground">
                    <span className="material-symbols-outlined text-lg mr-2">
                      location_on
                    </span>
                    <span>
                      {property.location?.address}, {property.location?.city},{" "}
                      {property.location?.region}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FavoriteButton propertyId={String(property._id)} />
                  <ShareDialogButton url={propertyUrl} title={property.title} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border mt-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    bed
                  </span>
                  <div>
                    <div className="text-foreground text-lg font-bold">
                      {property.specifications?.bedrooms || 0}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Bedrooms
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    bathtub
                  </span>
                  <div>
                    <div className="text-foreground text-lg font-bold">
                      {property.specifications?.bathrooms || 0}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Bathrooms
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    square_foot
                  </span>
                  <div>
                    <div className="text-foreground text-lg font-bold">
                      {property.specifications?.area?.toLocaleString()} sq
                      {"\u00A0"}ft
                    </div>
                    <div className="text-muted-foreground text-sm">Sqft</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    home_work
                  </span>
                  <div>
                    <div className="text-foreground text-lg font-bold capitalize">
                      {property.type}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Property Type
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card dark:bg-gray-900/30 p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-3">About this property</h3>
              <div className="text-muted-foreground space-y-4 text-base leading-relaxed">
                <p className="whitespace-pre-line">{property.description}</p>
              </div>
            </div>

            {property.amenities?.length > 0 && (
              <div className="rounded-2xl border border-primary/20 bg-card dark:bg-gray-900/30 p-6 shadow-sm">
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
                        <span className="material-symbols-outlined text-primary">
                          {icon}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {amenity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {Array.isArray((property as any).financing) &&
              (property as any).financing.length > 0 && (
                <div className="rounded-2xl border border-primary/20 bg-card dark:bg-gray-900/30 p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">
                    Available Banks / Financing
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(property as any).financing.map(
                      (bank: string, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/20"
                        >
                          {bank}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-primary/20 bg-card dark:bg-gray-900/30 p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">Asking Price</p>
                <div className="flex items-baseline justify-between mb-4">
                  <div className="text-4xl font-black mb-0 text-foreground">
                    <CurrencyAmount amountUsd={priceUsd} />
                  </div>
                  {(property as any).status &&
                    ["sold", "rented"].includes((property as any).status) && (
                      <span className="text-sm font-bold uppercase tracking-wide text-red-600">
                        {(property as any).status === "sold"
                          ? "SOLD"
                          : "RENTED"}
                      </span>
                    )}
                </div>

                <div className="mt-4 space-y-3">
                  <ContactAgentForm
                    propertyId={String(property._id)}
                    propertyTitle={property.title}
                  />
                  <RequestSiteVisitClient
                    propertyId={String(property._id)}
                    propertyTitle={property.title}
                  />
                  {whatsappHref && (
                    <Button
                      asChild
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive py-2 has-[>svg]:px-3 w-full h-12 px-6 rounded-lg bg-green-600 hover:bg-green-700 text-white text-base font-bold tracking-wide"
                    >
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" /> Chat on
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <MortgageCalculator initialAmount={property.price ?? 0} />
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
                        unoptimized
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {(property as any).listedBy?.name || "Agent"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-card dark:bg-gray-900/30 p-4 shadow-sm">
                <div className="flex items-center justify-center">
                  <CompareButton
                    property={property}
                    variant="ghost"
                    size="lg"
                    className="hover:text-accent-foreground dark:hover:bg-accent/50 gap-2 whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive py-2 has-[>svg]:px-3 w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary/10 text-primary text-base font-bold leading-normal tracking-wide hover:bg-primary/20 transition-colors"
                  />
                </div>
              </div>

              {similarProperties && similarProperties.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Similar properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {similarProperties.map((p: any) => {
                        const baseSlug =
                          p.slug ||
                          toSlug(
                            `${p.title} ${p.location?.city || ""} ${
                              p.location?.region || ""
                            }`
                          );
                        // Append ObjectId when slug is missing to guarantee a hit in getPropertyBySlugOrId
                        const similarHref = p.slug
                          ? `/properties/${baseSlug}`
                          : `/properties/${baseSlug}-${p._id}`;

                        return (
                          <Link
                            key={p._id}
                            href={similarHref}
                            className="flex items-center gap-3 rounded-lg border border-transparent p-2 transition hover:border-primary/30 hover:bg-primary/5"
                          >
                            <div className="w-16 h-12 relative rounded overflow-hidden">
                              <Image
                                src={p.images?.[0] || "/placeholder.svg"}
                                alt={p.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <div className="font-semibold">{p.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {p.location?.city}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
