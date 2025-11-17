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

    // Prefer SendGrid if API key is configured; otherwise fallback to SMTP (nodemailer)
    let emailWarn = false;
    if (process.env.MAILERSEND_API_KEY) {
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
            throw new Error(`MailerSend error ${res.status}: ${txt}`);
          }
        };

        if (recipientEmail) {
          await sendViaMailerSend(recipientEmail, agentSubject, agentText, email);
        }

        if (email) {
          await sendViaMailerSend(email, requesterSubject, requesterText);
        }
      } catch (err) {
        console.error("MailerSend failed to send emails:", err);
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
        } catch (smtpErr) {
          emailWarn = true;
          console.error("MailerSend failed and SMTP fallback also failed:", smtpErr);
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
          console.error("Failed to send notification email to agent/admin:", err);
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
          console.error("Failed to send confirmation email to requester:", err);
        }
      }
    }

    // Even if email sending failed (SMTP auth or other reasons), the site visit
    // request itself was saved successfully. Return success to the client and
    // log a warning so the server remains resilient.
    if (emailWarn) {
      return NextResponse.json({ success: true, id: saved._id, warning: "email_failed" });
    }

    return NextResponse.json({ success: true, id: saved._id });
  } catch (error) {
    console.error("Error handling site visit request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
