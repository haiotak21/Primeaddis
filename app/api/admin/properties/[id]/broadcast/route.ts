import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Property from "@/models/Property";
import User from "@/models/User";
import { requireRole } from "@/lib/middleware/auth";
import { sendMail } from "@/lib/mailer";
import mongoose from "mongoose";

// POST /api/admin/properties/[id]/broadcast
// Body (optional): { force: true } to send even if property.status !== 'active'
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["admin", "superadmin"]);
    if (session instanceof NextResponse) return session;

    const body = await req.json().catch(() => ({}));
    const force = !!body.force;

    await connectDB();

    const resolvedParams: any = params as any;
    if (!mongoose.isValidObjectId(resolvedParams.id)) {
      return NextResponse.json({ error: "Invalid property id" }, { status: 400 });
    }

    const property = await Property.findById(resolvedParams.id).lean();
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    if (property.status !== "active" && !force) {
      return NextResponse.json({ error: "Property is not active. Use { force: true } to override." }, { status: 400 });
    }

    // Find recipients: regular users who opted in to marketing
    const recipients = await User.find({ role: "user", isActive: true, marketingOptIn: true })
      .select("email name")
      .lean();

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ message: "No recipients found" });
    }

    const url = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/properties/${property._id}`;
    const subject = `New property listed: ${property.title}`;
    const thumbnail = (property as any).images && (property as any).images[0]
      ? `<img src="${(property as any).images[0]}" alt="${property.title}" style="max-width:300px;display:block;margin-bottom:12px;border-radius:8px;"/>`
      : "";

    const htmlFor = (user: any) => `${thumbnail}<p>Hello${user.name ? ` ${user.name}` : ""},</p>
      <p>We just listed a new property that might interest you:</p>
      <ul>
        <li><b>${property.title}</b></li>
        <li>Type: ${property.type} — ${property.listingType}</li>
        <li>Location: ${property.location?.city || ""}, ${property.location?.region || ""}</li>
        <li>Price: ${property.price}</li>
      </ul>
      <p><a href="${url}">View property</a></p>
      <p>If you do not wish to receive these emails, please update your preferences in your account.</p>`;

    const batchSize = 20;
    let sent = 0;
    let failed = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((u: any) => sendMail({ to: u.email, subject, html: htmlFor(u), from: process.env.SMTP_FROM }).catch((e) => e)),
      );

      results.forEach((r, idx) => {
        const email = batch[idx].email;
        if (r.status === "fulfilled") sent++;
        else {
          failed++;
          errors.push({ email, error: String((r as any).reason || r) });
        }
      });

      if (i + batchSize < recipients.length) await new Promise((r) => setTimeout(r, 500));
    }

    return NextResponse.json({ total: recipients.length, sent, failed, errors: errors.slice(0, 20) });
  } catch (error) {
    console.error("Error running manual broadcast:", error);
    return NextResponse.json({ error: "Failed to run broadcast" }, { status: 500 });
  }
}
