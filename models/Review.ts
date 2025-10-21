import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId
  propertyId: mongoose.Types.ObjectId
  rating: number
  comment: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
ReviewSchema.index({ propertyId: 1 })
ReviewSchema.index({ userId: 1 })
ReviewSchema.index({ rating: 1 })

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema)

export default Review
