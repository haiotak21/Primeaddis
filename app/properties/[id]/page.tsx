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
import SocialShareButtons from "@/components/properties/social-share-buttons";
import { MessageCircle } from "lucide-react";
import MortgageCalculator from "@/components/properties/mortgage-calculator";

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

  // Build WhatsApp link if agent phone is available
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
            ...((property as any).listedBy._id
              ? { _id: toStringIfObjectId((property as any).listedBy._id) }
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
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 grid gap-4">
              <div className="relative h-96 w-full overflow-hidden rounded-lg">
                <Image
                  src={
                    property.images[0] ||
                    "/placeholder.svg?height=400&width=800"
                  }
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              </div>
              {property.images.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {property.images
                    .slice(1, 5)
                    .map((image: string, index: number) => (
                      <div
                        key={index}
                        className="relative h-24 overflow-hidden rounded-lg"
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${property.title} ${index + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{property.title}</CardTitle>
                    <p className="mt-2 text-muted-foreground">
                      {property.location.address}, {property.location.city},{" "}
                      {property.location.region}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge>
                      {property.listingType === "sale"
                        ? "For Sale"
                        : "For Rent"}
                    </Badge>
                    {property.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 text-xl font-semibold">Description</h3>
                  <p className="text-muted-foreground">
                    {property.description}
                  </p>
                </div>

                <div>
                  <h3 className="mb-4 text-xl font-semibold">
                    Property Details
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{property.type}</p>
                    </div>
                    {Array.isArray(property.financing) &&
                      property.financing.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Financing
                          </p>
                          <p className="font-medium">
                            {property.financing.join(", ")}
                          </p>
                        </div>
                      )}
                    {property.specifications.bedrooms && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Bedrooms
                        </p>
                        <p className="font-medium">
                          {property.specifications.bedrooms}
                        </p>
                      </div>
                    )}
                    {property.specifications.bathrooms && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Bathrooms
                        </p>
                        <p className="font-medium">
                          {property.specifications.bathrooms}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Area</p>
                      <p className="font-medium">
                        {property.specifications.area} sq ft
                      </p>
                    </div>
                    {property.specifications.yearBuilt && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Year Built
                        </p>
                        <p className="font-medium">
                          {property.specifications.yearBuilt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {property.amenities.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-xl font-semibold">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map(
                        (amenity: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {amenity}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Nearby Amenities Section */}
                {nearbyAmenities.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-4 text-xl font-semibold">
                      Nearby Amenities
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {nearbyAmenities.map((am, idx) => (
                        <Card key={idx} className="overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg">{am.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Badge variant="outline">{am.type}</Badge>
                            <p className="text-xs text-muted-foreground mt-2">
                              {am.address}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                {/* End Nearby Amenities Section */}

                {/* Similar Properties Section */}
                {similarProperties.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-4 text-xl font-semibold">
                      Similar Properties
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {similarProperties.map((sp: any) => (
                        <Card key={sp._id} className="overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg">
                              <a href={`/properties/${sp._id}`}>{sp.title}</a>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="relative h-32 w-full mb-2 rounded-md overflow-hidden">
                              <Image
                                src={sp.images?.[0] || "/placeholder.svg"}
                                alt={sp.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge>{sp.type}</Badge>
                              <span className="font-semibold">
                                <CurrencyAmount amountUsd={sp.price} />
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {sp.location?.city}, {sp.location?.region}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                {/* End Similar Properties Section */}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-3xl">
                  <CurrencyAmount amountUsd={property.price} />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {property.listingType === "rent" && "per month"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Listed by</h4>
                  <div className="flex items-center gap-3">
                    {(property as any).listedBy?.profileImage && (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
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
                    <div>
                      <p className="font-medium">
                        {(property as any).listedBy?.name || "Agent"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(property as any).listedBy?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <ContactAgentForm
                  propertyId={String(property._id)}
                  propertyTitle={property.title}
                />

                {/* Request Site Visit button and form (client component) */}
                <div className="my-4">
                  <RequestSiteVisitClient
                    propertyId={String(property._id)}
                    propertyTitle={property.title}
                  />
                </div>

                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <MessageCircle className="mr-2 h-4 w-4" /> Chat on
                      WhatsApp
                    </Button>
                  </a>
                )}

                {property.vrTourUrl && (
                  <Button asChild className="w-full">
                    <a href={`/properties/${property._id}/vr`}>View VR Tour</a>
                  </Button>
                )}

                <Button variant="outline" className="w-full bg-transparent">
                  Schedule Viewing
                </Button>

                {/* Social Sharing Buttons (Client Component) */}
                <SocialShareButtons
                  propertyUrl={propertyUrl}
                  title={property.title}
                  description={property.description}
                />

                <CompareButton property={safeProperty} />

                {/* Mortgage calculator */}
                <div className="pt-2">
                  <MortgageCalculator price={property.price} />
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground">
                    Listed on {formatDate(property.createdAt as any)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {property.views || 0} views
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
