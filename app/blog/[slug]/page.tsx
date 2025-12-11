import { notFound } from "next/navigation";
import { getAbsoluteBaseUrl } from "@/utils/helpers";
import BlogDetail from "@/components/blog/blog-detail";

async function getPost(slug: string) {
  const base = await getAbsoluteBaseUrl();
  const res = await fetch(`${base}/api/blog/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.post as { title: string; content: string; publishedAt?: string };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const post = await getPost(slug);
    if (!post) notFound();

    const base = await getAbsoluteBaseUrl();
    const description =
      (post as any).excerpt || (post.content || "").slice(0, 160);
    const image = (post as any).featuredImage || (post as any).coverImage;
    return {
      title: `${post.title} | Real Estate Tips - Prime Addis Et`,
      description,
      openGraph: {
        title: post.title,
        description,
        images: image ? [image] : [],
        type: "article",
      },
      alternates: { canonical: `${base}/blog/${slug}` },
      robots: { index: true, follow: true },
    } as any;
  } catch (error) {
    console.error("Metadata fetch failed for blog slug", slug, error);
    notFound();
  }
}

function renderMarkdown(md: string) {
  // Minimal markdown: paragraphs and headings; keeps dependency light
  return md.split("\n").map((line, i) => {
    if (line.startsWith("# "))
      return (
        <h1 key={i} className="text-3xl font-bold my-4">
          {line.slice(2)}
        </h1>
      );
    if (line.startsWith("## "))
      return (
        <h2 key={i} className="text-2xl font-semibold my-3">
          {line.slice(3)}
        </h2>
      );
    if (line.startsWith("### "))
      return (
        <h3 key={i} className="text-xl font-semibold my-2">
          {line.slice(4)}
        </h3>
      );
    if (line.trim() === "") return <br key={i} />;
    return (
      <p key={i} className="my-2 leading-7">
        {line}
      </p>
    );
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const post = await getPost(slug);
    if (!post) return notFound();

    // Render the client-side blog detail UI component
    return <BlogDetail post={post as any} />;
  } catch (error) {
    console.error("Render failed for blog slug", slug, error);
    return notFound();
  }
}
