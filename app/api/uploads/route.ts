import { NextResponse } from "next/server"
import { cloudinary } from "@/lib/cloudinary"

const MAX_BYTES = Number(process.env.UPLOAD_MAX_BYTES || 5 * 1024 * 1024) // 5MB default
// Default upload timeout (ms). Increase to 60s to tolerate slower network/dev setups.
const UPLOAD_TIMEOUT_MS = Number(process.env.CLOUDINARY_TIMEOUT_MS || 60000) // 60s default
const FAKE_UPLOAD = process.env.UPLOADS_FAKE === "true" || process.env.UPLOADS_FAKE === "1"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: "Uploads not configured" }, { status: 503 })
    }

    const formData = await req.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (FAKE_UPLOAD) {
      // Dev-only fake success to unblock UI without internet/Cloudinary
      const uploads = files.map(() => ({
        url: "https://placehold.co/300x300/png?text=Avatar",
        public_id: "dev-fake",
      }))
      return NextResponse.json({ uploads })
    }

    const uploads = await Promise.all(
      files.map(async (file) => {
        if (typeof file.size === "number" && file.size > MAX_BYTES) {
          throw new Error(`File too large. Max ${Math.round(MAX_BYTES / (1024 * 1024))}MB`)
        }
        const type = file.type || "image/jpeg"
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString("base64")
        const dataUri = `data:${type};base64,${base64}`
        // Try upload with one retry on transient timeout/network errors
        const attempt = async () =>
          await cloudinary.uploader.upload(dataUri, {
            folder: "primeaddis",
            resource_type: "image",
            timeout: UPLOAD_TIMEOUT_MS,
          } as any)

        try {
          const uploaded = await attempt()
          return { url: uploaded.secure_url as string, public_id: uploaded.public_id as string }
        } catch (e: any) {
          const msg = (e?.error?.message || e?.message || "").toString()
          const transient = /timeout|econnreset|etimedout|eai_again|socket hang up/i.test(msg)
          if (transient) {
            await new Promise((r) => setTimeout(r, 800))
            const uploaded = await attempt()
            return { url: uploaded.secure_url as string, public_id: uploaded.public_id as string }
          }
          throw e
        }
      })
    )

    return NextResponse.json({ uploads })
  } catch (err: any) {
    // Normalize Cloudinary timeout error or aborted client requests
    const msg = (err?.error?.message || err?.message || String(err)) as string
    const isTimeout = /timeout/i.test(msg) || err?.name === "TimeoutError" || err?.http_code === 499
    const status = isTimeout ? 504 : 500
    console.warn("Upload error:", { message: msg, code: err?.http_code || status, name: err?.name })
    return NextResponse.json({ error: isTimeout ? "Upload timed out" : "Upload failed", details: msg }, { status })
  }
}
