import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  role: "user" | "agent" | "admin" | "superadmin"
  profileImage?: string
  phone?: string
  favorites: mongoose.Types.ObjectId[]
  subscription?: {
    planType: "free" | "pro" | "enterprise"
    status: "active" | "inactive" | "cancelled"
    expiresAt?: Date
  }
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "agent", "admin", "superadmin"],
      default: "user",
    },
    profileImage: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    subscription: {
      planType: {
        type: String,
        enum: ["free", "pro", "enterprise"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "cancelled"],
        default: "active",
      },
      expiresAt: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Whether the user has opted in to marketing / broadcast emails
    marketingOptIn: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
UserSchema.index({ role: 1 })
UserSchema.index({ createdAt: -1 })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
