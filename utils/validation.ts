import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  phone: z.string().optional(),
})

export const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().positive("Price must be positive"),
  type: z.enum(["house", "apartment", "land", "office", "commercial"]),
  location: z.object({
    address: z.string().min(2, "Address is required"),
    city: z.string().min(2, "City is required"),
    region: z.string().min(2, "Region is required"),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }),
  specifications: z.object({
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    area: z.number().positive("Area must be positive"),
    yearBuilt: z.number().optional(),
  }),
  amenities: z.array(z.string()),
  images: z.array(z.string()).min(1, "At least one image is required"),
  videoUrl: z.string().url().optional().or(z.literal("")),
  vrTourUrl: z.string().url().optional().or(z.literal("")),
  listingType: z.enum(["sale", "rent"]),
  realEstate: z.string().min(1, "Real estate is required"),
})

export const reviewSchema = z.object({
  propertyId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
})
