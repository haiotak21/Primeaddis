import { NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import { sendMail } from "@/lib/mailer";
import connectDB from "@/lib/database";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    // Only superadmin can invite agents/admins
    const session = await requireRole(["superadmin"]);
    if (session instanceof NextResponse) return session;

    const body = await req.json().catch(() => null as any);
    const rawEmail = (body?.email as string) || "";
    const rawPassword = (body?.password as string) || "";
    const email = rawEmail.trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!rawPassword || rawPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    await connectDB();

    const password = await bcrypt.hash(rawPassword, 10);

    // Upsert agent account with password so they can sign in directly
    const existing = await User.findOne({ email }).select("+password");
    if (existing) {
      if (existing.role === "superadmin") {
        return NextResponse.json({ error: "Cannot change superadmin" }, { status: 400 });
      }
      existing.role = "agent";
      // Set password if not set; otherwise overwrite for this admin provisioning
      existing.password = password;
      await existing.save();
    } else {
      await User.create({ name: email.split("@")[0], email, role: "agent", password });
    }

    // Optional notification email
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const html = `<p>Hello,</p>
<p>You have been provisioned with an agent account on RealEstatePro.</p>
<p>Email: <b>${email}</b></p>
<p>You can sign in directly at <a href="${appUrl}/auth/signin">${appUrl}/auth/signin</a>.</p>`;
    sendMail({ to: email, subject: "Your Agent Account is Ready", html }).catch(() => {});

    return NextResponse.json({ message: "Agent account provisioned" });
  } catch (e) {
    console.error("agent invite error", e);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
}
