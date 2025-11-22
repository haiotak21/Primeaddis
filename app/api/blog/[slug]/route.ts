import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import BlogPost from "@/models/BlogPost";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toSlug } from "@/lib/slugify";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  await connectDB();
  const { slug } = await params;
  const post = await BlogPost.findOne({ slug }).lean();
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!post.published) {
    const session = await getServerSession(authOptions as any);
    if (!session || !session.user || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  await connectDB();
  const session = await getServerSession(authOptions as any);
  if (!session || !session.user || !["admin", "superadmin"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json();
  const post = await BlogPost.findOne({ slug });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Update fields
  if (body.title) post.title = body.title;
  if (body.excerpt !== undefined) post.excerpt = body.excerpt;
  if (body.content !== undefined) post.content = body.content;
  if (body.coverImage !== undefined) post.coverImage = body.coverImage;
  if (body.tags !== undefined) post.tags = Array.isArray(body.tags) ? body.tags : (typeof body.tags === 'string' ? body.tags.split(',').map((t:string)=>t.trim()) : []);

  // Handle slug change
  if (body.slug && body.slug !== post.slug) {
    const newSlug = toSlug(body.slug || body.title || post.title);
    let candidate = newSlug || `${post._id?.toString?.() || Date.now().toString(36)}`;
    const exists = await BlogPost.findOne({ slug: candidate }).lean();
    if (exists && exists._id.toString() !== post._id.toString()) {
      candidate = `${candidate}-${Date.now().toString(36).slice(-6)}`;
    }
    post.slug = candidate;
  }

  if (body.published !== undefined) {
    post.published = !!body.published;
    post.publishedAt = post.published ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : undefined;
  }

  await post.save();
  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  await connectDB();
  const session = await getServerSession(authOptions as any);
  if (!session || !session.user || !["admin", "superadmin"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const post = await BlogPost.findOneAndDelete({ slug });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

