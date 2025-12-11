import PropertyDetailServer from "@/components/properties/property-detail-server";
import { notFound } from "next/navigation";
import { getAbsoluteBaseUrl } from "@/utils/helpers";
import connectDB from "@/lib/database";
import Property from "@/models/Property";
import RealEstate from "@/models/RealEstate";
import Settings from "@/models/Settings";

function isValidObjectId(id: string) {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
}

async function getPropertyBySlug(slug: string) {
  try {
    await connectDB();

    // 1) Try exact slug match
    const bySlug = await Property.findOne({ slug })
      .populate("listedBy", "name email phone profileImage")
      .populate("realEstate", "name")
      .lean();
    if (bySlug) return bySlug;

    // 2) Try slug-with-id pattern: ...-<ObjectId>
    const idMatch = slug.match(/-([a-fA-F0-9]{24})$/);
    const id = idMatch?.[1];
    if (id && isValidObjectId(id)) {
      const byId = await Property.findById(id)
        .populate("listedBy", "name email phone profileImage")
        .populate("realEstate", "name")
        .lean();
      if (byId) return byId;
    }
  } catch (err) {
    console.error("Property lookup failed for slug", slug, err);
  }

  // 3) Fallback: try fetching via API (covers environments where DB unavailable at edge)
  try {
    const base = await getAbsoluteBaseUrl();
    const res = await fetch(`${base}/api/properties/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data as any).property || data;
  } catch (err) {
    console.error("API lookup failed for property slug", slug, err);
    return null;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";
  if (!slug) {
    return {
      title: "Property not found - PrimeAddis",
      description:
        "The property you are looking for does not exist or has been removed.",
      robots: { index: false, follow: true },
    } as any;
  }

  try {
    const property = await getPropertyBySlug(slug);
    if (!property) {
      return {
        title: "Property not found - PrimeAddis",
        description:
          "The property you are looking for does not exist or has been removed.",
        robots: { index: false, follow: true },
      } as any;
    }

    const base = await getAbsoluteBaseUrl();
    const title = `${property.title} - ${
      property.location?.city || "Addis Ababa"
    } | Addis Bet - አዲስ ቤት`;
    const description = `${property.specifications?.bedrooms || 0} bedroom ${
      property.type
    } for ${property.purpose || "sale/rent"} in ${
      property.location?.city || "Addis Ababa"
    }. Price: ${
      property.price ? property.price + " ETB" : "Contact for price"
    }`;
    return {
      title,
      description,
      openGraph: {
        title: property.title,
        description,
        images: property.images ? [property.images[0]] : [],
        type: "website",
      },
      alternates: {
        canonical: `${
          process.env.NEXTAUTH_URL ||
          process.env.NEXT_PUBLIC_BASE_URL ||
          "https://primeaddiset.com"
        }/addis-bet/${slug}`,
      },
      robots: { index: true, follow: true },
    } as any;
  } catch (error) {
    console.error("Metadata error for property slug:", slug, error);
    return {
      title: "Property not found - PrimeAddis",
      robots: { index: false, follow: true },
    } as any;
  }
}

export default async function AddisbBetPropertyPage({
  params,
}: {
  params: Promise<{ slug?: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";
  if (!slug) {
    return notFound();
  }

  let property: any = null;

  try {
    property = await getPropertyBySlug(slug);
  } catch (error) {
    console.error("Render failed for property slug", slug, error);
    return notFound();
  }

  if (!property) {
    return notFound();
  }

  const [globalSettings, similarProperties] = await Promise.all([
    getGlobalSettings(),
    getSimilarProperties(property),
  ]);

  const toStringIfObjectId = (val: any) =>
    val && typeof val === "object" && typeof val.toString === "function"
      ? val.toString()
      : val;
  const safeProperty = {
    ...property,
    _id: toStringIfObjectId(property._id),
    listedBy:
      property.listedBy && typeof property.listedBy === "object"
        ? {
            name: property.listedBy.name,
            email: property.listedBy.email,
            profileImage: property.listedBy.profileImage,
          }
        : toStringIfObjectId(property.listedBy),
    realEstate: toStringIfObjectId(property.realEstate),
    featuredUntil: property.featuredUntil
      ? new Date(property.featuredUntil).toISOString()
      : property.featuredUntil,
    createdAt: property.createdAt
      ? new Date(property.createdAt).toISOString()
      : property.createdAt,
    updatedAt: property.updatedAt
      ? new Date(property.updatedAt).toISOString()
      : property.updatedAt,
  } as any;

  return (
    <PropertyDetailServer
      property={safeProperty}
      globalSettings={globalSettings}
      similarProperties={similarProperties}
    />
  );
}
