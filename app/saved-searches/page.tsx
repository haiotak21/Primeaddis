import Link from "next/link";
import connectDB from "@/lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SavedSearch from "@/models/SavedSearch";
import SavedSearchesList from "@/components/saved-searches/list";
import { Button } from "@/components/ui/button";

export default async function SavedSearchesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p>Please sign in to view saved searches.</p>
      </div>
    );
  }
  await connectDB();
  const items = await SavedSearch.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .lean();
  const serialize = (s: any) => ({
    ...s,
    _id: s._id?.toString?.() ?? s._id,
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : s.createdAt,
  });
  const safeItems = items.map(serialize);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Saved Searches</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your saved searches and alerts
            </p>
          </div>
          <Link href="/properties">
            <Button variant="outline">Find Properties</Button>
          </Link>
        </div>
        <SavedSearchesList items={safeItems as any} />
      </div>
    </div>
  );
}
