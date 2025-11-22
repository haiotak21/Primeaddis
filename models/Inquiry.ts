import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IInquiry extends Document {
  propertyId?: mongoose.Types.ObjectId;
  propertyTitle?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  responded?: boolean;
  createdAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property" },
    propertyTitle: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String },
    responded: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Inquiry: Model<IInquiry> = mongoose.models.Inquiry || mongoose.model<IInquiry>("Inquiry", InquirySchema);

export default Inquiry;
