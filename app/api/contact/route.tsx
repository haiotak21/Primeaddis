import { type NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/database";
import Property from "@/models/Property";
import Notification from "@/models/Notification";
import Inquiry from "@/models/Inquiry";

export async function POST(req: NextRequest) {
  try {
    const { propertyId, name, email, phone, message } = await req.json();

    await connectDB();

    const property = await Property.findById(propertyId).populate("listedBy");

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const agent = property.listedBy as any;

    // Create notification for agent
    await Notification.create({
      userId: agent._id,
      message: `New inquiry for "${property.title}" from ${name}`,
      type: "inquiry",
      relatedId: propertyId,
    });

    // Persist the inquiry so admins can manage it
    try {
      await Inquiry.create({
        propertyId,
        propertyTitle: property.title,
        name,
        email,
        phone,
        message,
      });
    } catch (e) {
      console.warn("Failed to persist inquiry:", (e as any)?.message || e);
    }

    // Send email to agent
    if (process.env.EMAIL_SERVER_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || "noreply@realestatepro.com",
        to: agent.email,
        subject: `New Inquiry for ${property.title}`,
        html: `
          <h2>New Property Inquiry</h2>
          <p>You have received a new inquiry for your property: <strong>${
            property.title
          }</strong></p>
          
          <h3>Contact Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone || "Not provided"}</li>
          </ul>
          
          <h3>Message:</h3>
          <p>${message}</p>
          
          <p>Please respond to this inquiry as soon as possible.</p>
        `,
      });
    }

    return NextResponse.json({ message: "Inquiry sent successfully" });
  } catch (error) {
    console.error("Error sending inquiry:", error);
    return NextResponse.json(
      { error: "Failed to send inquiry" },
      { status: 500 }
    );
  }
}
