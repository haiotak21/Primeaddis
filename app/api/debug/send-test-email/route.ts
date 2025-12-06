import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/middleware/auth"
import { sendMail } from "@/lib/mailer"

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(["admin", "superadmin"])
    if (session instanceof NextResponse) return session

    const body = await req.json().catch(() => ({}))
    const to = body.to || session.user?.email || process.env.RESEND_FROM
    const subject = body.subject || `Test email from ${process.env.SITE_NAME || 'PrimeAddis'}`
    const html = body.html || `<p>Test email sent at ${new Date().toISOString()}</p>`

    try {
      const providerResponse = await sendMail({ to, subject, html, from: process.env.RESEND_FROM })
      return NextResponse.json({ success: true, providerResponse })
    } catch (err) {
      console.error('Test email failed:', err)
      return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
    }
  } catch (err) {
    console.error('Auth or other error in test email endpoint:', err)
    return NextResponse.json({ error: 'Unauthorized or server error' }, { status: 401 })
  }
}
