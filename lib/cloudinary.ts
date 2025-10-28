import "server-only"
import { v2 as cloudinary } from "cloudinary"

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_TIMEOUT_MS } = process.env

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn("Cloudinary env vars are not fully set. Upload API will be disabled until configured.")
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
  timeout: CLOUDINARY_TIMEOUT_MS ? Number(CLOUDINARY_TIMEOUT_MS) : undefined,
})

export { cloudinary }
