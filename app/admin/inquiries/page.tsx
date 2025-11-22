import Link from "next/link";
import { requireRole } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Inquiry from "@/models/Inquiry";
import { toSlug } from "@/lib/slugify";
import InquiryActions from "@/components/admin/inquiry-actions";

async function getInquiries(page = 1, limit = 20) {
  const session = await requireRole(["admin", "superadmin"]);
  if (session instanceof NextResponse)
    return { inquiries: [], pagination: null };
  await connectDB();
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Inquiry.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Inquiry.countDocuments(),
  ]);
  return {
    inquiries: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export default async function AdminInquiriesPage() {
  const { inquiries, pagination } = await getInquiries();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full max-w-7xl mx-auto px-4 py-5 sm:p-6 lg:p-10">
        <header className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Customer Inquiries</h1>
              <p className="text-muted-foreground mt-1">
                View and manage user inquiries from contact forms
              </p>
            </div>
          </div>
        </header>

        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Property</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Message</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    No inquiries yet
                  </td>
                </tr>
              ) : (
                inquiries.map((inq: any) => (
                  <tr key={String(inq._id)} className="border-t">
                    <td className="px-4 py-3">
                      {new Date(inq.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {inq.propertyTitle ? (
                        <Link
                          className="text-primary underline"
                          href={`/properties/${toSlug(inq.propertyTitle)}`}
                        >
                          {inq.propertyTitle}
                        </Link>
                      ) : inq.propertyId ? (
                        <Link
                          className="text-primary underline"
                          href={`/properties/${inq.propertyId}`}
                        >
                          {inq.propertyId}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{inq.name}</td>
                    <td className="px-4 py-3">{inq.email}</td>
                    <td className="px-4 py-3">{inq.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="max-w-sm truncate">
                        {inq.message || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {inq.responded ? (
                        <span className="text-xs text-green-600">
                          Responded
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <InquiryActions
                        id={String(inq._id)}
                        responded={!!inq.responded}
                      />
                      <noscript>
                        <form
                          method="post"
                          action={`/api/admin/inquiries/${String(
                            inq._id
                          )}/delete`}
                        >
                          <button
                            type="submit"
                            className="mt-2 inline-flex items-center px-3 py-1 rounded text-sm bg-red-100 text-red-700"
                          >
                            Delete (no-JS)
                          </button>
                        </form>
                      </noscript>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex gap-2 mt-4">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
              (page) => (
                <a
                  key={page}
                  href={`/admin/inquiries?page=${page}`}
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
    </div>
  );
}
