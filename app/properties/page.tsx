import { Suspense } from "react";
import { PropertyFilters } from "@/components/properties/property-filters";
import PropertyResultsWithMap from "@/components/properties/property-results-with-map";
import connectDB from "@/lib/database";
import Property from "@/models/Property";

async function getPropertiesDirect(searchParams: any) {
  await connectDB();

  const page = Number.parseInt(searchParams?.page || "1");
  const limit = Number.parseInt(searchParams?.limit || "12");
  const type = searchParams?.type as string | undefined;
  const listingType = searchParams?.listingType as string | undefined;
  const city = searchParams?.city as string | undefined;
  const minPrice = searchParams?.minPrice as string | undefined;
  const maxPrice = searchParams?.maxPrice as string | undefined;
  const financing = searchParams?.financing as string | undefined;
  const financingAny = searchParams?.financingAny as string | undefined;
  const bedrooms = searchParams?.bedrooms as string | undefined;
  const status = (searchParams?.status as string | undefined) || "active";

  const query: any = { status };
  const ETH_BOUNDS = { minLat: 3.4, maxLat: 14.9, minLng: 32.9, maxLng: 48.0 };
  query["location.coordinates.lat"] = {
    $gte: ETH_BOUNDS.minLat,
    $lte: ETH_BOUNDS.maxLat,
  };
  query["location.coordinates.lng"] = {
    $gte: ETH_BOUNDS.minLng,
    $lte: ETH_BOUNDS.maxLng,
  };

  if (type && type !== "allTypes" && type !== "all") {
    query.type = type;
  }
  if (listingType && ["sale", "rent"].includes(listingType)) {
    query.listingType = listingType;
  }
  if (city) query["location.city"] = new RegExp(city, "i");
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number.parseInt(minPrice);
    if (maxPrice) query.price.$lte = Number.parseInt(maxPrice);
  }
  if (financing) {
    const terms = financing
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (terms.length) {
      const esc = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.financing = {
        $in: terms.map((t) => new RegExp(`^${esc(t)}$`, "i")),
      };
    }
  }
  if (!financing && financingAny === "1") {
    // Any property that lists one or more financing banks
    query.financing = { $exists: true, $ne: [] };
  }
  if (bedrooms) {
    const minBeds = Number.parseInt(bedrooms);
    if (!Number.isNaN(minBeds)) {
      query["specifications.bedrooms"] = { $gte: minBeds };
    }
  }

  const skip = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    Property.find(query)
      .populate("listedBy", "name email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Property.countDocuments(query),
  ]);

  return {
    properties,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const resolvedSearchParams = await searchParams;
  let properties: any[] = [];
  let pagination: any = null;
  try {
    const data = await getPropertiesDirect(resolvedSearchParams);
    // Serialize for client component boundary: convert ObjectIds/Dates to strings
    const toStringIfObjectId = (val: any) =>
      val && typeof val === "object" && typeof val.toString === "function"
        ? val.toString()
        : val;
    const serializeProperty = (p: any) => {
      if (!p) return p;
      return {
        ...p,
        _id: toStringIfObjectId(p._id),
        listedBy:
          p.listedBy && typeof p.listedBy === "object"
            ? {
                ...(p.listedBy._id
                  ? { _id: toStringIfObjectId(p.listedBy._id) }
                  : {}),
                name: (p.listedBy as any).name,
                email: (p.listedBy as any).email,
                profileImage: (p.listedBy as any).profileImage,
                phone: (p.listedBy as any).phone,
              }
            : toStringIfObjectId(p.listedBy),
        // Ensure any ObjectId refs are plain strings
        realEstate: toStringIfObjectId((p as any).realEstate),
        // Normalize dates to ISO strings
        featuredUntil: p.featuredUntil
          ? new Date(p.featuredUntil).toISOString()
          : p.featuredUntil,
        createdAt: p.createdAt
          ? new Date(p.createdAt).toISOString()
          : p.createdAt,
        updatedAt: p.updatedAt
          ? new Date(p.updatedAt).toISOString()
          : p.updatedAt,
      };
    };
    properties = (data.properties as any[]).map(serializeProperty);
    pagination = data.pagination;
  } catch (e) {
    // Degrade gracefully in dev so navigation stays responsive
    properties = [];
    pagination = { page: 1, limit: 12, total: 0, pages: 0 };
  }

  return (
    <div className="min-h-screen property-theme bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Browse Properties</h1>
          <p className="mt-2 text-muted-foreground">
            Find your perfect property from our extensive listings
          </p>
          <div className="mt-2 rounded-md border bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            Note: Results and map are restricted to Ethiopia.
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <PropertyFilters />
          </aside>
          {/* Results area */}
          <main className="lg:col-span-3">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <div className="h-10 w-48 animate-pulse rounded bg-muted" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    <div className="h-64 animate-pulse rounded bg-muted" />
                    <div className="h-64 animate-pulse rounded bg-muted" />
                    <div className="h-64 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              }
            >
              <PropertyResultsWithMap
                properties={properties}
                pagination={pagination}
              />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
