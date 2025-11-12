import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISettings extends Document {
  whatsappNumber?: string; // E.164 digits only (no +)
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    whatsappNumber: { type: String, default: "" },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
