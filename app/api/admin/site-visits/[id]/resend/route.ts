import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import connectDB from "@/lib/database";
import SiteVisitRequest from "@/models/SiteVisitRequest";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["admin", "superadmin"]);
  if (session instanceof NextResponse) return session;

  try {
    await connectDB();
    const { id } = await params;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const doc = await SiteVisitRequest.findById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const recipientEmail = process.env.SITE_VISIT_RECIPIENT || "haiotak21@gmail.com";

    const agentSubject = `Resend: New Site Visit Request${doc.propertyTitle ? `: ${doc.propertyTitle}` : ""}`;
    const agentText = `You have a site visit request (resend).

Property: ${doc.propertyTitle || doc.propertyId}
Name: ${doc.name}
Email: ${doc.email}
Phone: ${doc.phone}
Preferred Date: ${doc.date}

Submitted at: ${new Date(doc.createdAt).toISOString()}
`;

    const requesterSubject = "We received your site visit request";
    const requesterText = `Thanks ${doc.name},

We received your request to visit ${doc.propertyTitle || "the property"}.
We'll get back to you shortly to confirm the schedule.

– RealEstatePro Team`;

    let emailWarn = false;
    let mailerUnverified = false;

    // Try MailerSend first when available
    if (process.env.MAILERSEND_API_KEY) {
      try {
        const fromAddress = process.env.MAILERSEND_FROM || process.env.SMTP_FROM || process.env.EMAIL_USER || "no-reply@example.com";
        const sendViaMailerSend = async (to: string, subject: string, text: string, replyTo?: string) => {
          const body: any = {
            from: { email: fromAddress },
            to: [{ email: to }],
            subject,
            text,
          };
          if (replyTo) body.reply_to = { email: replyTo };
          const res = await fetch("https://api.mailersend.com/v1/email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
            },
            body: JSON.stringify(body),
          });
          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            const e: any = new Error(`MailerSend error ${res.status}: ${txt}`);
            e.status = res.status;
            e.body = txt;
            throw e;
          }
        };

        if (recipientEmail) await sendViaMailerSend(recipientEmail, agentSubject, agentText, doc.email);
        if (doc.email) await sendViaMailerSend(doc.email, requesterSubject, requesterText);
      } catch (err: any) {
        if (err?.status === 422) mailerUnverified = true;
        console.warn("MailerSend resend failed, will try SMTP:", err?.message || err);
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
            auth: {
              user: process.env.SMTP_USER || process.env.EMAIL_USER,
              pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
            },
          });
          if (recipientEmail) {
            await transporter.sendMail({
              from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@example.com",
              to: recipientEmail,
              replyTo: doc.email,
              subject: agentSubject,
              text: agentText,
            });
          }
          if (doc.email) {
            await transporter.sendMail({
              from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@example.com",
              to: doc.email,
              subject: requesterSubject,
              text: requesterText,
            });
          }
        } catch (smtpErr) {
          emailWarn = true;
          console.warn("Resend via SMTP failed:", smtpErr?.message || smtpErr);
        }
      }
    } else {
      // Only SMTP configured
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER || process.env.EMAIL_USER,
            pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
          },
        });
        if (recipientEmail) {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@example.com",
            to: recipientEmail,
            replyTo: doc.email,
            subject: agentSubject,
            text: agentText,
          });
        }
        if (doc.email) {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@example.com",
            to: doc.email,
            subject: requesterSubject,
            text: requesterText,
          });
        }
      } catch (err) {
        emailWarn = true;
        console.warn("Resend via SMTP failed:", err?.message || err);
      }
    }

    // update status
    try {
      const finalEmailSent = mailerUnverified ? false : !emailWarn;
      const finalEmailError = mailerUnverified ? "mailer_unverified" : emailWarn ? "email_failed" : "";
      doc.emailSent = finalEmailSent;
      doc.emailError = finalEmailError;
      await doc.save();
    } catch (updErr) {
      console.warn("Failed to persist resend status:", updErr?.message || updErr);
    }

    if (mailerUnverified) return NextResponse.json({ success: true, warning: "mailer_unverified" });
    if (emailWarn) return NextResponse.json({ success: true, warning: "email_failed" });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend site-visit error:", error);
    return NextResponse.json({ error: "Failed to resend" }, { status: 500 });
  }
}

export const runtime = "nodejs";
