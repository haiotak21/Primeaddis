import mongoose, { Schema, models, model } from "mongoose";

export interface IBlogPost {
  _id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string; // markdown
  coverImage?: string;
  tags?: string[];
  published: boolean;
  publishedAt?: Date;
  authorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String },
    content: { type: String, required: true },
    coverImage: { type: String },
    tags: [{ type: String }],
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    authorId: { type: String },
  },
  { timestamps: true }
);

export default models.BlogPost || model<IBlogPost>("BlogPost", BlogPostSchema);
