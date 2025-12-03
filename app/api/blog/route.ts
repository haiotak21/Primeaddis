import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import BlogPost from "@/models/BlogPost";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toSlug } from "@/lib/slugify";

export async function GET(req: NextRequest) {
  await connectDB();
  let parsedUrl;
  try {
    parsedUrl = new URL(req.url);
  } catch (e) {
    const base = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
    parsedUrl = new URL(req.url, base);
  }
  const includeDrafts = parsedUrl.searchParams.get("includeDrafts") === "true";

  if (includeDrafts) {
    const session = await getServerSession(authOptions as any);
    if (!session || !session.user || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const posts = await BlogPost.find({}).sort({ publishedAt: -1, createdAt: -1 }).lean();
    return NextResponse.json({ posts });
  }

  const posts = await BlogPost.find({ published: true }).sort({ publishedAt: -1 }).lean();

  // Attach author info when available (authorId stored on the post)
  const authorIds = Array.from(new Set(posts.map((p: any) => p.authorId).filter(Boolean)));
  let authorsMap: Record<string, any> = {};
  if (authorIds.length) {
    const User = (await import("@/models/User")).default;
    const users = await User.find({ _id: { $in: authorIds } }).lean();
    authorsMap = users.reduce((acc: any, u: any) => {
      acc[u._id.toString()] = { name: u.name, profileImage: u.profileImage, role: u.role };
      return acc;
    }, {} as Record<string, any>);
  }

  const postsWithAuthors = posts.map((p: any) => ({
    ...p,
    author: p.authorId ? authorsMap[p.authorId] || null : null,
  }));

  return NextResponse.json({ posts: postsWithAuthors });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions as any);
  if (!session || !session.user || !["admin", "superadmin"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, excerpt, content, coverImage, tags, published } = body;
  if (!title || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const baseSlug = toSlug(body.slug || title);
  let slug = baseSlug || `post-${Date.now().toString(36)}`;
  // Ensure unique slug
  const exists = await BlogPost.findOne({ slug }).lean();
  if (exists) {
    slug = `${baseSlug}-${Date.now().toString(36).slice(-6)}`;
  }

  const post = await BlogPost.create({
    title,
    slug,
    excerpt,
    content,
    coverImage,
    tags: Array.isArray(tags) ? tags : (typeof tags === 'string' && tags.length ? tags.split(',').map((t:string)=>t.trim()) : []),
    published: !!published,
    publishedAt: published ? new Date() : undefined,
    authorId: session.user.id,
  });

  return NextResponse.json({ post }, { status: 201 });
}

