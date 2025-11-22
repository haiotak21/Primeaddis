import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const form = await (req as any).formData();
    const file = form.get("file") as any;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        { folder: "primeaddis/hero", use_filename: true, unique_filename: false },
        (err: any, result: any) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    return NextResponse.json({ url: uploadResult.secure_url, raw: uploadResult });
  } catch (e: any) {
    console.error("/api/admin/hero/upload error", e?.message || e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
