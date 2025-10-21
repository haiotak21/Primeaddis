import { notFound } from "next/navigation";

async function getPost(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/blog/${slug}`,
    { cache: "no-store" }
  );
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
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) return notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 prose dark:prose-invert">
      <h1 className="mb-2 text-4xl font-bold">{post.title}</h1>
      {post.publishedAt ? (
        <p className="text-sm text-muted-foreground">
          {new Date(post.publishedAt).toLocaleDateString()}
        </p>
      ) : null}
      <div className="mt-6">{renderMarkdown(post.content)}</div>
    </div>
  );
}
