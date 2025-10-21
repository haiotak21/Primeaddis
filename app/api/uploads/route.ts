import { NextResponse } from "next/server"
import { cloudinary } from "@/lib/cloudinary"

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

    // Upload each file to Cloudinary
    const uploads = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const uploaded = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: "primeaddis" }, (err: any, result: any) => {
            if (err) return reject(err)
            resolve(result)
          })
          stream.end(buffer)
        })
        return { url: uploaded.secure_url as string, public_id: uploaded.public_id as string }
      })
    )

    return NextResponse.json({ uploads })
  } catch (err: any) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Upload failed", details: err?.message || String(err) }, { status: 500 })
  }
}
