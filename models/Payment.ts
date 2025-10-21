import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId
  type: "subscription" | "featured_listing"
  planType?: "pro" | "enterprise"
  amount: number
  currency: string
  stripePaymentId: string
  status: "pending" | "completed" | "failed" | "refunded"
  propertyId?: mongoose.Types.ObjectId
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["subscription", "featured_listing"],
      required: true,
    },
    planType: {
      type: String,
      enum: ["pro", "enterprise"],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "usd",
    },
    stripePaymentId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
    },
    expiresAt: Date,
  },
  {
    timestamps: true,
  },
)

// Indexes
PaymentSchema.index({ userId: 1 })
PaymentSchema.index({ stripePaymentId: 1 })
PaymentSchema.index({ expiresAt: 1 })

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema)

export default Payment
