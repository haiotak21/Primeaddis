import Image from "next/image";
import Link from "next/link";
import connectDB from "@/lib/database";
import User from "@/models/User";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getAgents({
  q,
  page,
  limit,
}: {
  q?: string;
  page: number;
  limit: number;
}) {
  await connectDB();
  // Only show real agents from DB; include superadmin as requested
  // Include all admin types and agents; be robust to casing and separators (e.g., "super admin", "super_admin")
  // Using a substring regex ensures variants are matched; model enum is typically [user, agent, admin, superadmin]
  const filter: any = { role: { $regex: /(agent|admin)/i } };
  if (q) {
    filter.name = { $regex: q, $options: "i" };
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ role: -1, createdAt: -1 })
      .select("_id name email phone profileImage role")
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  const items = users.map((u: any) => {
    const raw = String(u.role).toLowerCase();
    const roleNormalized: "agent" | "admin" | "superadmin" =
      raw.includes("super") && raw.includes("admin")
        ? "superadmin"
        : raw.includes("admin")
        ? "admin"
        : "agent";
    return {
      _id: String(u._id),
      name: u.name,
      email: u.email,
      phone: u.phone ?? "",
      profileImage: u.profileImage ?? "",
      role: roleNormalized,
    };
  });

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export default async function AgentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = (await searchParams) || {};
  const q = (sp.q as string) || "";
  const page = Number.parseInt((sp.page as string) || "1");
  const limit = 12;
  const { items: agents, pagination } = await getAgents({ q, page, limit });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
              Meet Our Expert Agents
            </h1>
            <p className="text-lg text-muted-foreground">
              Find the perfect professional to guide you through your real
              estate journey.
            </p>
          </div>

          {/* Filters card */}
          <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm">
            <form
              className="grid grid-cols-1 md:grid-cols-5 gap-4"
              method="get"
            >
              <div className="md:col-span-2">
                <label className="flex flex-col w-full">
                  <span className="text-sm font-medium mb-1.5 text-foreground">
                    Search by Name
                  </span>
                  <div className="relative flex w-full items-center">
                    <div className="absolute left-3 text-muted-foreground pointer-events-none">
                      <span className="material-symbols-outlined text-xl">
                        search
                      </span>
                    </div>
                    <input
                      name="q"
                      defaultValue={q}
                      className="flex w-full min-w-0 flex-1 rounded-lg border border-border bg-background h-11 placeholder:text-muted-foreground pl-10 text-base focus:border-primary focus:ring-primary"
                      placeholder="e.g. Abebe Bekele"
                    />
                  </div>
                </label>
              </div>

              {/* Unsupported specialty/location filters intentionally omitted to avoid implying features not present in data. */}
              <div className="md:col-span-1 md:col-start-5 flex items-end">
                <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-primary text-primary-foreground text-base font-bold tracking-wide hover:bg-primary/90 transition-colors">
                  <span className="truncate">Search</span>
                </button>
              </div>
            </form>
          </div>

          {agents.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              No agents found yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {agents.map((a) => (
                <div
                  key={a._id}
                  className="flex flex-col gap-4 text-center p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="mx-auto">
                    <div className="size-28 bg-center bg-no-repeat aspect-square bg-cover rounded-full overflow-hidden">
                      {a.profileImage ? (
                        <Image
                          src={a.profileImage}
                          alt={a.name}
                          width={112}
                          height={112}
                          className="size-28 object-cover rounded-full"
                        />
                      ) : (
                        <div className="size-28 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                          {a.name?.charAt(0) ?? "A"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold text-foreground">
                      {a.name}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="secondary">
                        {a.role === "superadmin"
                          ? "Super Admin"
                          : a.role === "admin"
                          ? "Admin"
                          : "Agent"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-4 text-muted-foreground">
                    {a.phone && (
                      <a
                        className="hover:text-primary transition-colors"
                        href={`tel:${a.phone}`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          phone
                        </span>
                      </a>
                    )}
                    {a.email && (
                      <a
                        className="hover:text-primary transition-colors"
                        href={`mailto:${a.email}`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          mail
                        </span>
                      </a>
                    )}
                  </div>
                  <Link
                    href={`/agents/${a._id}`}
                    className="w-full mt-2 flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 text-primary text-sm font-bold leading-normal tracking-wide hover:bg-primary/20 transition-colors"
                  >
                    <span className="truncate">View Profile</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8">
              <Link
                aria-disabled={pagination.page <= 1}
                className="flex items-center justify-center size-10 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
                href={`/agents?${new URLSearchParams({
                  q,
                  page: String(Math.max(1, pagination.page - 1)),
                }).toString()}`}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </Link>
              {Array.from({ length: Math.min(10, pagination.pages) }).map(
                (_, i) => {
                  const n = i + 1;
                  const isActive = n === pagination.page;
                  return (
                    <Link
                      key={n}
                      href={`/agents?${new URLSearchParams({
                        q,
                        page: String(n),
                      }).toString()}`}
                      className={
                        isActive
                          ? "flex items-center justify-center size-10 rounded-lg text-primary-foreground bg-primary font-bold text-sm"
                          : "flex items-center justify-center size-10 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium"
                      }
                    >
                      {n}
                    </Link>
                  );
                }
              )}
              <Link
                aria-disabled={pagination.page >= pagination.pages}
                className="flex items-center justify-center size-10 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
                href={`/agents?${new URLSearchParams({
                  q,
                  page: String(Math.min(pagination.pages, pagination.page + 1)),
                }).toString()}`}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
