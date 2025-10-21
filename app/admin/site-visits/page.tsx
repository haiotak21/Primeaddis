import Link from "next/link";

async function getSiteVisits() {
  const res = await fetch(`/api/admin/site-visits`, {
    cache: "no-store",
  });
  if (!res.ok) return { siteVisits: [], pagination: null };
  return res.json();
}

export default async function AdminSiteVisitsPage() {
  const { siteVisits, pagination } = await getSiteVisits();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site Visit Requests</h1>
        <p className="text-muted-foreground">
          Latest site visit requests from users
        </p>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Property</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
            </tr>
          </thead>
          <tbody>
            {siteVisits.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No site visit requests yet
                </td>
              </tr>
            ) : (
              siteVisits.map((sv: any) => (
                <tr key={sv._id} className="border-t">
                  <td className="px-4 py-3">
                    {new Date(sv.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      className="text-primary underline"
                      href={`/properties/${sv.propertyId}`}
                    >
                      {sv.propertyTitle || sv.propertyId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{sv.name}</td>
                  <td className="px-4 py-3">{sv.email}</td>
                  <td className="px-4 py-3">{sv.phone}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && pagination.pages > 1 && (
        <div className="flex gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
            (page) => (
              <a
                key={page}
                href={`/admin/site-visits?page=${page}`}
                className={`rounded px-3 py-1 ${
                  page === pagination.page
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border"
                }`}
              >
                {page}
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
}
