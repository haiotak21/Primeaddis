import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import connectDB from "@/lib/database";
import Property from "@/models/Property";
import User from "@/models/User";
import SavedSearch from "@/models/SavedSearch";

function isValidObjectId(id: string) {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

function toStringIfObjectId(val: any) {
  if (val && typeof val === "object" && typeof val.toString === "function")
    return val.toString();
  return val;
}

function serializeProperty(p: any) {
  if (!p) return p;
  return {
    ...p,
    _id: toStringIfObjectId(p._id),
    listedBy:
      typeof p.listedBy === "object" &&
      p.listedBy !== null &&
      !Array.isArray(p.listedBy)
        ? toStringIfObjectId(p.listedBy._id ?? p.listedBy)
        : toStringIfObjectId(p.listedBy),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : p.createdAt,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : p.updatedAt,
  };
}

async function getUserData(userId: string) {
  await connectDB();
  if (!isValidObjectId(userId)) {
    return { properties: [] };
  }
  const properties = await Property.find({ listedBy: userId })
    .sort({ createdAt: -1 })
    .lean();
  return { properties };
}

async function getFavorites(userId: string) {
  await connectDB();
  if (!isValidObjectId(userId)) {
    return { favorites: [] };
  }
  const user = await User.findById(userId)
    .populate({ path: "favorites", options: { sort: { createdAt: -1 } } })
    .lean();
  return { favorites: user?.favorites || [] };
}

async function getSavedSearches(userId: string) {
  await connectDB();
  if (!isValidObjectId(userId)) {
    return { savedSearches: [] };
  }
  const savedSearches = await SavedSearch.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();
  return { savedSearches };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // If the user is an admin or superadmin, route them to the admin properties page
  if (["admin", "superadmin"].includes(session.user.role)) {
    redirect("/admin/properties");
  }

  const { properties } = await getUserData(session.user.id);
  const { favorites } = await getFavorites(session.user.id);
  const { savedSearches } = await getSavedSearches(session.user.id);

  const safeProperties = (properties as any[]).map(serializeProperty);
  const safeFavorites = (favorites as any[]).map(serializeProperty);

  const isAgent = ["agent", "admin", "superadmin"].includes(session.user.role);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Saved Searches */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Saved Searches & Alerts</h2>
            <Link href="/saved-searches">
              <Button variant="outline">Manage</Button>
            </Link>
          </div>
          {savedSearches.length === 0 ? (
            <div className="flex min-h-[100px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <h3 className="text-lg font-semibold">No saved searches yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Save a search to get alerts for new matching properties.
                </p>
                <Link href="/properties">
                  <Button className="mt-4">Browse Properties</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedSearches.slice(0, 6).map((search: any) => (
                <div
                  key={search._id}
                  className="rounded-lg border bg-background p-4 shadow"
                >
                  <h4 className="font-semibold">{search.name}</h4>
                  <div className="text-sm text-muted-foreground mb-2">
                    Alerts:{" "}
                    {search.alertEnabled
                      ? `Enabled (${search.alertFrequency})`
                      : "Disabled"}
                  </div>
                  <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">
                    {JSON.stringify(search.criteria, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {session.user.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your properties and favorites
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Properties"
            value={safeProperties.length}
            description={
              isAgent
                ? "Properties you've listed"
                : "Properties you're tracking"
            }
            icon={
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            }
          />
          <StatsCard
            title="Favorites"
            value={favorites.length}
            description="Saved properties"
            icon={
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            }
          />
          <StatsCard
            title="Account Type"
            value={
              session.user.role.charAt(0).toUpperCase() +
              session.user.role.slice(1)
            }
            description="Your current role"
            icon={
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
          />
          <StatsCard
            title="Total Views"
            value={safeProperties.reduce(
              (sum: number, p: any) => sum + (p.views || 0),
              0
            )}
            description="Across all properties"
            icon={
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            }
          />
        </div>

        {/* My Properties */}
        {isAgent && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Properties</h2>
              <Link href="/properties/new">
                <Button>Add New Property</Button>
              </Link>
            </div>

            {safeProperties.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">No properties yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start by creating your first property listing
                  </p>
                  <Link href="/properties/new">
                    <Button className="mt-4">Create Property</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {safeProperties.slice(0, 6).map((property: any) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Favorite Properties</h2>
            <Link href="/favorites">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {safeFavorites.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <h3 className="text-lg font-semibold">No favorites yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start exploring properties and save your favorites
                </p>
                <Link href="/properties">
                  <Button className="mt-4">Browse Properties</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {safeFavorites.slice(0, 6).map((property: any) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
