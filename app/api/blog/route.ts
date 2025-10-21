import { NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import BlogPost from "@/models/BlogPost";

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  const includeDrafts = url.searchParams.get("includeDrafts") === "true";
  const query = includeDrafts ? {} : { published: true };
  const posts = await BlogPost.find(query)
    .sort({ publishedAt: -1, createdAt: -1 })
    .select("title slug excerpt coverImage tags publishedAt")
    .lean();
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const post = await BlogPost.create(body);
  return NextResponse.json({ post });
}
