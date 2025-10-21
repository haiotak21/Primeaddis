"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function NewBlogPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (session && !["admin", "superadmin"].includes(session.user.role))
      router.push("/dashboard");
  }, [status, session, router]);

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
      if (published && !body.publishedAt)
        body.publishedAt = new Date().toISOString();
      const res = await axios.post("/api/blog", body);
      router.push(`/admin/blog/${res.data.post.slug}/edit`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>New Blog Post</CardTitle>
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
            Publish immediately
          </label>
          <div className="flex justify-end">
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
