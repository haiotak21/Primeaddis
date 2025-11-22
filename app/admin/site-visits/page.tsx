import Link from "next/link";
import { toSlug } from "@/lib/slugify";
import ResendSiteVisit from "@/components/admin/resend-site-visit";
import { requireRole } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import SiteVisitRequest from "@/models/SiteVisitRequest";

async function getSiteVisits(page = 1, limit = 20) {
  const session = await requireRole(["admin", "superadmin"]);
  if (session instanceof NextResponse)
    return { siteVisits: [], pagination: null };

  await connectDB();
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    SiteVisitRequest.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SiteVisitRequest.countDocuments(),
  ]);

  return {
    siteVisits: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
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
              <th className="px-4 py-3 text-left">Email Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {siteVisits.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No site visit requests yet
                </td>
              </tr>
            ) : (
              siteVisits.map((sv: any) => (
                <tr key={String(sv._id)} className="border-t">
                  <td className="px-4 py-3">
                    {new Date(sv.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      className="text-primary underline"
                      href={
                        sv.propertyTitle
                          ? `/properties/${toSlug(sv.propertyTitle)}`
                          : `/properties/${sv.propertyId}`
                      }
                    >
                      {sv.propertyTitle || sv.propertyId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{sv.name}</td>
                  <td className="px-4 py-3">{sv.email}</td>
                  <td className="px-4 py-3">{sv.phone}</td>
                  <td className="px-4 py-3">
                    {sv.emailSent ? (
                      <span className="text-xs text-green-600">Sent</span>
                    ) : sv.emailError ? (
                      <span className="text-xs text-amber-600">
                        {sv.emailError}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ResendSiteVisit id={String(sv._id)} />
                  </td>
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
