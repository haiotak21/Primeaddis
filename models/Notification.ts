import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  message: string
  type: "new_listing" | "price_drop" | "approval" | "inquiry" | "system"
  read: boolean
  relatedId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["new_listing", "price_drop", "approval", "inquiry", "system"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
NotificationSchema.index({ userId: 1, read: 1 })
NotificationSchema.index({ createdAt: -1 })

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)

export default Notification
