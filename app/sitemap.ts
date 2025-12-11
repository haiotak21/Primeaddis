import { MetadataRoute } from "next";
import { getAbsoluteBaseUrl } from "@/utils/helpers";
import { toSlug } from "@/lib/slugify";
import connectDB from "@/lib/database";
import Property from "@/models/Property";
import BlogPost from "@/models/BlogPost";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getAbsoluteBaseUrl();

  await connectDB();

  // Only publish active properties and published blog posts
  const [properties, posts] = await Promise.all([
    Property.find({ status: "active" })
      .select("slug title location updatedAt _id")
      .lean(),
    BlogPost.find({ published: true })
      .select("slug title publishedAt updatedAt")
      .lean(),
  ]);

  const propertyUrls = (properties || [])
    .map((p: any) => {
      const baseSlug =
        p?.slug ||
        toSlug(
          `${p?.title || "property"} ${p?.location?.city || ""} ${p?.location?.region || ""}`
        );
      if (!baseSlug) return null;
      const slugWithId = !p?.slug && p?._id ? `${baseSlug}-${p._id}` : baseSlug;
      return {
        url: `${base}/properties/${slugWithId}`,
        lastModified: p?.updatedAt || undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  const blogUrls = (posts || [])
    .map((b: any) => {
      const blogSlug = b?.slug || toSlug(b?.title || "blog");
      if (!blogSlug) return null;
      return {
        url: `${base}/blog/${blogSlug}`,
        lastModified: b?.updatedAt || b?.publishedAt || undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  return [
    { url: `${base}`, lastModified: new Date(), priority: 1 },
    { url: `${base}/addis-bet`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/blog`, lastModified: new Date(), priority: 0.8 },
    ...propertyUrls,
    ...blogUrls,
  ];
}
