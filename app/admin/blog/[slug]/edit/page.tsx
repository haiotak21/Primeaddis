"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function EditBlogPostPage() {
  const { data: session, status } = useSession();
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (session && !["admin", "superadmin"].includes(session.user.role))
      router.push("/dashboard");
    if (status === "authenticated") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router]);

  const load = async () => {
    try {
      const res = await axios.get(`/api/blog/${params.slug}`);
      const p = res.data.post;
      setTitle(p.title || "");
      setSlug(p.slug || params.slug);
      setExcerpt(p.excerpt || "");
      setContent(p.content || "");
      setTags((p.tags || []).join(", "));
      setCoverImage(p.coverImage || "");
      setPublished(Boolean(p.published));
      setPublishedAt(p.publishedAt);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: any = {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        published,
      };
      body.tags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (published && !publishedAt)
        body.publishedAt = new Date().toISOString();
      await axios.put(`/api/blog/${params.slug}`, body);
      if (slug !== params.slug) router.replace(`/admin/blog/${slug}/edit`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  if (status === "loading" || loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Blog Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <Input
            placeholder="Cover image URL"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />
          <Input
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <Textarea
            placeholder="Short excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
          <Textarea
            placeholder="# Heading\nWrite markdown content..."
            className="min-h-64"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={published}
              onCheckedChange={(v) => setPublished(Boolean(v))}
            />
            Published
          </label>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="mr-2"
              onClick={() => router.push("/admin/blog")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !title || !slug || !content}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
