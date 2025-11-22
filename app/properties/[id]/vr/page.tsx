import { notFound } from "next/navigation";
import connectDB from "@/lib/database";
import Property from "@/models/Property";
import { toSlug } from "@/lib/slugify";

function isValidObjectId(id: string) {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
}

async function getProperty(id: string) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  return Property.findById(id).lean();
}

async function getPropertyBySlugOrId(raw: string) {
  if (!raw) return null;
  await connectDB();
  if (isValidObjectId(raw)) return getProperty(raw);
  const idMatch = raw.match(/-([a-fA-F0-9]{24})$/);
  if (idMatch) return getProperty(idMatch[1]);
  const bySlug = await Property.findOne({ slug: raw }).lean();
  if (bySlug) return bySlug;
  return null;
}

export default async function PropertyVRPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raw = id as string;
  const property = await getPropertyBySlugOrId(raw);
  if (!property || !property.vrTourUrl) notFound();

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <a
            href={`/properties/${encodeURIComponent(
              toSlug(
                `${property.title} ${
                  (property.location && property.location.city) || ""
                } ${(property.location && property.location.region) || ""}`
              )
            )}`}
            className="text-sm text-primary hover:underline"
          >
            ← Back to property
          </a>
        </div>
        <div className="rounded-lg bg-background p-3 shadow">
          <div className="aspect-video w-full">
            <iframe
              src={property.vrTourUrl}
              className="h-full w-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
