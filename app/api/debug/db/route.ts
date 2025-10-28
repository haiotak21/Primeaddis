import { NextResponse } from "next/server";
import connectDB from "@/lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  const env = process.env;
  const uri = env.MONGODB_URI || "";
  const summary = (() => {
    try {
      const u = new URL(uri);
      return {
        protocol: u.protocol.replace(":", ""),
        host: u.hostname,
        isSrv: uri.startsWith("mongodb+srv://"),
        hasDbPath: !!u.pathname && u.pathname !== "/",
      };
    } catch {
      return { protocol: uri.split(":")[0] || "", host: "<invalid>", isSrv: /\+srv:/.test(uri), hasDbPath: false };
    }
  })();

  try {
    await connectDB();
    const ms = Date.now() - started;
    return NextResponse.json({
      ok: true,
      connected: true,
      timeMs: ms,
      uri: summary,
      notes: "Connected to MongoDB successfully.",
    });
  } catch (err: any) {
    const ms = Date.now() - started;
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        timeMs: ms,
        uri: summary,
        error: err?.message || String(err),
        downUntil: (global as any).__dbDownUntil || null,
      },
      { status: 503 }
    );
  }
}
