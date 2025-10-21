import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getPosts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/blog`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return data.posts as Array<{
    title: string;
    slug: string;
    excerpt?: string;
    coverImage?: string;
    publishedAt?: string;
  }>;
}

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Blog & News</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((p) => (
          <Card key={p.slug}>
            <CardHeader>
              <CardTitle>
                <Link href={`/blog/${p.slug}`}>{p.title}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {p.excerpt ? (
                <p className="text-muted-foreground">{p.excerpt}</p>
              ) : null}
              {p.publishedAt ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(p.publishedAt).toLocaleDateString()}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
