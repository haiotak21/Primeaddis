import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json({ session })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
