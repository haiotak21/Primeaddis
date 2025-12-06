import { MetadataRoute } from "next";
import { getAbsoluteBaseUrl } from "@/utils/helpers";
import { toSlug } from "@/lib/slugify";

async function safeFetchJson(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getAbsoluteBaseUrl();

  // Fetch data defensively so build doesn't fail when API is unreachable during export
  const [propsJson, blogsJson] = await Promise.all([
    safeFetchJson(`${base}/api/properties`),
    safeFetchJson(`${base}/api/blog`),
  ]);

  const properties = propsJson?.properties || propsJson?.list || propsJson || [];
  const posts = blogsJson?.posts || blogsJson || [];

  const propertyUrls = (properties || [])
    .map((p: any) => {
      const baseSlug =
        p?.slug ||
        toSlug(`${p?.title || "property"} ${p?.location?.city || ""} ${p?.location?.region || ""}`);
      if (!baseSlug) return null;
      const slugWithId = !p?.slug && p?._id ? `${baseSlug}-${p._id}` : baseSlug;
      return {
        url: `${base}/addis-bet/${slugWithId}`,
        lastModified: p?.updatedAt || p?.updated_at || p?.updated || undefined,
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
        lastModified: b?.publishedAt || b?.published_at || b?.published || undefined,
        priority: 0.7,
      };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  return [
    { url: `${base}`, lastModified: new Date(), priority: 1 },
    { url: `${base}/addis-bet`, priority: 0.9 },
    { url: `${base}/blog`, priority: 0.8 },
    ...propertyUrls,
    ...blogUrls,
  ];
}
