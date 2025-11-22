"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminBlogListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (session && !["admin", "superadmin"].includes(session.user.role))
      router.push("/dashboard");
    if (status === "authenticated") fetchPosts();
  }, [status, session, router]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/api/blog", {
        params: { includeDrafts: true },
      });
      setPosts(res.data.posts ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onConfirm = async () => {
      if (!deleteSlug) return;
      await axios.delete(`/api/blog/${deleteSlug}`);
      setPosts((prev) => prev.filter((p: any) => p.slug !== deleteSlug));
      setDeleteSlug(null);
    };
    const onOpenChange = (e: any) => {
      if (!e?.detail?.open) setDeleteSlug(null);
    };
    window.addEventListener("admin-blog-delete:confirm", onConfirm as any);
    window.addEventListener(
      "admin-blog-delete:open-change",
      onOpenChange as any
    );
    return () => {
      window.removeEventListener("admin-blog-delete:confirm", onConfirm as any);
      window.removeEventListener(
        "admin-blog-delete:open-change",
        onOpenChange as any
      );
    };
  }, [deleteSlug]);

  const togglePublish = async (slug: string, next: boolean) => {
    const post = posts.find((p) => p.slug === slug);
    if (!post) return;
    const body = {
      ...post,
      published: next,
      publishedAt: next ? new Date().toISOString() : undefined,
    };
    await axios.put(`/api/blog/${slug}`, body);
    setPosts((prev) =>
      prev.map((p) =>
        p.slug === slug
          ? { ...p, published: next, publishedAt: body.publishedAt }
          : p
      )
    );
  };

  if (status === "loading" || loading)
    return <div className="p-8">Loading...</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Button asChild>
          <Link href="/admin/blog/new">New Post</Link>
        </Button>
      </div>
      <div className="grid gap-4">
        {posts.map((p) => (
          <Card key={p.slug}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{p.title}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={p.published ? "secondary" : "default"}
                    onClick={() => togglePublish(p.slug, !p.published)}
                  >
                    {p.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/blog/${p.slug}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteSlug(p.slug)}
                  >
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {p.excerpt}
              </p>
            </CardContent>
          </Card>
        ))}
        {posts.length === 0 && (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              No posts yet.
            </CardContent>
          </Card>
        )}
      </div>
      <ConfirmDialog
        open={!!deleteSlug}
        title="Delete post?"
        description="This action cannot be undone."
        confirmText="Delete"
        confirmEvent="admin-blog-delete:confirm"
        openChangeEvent="admin-blog-delete:open-change"
      />
    </div>
  );
}
