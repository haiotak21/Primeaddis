import Image from "next/image";
import { notFound } from "next/navigation";
import connectDB from "@/lib/database";
import User from "@/models/User";
import Property from "@/models/Property";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyCard } from "@/components/properties/property-card";

function isValidObjectId(id: string) {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
}

async function getAgent(id: string) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const user = await User.findById(id)
    .select(
      "_id name email phone profileImage role title licenseId officeAddress bio"
    )
    .lean();
  return user ? { ...user, _id: String(user._id) } : null;
}

async function getAgentProperties(agentId: string) {
  await connectDB();
  const props = await Property.find({
    listedBy: agentId,
    status: { $ne: "draft" },
  })
    .sort({ createdAt: -1 })
    .select(
      "_id title price images location type specifications listingType status listedBy"
    )
    .lean();
  return props.map((p: any) => ({
    ...p,
    _id: String(p._id),
    listedBy: { name: "" },
  }));
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getAgent(id);
  if (!agent) notFound();
  const properties = await getAgentProperties(id);

  const roleRaw = String((agent as any).role || "").toLowerCase();
  const roleLabel =
    roleRaw.includes("super") && roleRaw.includes("admin")
      ? "Super Admin"
      : roleRaw.includes("admin")
      ? "Admin"
      : "Agent";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-12">
          {/* Left column: Profile card */}
          <aside className="lg:col-span-1 xl:col-span-1">
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm lg:sticky lg:top-28">
              <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full ring-2 sm:ring-4 ring-primary/20">
                  {agent.profileImage ? (
                    <Image
                      src={agent.profileImage}
                      alt={(agent as any).name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl sm:text-3xl font-bold text-muted-foreground">
                      {(agent.name as string)?.charAt(0) || "A"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xl sm:text-2xl font-bold leading-tight tracking-tight">
                    {(agent as any).name}
                  </p>
                  <p className="text-foreground/70 text-sm sm:text-base">
                    {(agent as any).title || roleLabel}
                  </p>
                  {(agent as any).licenseId && (
                    <p className="text-foreground/50 text-xs sm:text-sm mt-1">
                      License #{(agent as any).licenseId}
                    </p>
                  )}
                </div>
                {agent.email && (
                  <a
                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 px-4 sm:px-6 bg-primary text-primary-foreground text-sm sm:text-base font-bold tracking-wide hover:bg-primary/90"
                    href={`mailto:${agent.email}`}
                  >
                    Contact Agent
                  </a>
                )}
              </div>

              {/* Description list */}
              <div className="mt-6 sm:mt-8">
                <div className="flex flex-col gap-y-3 sm:gap-y-4">
                  {agent.phone && (
                    <div className="flex items-start gap-3 border-t border-border pt-3 sm:pt-4">
                      <span className="material-symbols-outlined text-primary mt-0.5 text-base sm:text-lg">
                        phone
                      </span>
                      <div className="flex flex-col">
                        <p className="text-foreground/70 text-xs sm:text-sm">
                          Phone
                        </p>
                        <a
                          className="text-xs sm:text-sm font-medium"
                          href={`tel:${agent.phone}`}
                        >
                          {agent.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {agent.email && (
                    <div className="flex items-start gap-3 border-t border-border pt-3 sm:pt-4">
                      <span className="material-symbols-outlined text-primary mt-0.5 text-base sm:text-lg">
                        email
                      </span>
                      <div className="flex flex-col">
                        <p className="text-foreground/70 text-xs sm:text-sm">
                          Email
                        </p>
                        <a
                          className="text-xs sm:text-sm font-medium"
                          href={`mailto:${agent.email}`}
                        >
                          {agent.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {(agent as any).officeAddress && (
                    <div className="flex items-start gap-3 border-t border-border pt-3 sm:pt-4">
                      <span className="material-symbols-outlined text-primary mt-0.5 text-base sm:text-lg">
                        business_center
                      </span>
                      <div className="flex flex-col">
                        <p className="text-foreground/70 text-xs sm:text-sm">
                          Office Address
                        </p>
                        <p className="text-xs sm:text-sm font-medium">
                          {(agent as any).officeAddress}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Right column: About + Listings */}
          <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-8 sm:gap-12">
            {/* About section */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight pb-3 sm:pb-4 border-b border-border">
                About {(agent as any).name}
              </h2>
              {(agent as any).bio ? (
                <div className="mt-3 sm:mt-4 text-foreground/90 leading-relaxed">
                  <p>{(agent as any).bio}</p>
                </div>
              ) : (
                <p className="mt-3 sm:mt-4 text-muted-foreground text-sm sm:text-base">
                  This agent has not added a bio yet.
                </p>
              )}
            </section>

            {/* Listings */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight pb-3 sm:pb-4 border-b border-border">
                Current Listings
              </h2>
              {properties.length === 0 ? (
                <Card>
                  <CardContent className="p-6 sm:p-8 text-center text-muted-foreground text-sm sm:text-base">
                    This agent has no active listings yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 mt-5 sm:mt-6">
                  {properties.map((p: any) => (
                    <PropertyCard key={p._id} property={p as any} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
