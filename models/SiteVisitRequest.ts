import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISiteVisitRequest extends Document {
  propertyId: mongoose.Types.ObjectId;
  propertyTitle: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  // Email delivery status
  emailSent?: boolean;
  emailError?: string;
  createdAt: Date;
}

const SiteVisitRequestSchema = new Schema<ISiteVisitRequest>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    propertyTitle: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    emailSent: { type: Boolean, default: false },
    emailError: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const SiteVisitRequest: Model<ISiteVisitRequest> =
  mongoose.models.SiteVisitRequest || mongoose.model<ISiteVisitRequest>("SiteVisitRequest", SiteVisitRequestSchema);

export default SiteVisitRequest;
