import { notFound } from "next/navigation";
import connectDB from "@/lib/database";
import Property from "@/models/Property";

function isValidObjectId(id: string) {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
}

async function getProperty(id: string) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  return Property.findById(id).lean();
}

export default async function PropertyVRPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  const property = await getProperty(id);
  if (!property || !property.vrTourUrl) notFound();

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <a
            href={`/properties/${id}`}
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
