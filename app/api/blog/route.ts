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
  return NextResponse.json({ posts });
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

