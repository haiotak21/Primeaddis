import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactAgentForm } from "@/components/properties/contact-agent-form";
import { CompareButton } from "@/components/properties/compare-button";
import RequestSiteVisitClient from "@/components/properties/request-site-visit-client";
import { formatDate } from "@/utils/helpers";
import CurrencyAmount from "@/components/common/currency-amount";
import MortgageCalculator from "@/components/properties/mortgage-calculator";
// Removed SocialShareButtons from this page per request (only keep Compare button here)
import { MessageCircle } from "lucide-react";
import { ShareDialogButton } from "@/components/properties/share-dialog";
import { GalleryModalButton } from "@/components/properties/gallery-modal";
import FavoriteButton from "@/components/properties/favorite-button";

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

async function getPropertyBySlugOrId(raw: string) {
  if (!raw) return null;
  await connectDB();
  // If raw is an ObjectId, fetch by id
  if (isValidObjectId(raw)) {
    return getProperty(raw);
  }
  // If raw ends with -<24hex>, extract id
  const idMatch = raw.match(/-([a-fA-F0-9]{24})$/);
  if (idMatch) {
    return getProperty(idMatch[1]);
  }
  // Try finding by stored slug field
  const bySlug = await Property.findOne({ slug: raw })
    .populate("listedBy", "name email phone profileImage")
    .lean();
  if (bySlug) return bySlug;
  return null;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const property = await getPropertyBySlugOrId(params.id);
    if (!property) {
      return {
        title: "Property not found - PrimeAddis",
        robots: { index: false, follow: false },
      };
    }

    const title = `${property.title} - ${
      property.location?.city || ""
    } | Addis Bet - አዲስ ቤት`;
    const description = `${property.specifications?.bedrooms || 0} bedroom ${
      property.type
    } for ${property.purpose || "sale/rent"} in ${
      property.location?.city || "Addis Ababa"
    }. Price: ${
      property.price ? property.price + " ETB" : "Contact for price"
    }`;
    const image =
      property.images && property.images.length > 0
        ? property.images[0]
        : undefined;
    const base =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://primeaddiset.com";
    const slugPath = property.slug || toSlug(property.title || "property");

    return {
      title,
      description,
      openGraph: {
        title: property.title,
        description,
        images: image ? [image] : [],
        type: "website",
      },
      alternates: {
        canonical: `${base}/addis-bet/${slugPath}`,
      },
      robots: { index: true, follow: true },
    } as any;
  } catch (e) {
    return { title: "Property - PrimeAddis" } as any;
  }
}

async function getGlobalSettings() {
  try {
    await connectDB();
    const doc = await Settings.findOne().lean();
    return doc || null;
  } catch (e) {
    return null;
  }
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
    .select("_id title slug price images location type")
    .lean();
  return similar;
}

import { notFound } from "next/navigation";
import connectDB from "@/lib/database";
import Property from "@/models/Property";
import Settings from "@/models/Settings";
import PropertyDetailServer from "@/components/properties/property-detail-server";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15: params is async; await it before usage
  const { id } = await params;
  const raw = id as string;

  const [property, globalSettings] = await Promise.all([
    getPropertyBySlugOrId(raw),
    getGlobalSettings(),
  ]);
  if (!property) {
    notFound();
  }
  const similarProperties = await getSimilarProperties(property);

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
    <PropertyDetailServer
      property={safeProperty}
      globalSettings={globalSettings}
      similarProperties={similarProperties}
    />
  );
}
