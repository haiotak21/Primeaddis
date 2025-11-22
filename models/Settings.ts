import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISettings extends Document {
  whatsappNumber?: string; // E.164 digits only (no +)
  // Whether site-visit requests should trigger outgoing emails in addition to
  // being stored in the admin dashboard. Superadmin can toggle this in UI.
  siteVisitEmailEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    whatsappNumber: { type: String, default: "" },
    siteVisitEmailEnabled: { type: Boolean, default: false },
      // Currency settings
      currency: { type: String, default: "ETB" },
      exchangeRate: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
