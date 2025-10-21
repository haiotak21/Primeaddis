import { NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import BlogPost, { type IBlogPost } from "@/models/BlogPost";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  await dbConnect();
  const post = await BlogPost.findOne({ slug: params.slug }).lean<IBlogPost>();
  if (!post || !post.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }
) {
  await dbConnect();
  const body = await req.json();
  const updated = await BlogPost.findOneAndUpdate({ slug: params.slug }, body, {
    new: true,
    upsert: true,
  });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  await dbConnect();
  const res = await BlogPost.deleteOne({ slug: params.slug });
  if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
