import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getBaseUrl() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("x-forwarded-host") || h.get("host");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

async function fetchAdminFavorites() {
  const baseUrl = await getBaseUrl();
  const cookieStore: any = cookies();
  const cookieHeader =
    typeof cookieStore.getAll === "function"
      ? cookieStore
          .getAll()
          .map((c: any) => `${c.name}=${c.value}`)
          .join("; ")
      : "";

  const res = await fetch(`${baseUrl}/api/admin/favorites`, {
    cache: "no-store",
    headers: {
      // Forward cookies so the API route can read the user's session
      cookie: cookieHeader,
    },
  });
  if (!res.ok) throw new Error("Failed to load favorites");
  return res.json();
}

export default async function AdminFavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["admin", "superadmin"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const { favorites, counts, totalFavorites } = await fetchAdminFavorites();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
          Favorites
        </h1>
        <p className="text-sm text-muted-foreground">
          Users who have saved properties. This view flattens User.favorites and
          includes totals per property.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white dark:bg-gray-900 p-4">
          <p className="text-sm text-muted-foreground">Total favorites</p>
          <p className="text-2xl font-bold">{totalFavorites}</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No favorites yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This page lists users and the properties they have saved.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Property</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Featured</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map((row: any, idx: number) => (
                <tr key={idx} className="border-t">
                  <td className="p-3">{row.user.name}</td>
                  <td className="p-3">{row.user.email}</td>
                  <td className="p-3">
                    <Link
                      href={`/properties/${
                        row.property.slug || row.property.id
                      }`}
                      className="underline"
                    >
                      {row.property.title}
                    </Link>
                  </td>
                  <td className="p-3 capitalize">{row.property.status}</td>
                  <td className="p-3">
                    {row.property.featured ? "Yes" : "No"}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/properties?highlight=${row.property.id}`}
                      className="text-primary underline"
                    >
                      Manage property
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {Object.keys(counts).length > 0 && (
        <div className="text-xs text-muted-foreground">
          Note: counts by property are available from the API for future charts.
        </div>
      )}
    </div>
  );
}
