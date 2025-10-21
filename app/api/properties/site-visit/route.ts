import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Property from "@/models/Property";
import SiteVisitRequest from "@/models/SiteVisitRequest";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { propertyId, name, email, phone, date, propertyTitle } = await req.json();
    if (!propertyId || !name || !email || !phone || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    await connectDB();

    // Save the request
    const saved = await SiteVisitRequest.create({
      propertyId,
      propertyTitle: propertyTitle || "",
      name,
      email,
      phone,
      date,
    });

    // Find property and listing agent email
    const property = await Property.findById(propertyId).populate("listedBy", "name email").lean();
    const recipientEmail = (property as any)?.listedBy?.email || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    // Configure transporter (SMTP preferred)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
    });

    // Send notification email to agent/admin
    if (recipientEmail) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@example.com",
        to: recipientEmail,
        replyTo: email,
        subject: `New Site Visit Request${propertyTitle ? `: ${propertyTitle}` : ""}`,
        text: `You have a new site visit request.

Property: ${propertyTitle || property?._id?.toString() || propertyId}
Name: ${name}
Email: ${email}
Phone: ${phone}
Preferred Date: ${date}

Submitted at: ${new Date(saved.createdAt).toISOString()}
        `,
      });
    }

    // Optional: confirmation to requester
    if (email) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@example.com",
        to: email,
        subject: "We received your site visit request",
        text: `Thanks ${name},

We received your request to visit ${propertyTitle || "the property"}.
We'll get back to you shortly to confirm the schedule.

– RealEstatePro Team`,
      });
    }

    return NextResponse.json({ success: true, id: saved._id });
  } catch (error) {
    console.error("Error handling site visit request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
