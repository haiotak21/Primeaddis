import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  const configured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
  if (!configured) {
    return NextResponse.json(
      { ok: false, configured: false, error: "Cloudinary not configured" },
      { status: 503 }
    );
  }

  const timeoutMs = Number(process.env.CLOUDINARY_TIMEOUT_MS || 20000);
  const withTimeout = <T>(p: Promise<T>) =>
    Promise.race<T>([
      p,
      new Promise<T>((_, rej) => setTimeout(() => rej(new Error("Timeout")), timeoutMs)),
    ]);

  try {
    const ping = async () => {
      const api: any = (cloudinary as any).api;
      if (api && typeof api.ping === "function") {
        return api.ping();
      }
      // Fallback: list minimal resources to verify admin credentials/connectivity
      return api.resources({ type: "upload", max_results: 1 });
    };

    const result: any = await withTimeout(ping());
    const ms = Date.now() - started;
    return NextResponse.json({ ok: true, timeMs: ms, result: { status: result?.status || "ok" } });
  } catch (err: any) {
    const ms = Date.now() - started;
    const msg = err?.error?.message || err?.message || String(err);
    return NextResponse.json({ ok: false, timeMs: ms, error: msg }, { status: 502 });
  }
}
