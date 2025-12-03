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
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return notFound();

  // Render the client-side blog detail UI component
  return <BlogDetail post={post as any} />;
}
