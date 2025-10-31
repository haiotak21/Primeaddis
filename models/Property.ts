import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IProperty extends Document {
  title: string
  description: string
  price: number
  type: "house" | "apartment" | "land" | "office" | "commercial"
  location: {
    address: string
    city: string
    region: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  specifications: {
    bedrooms?: number
    bathrooms?: number
    area: number
    yearBuilt?: number
  }
  amenities: string[]
  images: string[]
  videoUrl?: string
  vrTourUrl?: string
  listedBy: mongoose.Types.ObjectId
  realEstate: mongoose.Types.ObjectId // NEW: reference to RealEstate
  financing?: string[]
  listingType: "sale" | "rent"
  status: "active" | "sold" | "rented" | "pending" | "draft"
  featured: boolean
  featuredUntil?: Date
  views: number
  createdAt: Date
  updatedAt: Date
}

const propertySchemaDefinition: any = {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    type: {
      type: String,
      enum: ["house", "apartment", "land", "office", "commercial"],
      required: [true, "Property type is required"],
    },
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      region: {
        type: String,
        required: [true, "Region is required"],
      },
      coordinates: {
        lat: {
          type: Number,
          required: true,
        },
        lng: {
          type: Number,
          required: true,
        },
      },
    },
    specifications: {
      bedrooms: Number,
      bathrooms: Number,
      area: {
        type: Number,
        required: [true, "Area is required"],
      },
      yearBuilt: Number,
    },
    amenities: [String],
    images: {
      type: [String],
      validate: [
        {
          validator: (v: string[]) => Array.isArray(v) && v.length > 0,
          message: "At least one image is required",
        },
        {
          validator: (v: string[]) => !Array.isArray(v) || v.length <= 10,
          message: "A maximum of 10 images is allowed",
        },
      ],
    },
    videoUrl: String,
    vrTourUrl: String,
    listedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    realEstate: {
      type: Schema.Types.ObjectId,
      ref: "RealEstate",
      required: true,
    },
    financing: { type: [String], default: [] },
    listingType: {
      type: String,
      enum: ["sale", "rent"],
      required: [true, "Listing type is required"],
    },
    status: {
      type: String,
      enum: ["active", "sold", "rented", "pending", "draft"],
      default: "draft",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: Date,
    views: {
      type: Number,
      default: 0,
    },
}

const PropertySchema = new Schema<IProperty>(propertySchemaDefinition, {
  timestamps: true,
})

// Indexes for performance
PropertySchema.index({ listedBy: 1 })
PropertySchema.index({ realEstate: 1 })
PropertySchema.index({ type: 1, status: 1 })
PropertySchema.index({ "location.city": 1, type: 1 })
PropertySchema.index({ price: 1, type: 1 })
PropertySchema.index({ "location.coordinates": "2dsphere" })
PropertySchema.index({ createdAt: -1 })

const Property: Model<IProperty> = mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema)

export default Property
