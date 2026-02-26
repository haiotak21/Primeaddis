import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Property from "@/models/Property"
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

    // Find property (for context) and determine recipient
    const property = await Property.findById(propertyId).populate("listedBy", "name email").lean();
    // Force schedule-viewing notifications to a dedicated email for the owner/operator.
    // Allow overriding via `SITE_VISIT_RECIPIENT` env var if needed.
    const recipientEmail = process.env.SITE_VISIT_RECIPIENT || "haiotak21@gmail.com";

    // Prepare email content
    const agentSubject = `New Site Visit Request${propertyTitle ? `: ${propertyTitle}` : ""}`;
    const agentText = `You have a new site visit request.

Property: ${propertyTitle || property?._id?.toString() || propertyId}
Name: ${name}
Email: ${email}
Phone: ${phone}
Preferred Date: ${date}

Submitted at: ${new Date(saved.createdAt).toISOString()}
    `;

    const requesterSubject = "We received your site visit request";
    const requesterText = `Thanks ${name},

We received your request to visit ${propertyTitle || "the property"}.
We'll get back to you shortly to confirm the schedule.

– RealEstatePro Team`;

    // Determine whether outgoing emails are enabled in global settings
    let siteVisitEmailEnabled = true;
    try {
      const Settings = (await import("@/models/Settings")).default;
      const doc = await Settings.findOne().lean();
      if (typeof doc?.siteVisitEmailEnabled === "boolean") {
        siteVisitEmailEnabled = !!doc.siteVisitEmailEnabled;
      }
    } catch (err) {
      // ignore — default to true so existing behavior remains until settings are configured
    }

    // Prefer MailerSend if API key is configured; otherwise fallback to SMTP (nodemailer)
    let emailWarn = false;
    let mailerUnverified = false;
    // Only attempt to send outbound emails when the admin toggle is enabled
    if (siteVisitEmailEnabled && process.env.MAILERSEND_API_KEY) {
      try {
        const fromAddress = process.env.MAILERSEND_FROM || process.env.SMTP_FROM || process.env.EMAIL_USER || "no-reply@example.com";

        const sendViaMailerSend = async (to: string, subject: string, text: string, replyTo?: string) => {
          const body: any = {
            from: { email: fromAddress },
            to: [ { email: to } ],
            subject,
            text,
          };
          if (replyTo) {
            body.reply_to = { email: replyTo };
          }

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

        if (siteVisitEmailEnabled) {
          if (recipientEmail) {
            await sendViaMailerSend(recipientEmail, agentSubject, agentText, email);
          }

          if (email) {
            await sendViaMailerSend(email, requesterSubject, requesterText);
          }
        }
      } catch (err: any) {
        // Detect MailerSend 422 (unverified from domain) and mark for frontend.
        if (err?.status === 422) {
          mailerUnverified = true;
        }
        // MailerSend failures are often expected in dev (unverified sender/domain).
        // Log as a warning to avoid dev overlay from intercepted console.error.
        console.warn("MailerSend failed to send emails (will attempt SMTP fallback):", err?.message || err);
        // Try SMTP fallback when MailerSend rejects (useful if from domain not verified)
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

          if (siteVisitEmailEnabled) {
            if (recipientEmail) {
              await transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@example.com",
                to: recipientEmail,
                replyTo: email,
                subject: agentSubject,
                text: agentText,
              });
            }

            if (email) {
              await transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@example.com",
                to: email,
                subject: requesterSubject,
                text: requesterText,
              });
            }
          }
        } catch (smtpErr) {
          emailWarn = true;
          console.warn("MailerSend failed and SMTP fallback also failed:", smtpErr?.message || smtpErr);
        }
      }
    } else {
      // Configure transporter (SMTP)
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
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@example.com",
            to: recipientEmail,
            replyTo: email,
            subject: agentSubject,
            text: agentText,
          });
        } catch (err) {
          emailWarn = true;
          console.warn("Failed to send notification email to agent/admin:", err?.message || err);
        }
      }

      // Optional: confirmation to requester
      if (email) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@example.com",
            to: email,
            subject: requesterSubject,
            text: requesterText,
          });
        } catch (err) {
          emailWarn = true;
          console.warn("Failed to send confirmation email to requester:", err?.message || err);
        }
      }
    }

    // Persist email send status on the saved record so admins can inspect/resend later
    try {
      let finalEmailSent = false;
      let finalEmailError = "";

      if (!siteVisitEmailEnabled) {
        finalEmailSent = false;
        finalEmailError = "disabled_by_settings";
      } else if (mailerUnverified) {
        finalEmailSent = false;
        finalEmailError = "mailer_unverified";
      } else if (emailWarn) {
        finalEmailSent = false;
        finalEmailError = "email_failed";
      } else {
        finalEmailSent = true;
        finalEmailError = "";
      }

      // Update the saved document with email status (non-blocking but attempt it)
      try {
        await SiteVisitRequest.findByIdAndUpdate(saved._id, {
          emailSent: finalEmailSent,
          emailError: finalEmailError,
        });
      } catch (updErr) {
        console.warn("Failed to update SiteVisitRequest email status:", updErr?.message || updErr);
      }
    } catch (persistErr) {
      console.warn("Error while persisting email status:", persistErr?.message || persistErr);
    }

    // Even if email sending failed (SMTP auth or other reasons), the site visit
    // request itself was saved successfully. Return success to the client and
    // include a specific warning when MailerSend reported an unverified sender.
    if (mailerUnverified) {
      return NextResponse.json({ success: true, id: saved._id, warning: "mailer_unverified" });
    }

    if (emailWarn) {
      return NextResponse.json({ success: true, id: saved._id, warning: "email_failed" });
    }

    return NextResponse.json({ success: true, id: saved._id });
  } catch (error) {
    console.error("Error handling site visit request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
