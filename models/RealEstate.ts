import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IRealEstate extends Document {
  name: string
  logo?: string
  description?: string
  website?: string
  createdAt: Date
  updatedAt: Date
}

const RealEstateSchema = new Schema<IRealEstate>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    logo: String,
    description: String,
    website: String,
  },
  { timestamps: true }
)

const RealEstate: Model<IRealEstate> = mongoose.models.RealEstate || mongoose.model<IRealEstate>("RealEstate", RealEstateSchema)

export default RealEstate
