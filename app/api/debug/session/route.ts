import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || null;
  try {
    const session = await getServerSession(authOptions as any);
    return NextResponse.json({ cookieHeader, session });
  } catch (e: any) {
    return NextResponse.json({ cookieHeader, error: String(e) }, { status: 500 });
  }
}
