import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/database";

function maskConnectionString(uri?: string) {
  if (!uri) return undefined;
  try {
    const u = new URL(uri);
    if (u.username || u.password) {
      u.username = u.username ? "***" : "";
      u.password = u.password ? "***" : "";
    }
    // Hide query params that might include sensitive options
    u.search = "";
    return u.toString();
  } catch {
    return "masked";
  }
}

function stateToText(state: number) {
  switch (state) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "unknown";
  }
}

export async function GET() {
  const startedAt = Date.now();
  try {
    await connectDB();

    const state = mongoose.connection.readyState;
    const info: any = {
      ok: state === 1,
      state,
      stateText: stateToText(state),
      host: (mongoose.connection as any)?.host,
      name: (mongoose.connection as any)?.name,
      memoryFallback: Boolean((globalThis as any).__mongoMemoryServer),
      uri: maskConnectionString(process.env.MONGODB_URI),
      env: process.env.NODE_ENV,
      tookMs: Date.now() - startedAt,
    };

    return NextResponse.json(info, { status: state === 1 ? 200 : 503 });
  } catch (e: any) {
    const msg = e?.message || String(e);
    const info = {
      ok: false,
      error: msg,
      state: mongoose.connection.readyState,
      stateText: stateToText(mongoose.connection.readyState),
      memoryFallback: Boolean((globalThis as any).__mongoMemoryServer),
      uri: maskConnectionString(process.env.MONGODB_URI),
      env: process.env.NODE_ENV,
      tookMs: Date.now() - startedAt,
    };
    return NextResponse.json(info, { status: 500 });
  }
}
