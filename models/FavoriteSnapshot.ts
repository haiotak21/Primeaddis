import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IFavoriteSnapshot extends Document {
  date: Date; // normalized to YYYY-MM-DD UTC
  total: number;
  perProperty: Record<string, number>;
  createdAt: Date;
}

const FavoriteSnapshotSchema = new Schema<IFavoriteSnapshot>(
  {
    date: { type: Date, required: true }, // unique handled by index below
    total: { type: Number, required: true },
    perProperty: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Single source of truth for unique index; remove inline unique:true to avoid duplicate warning
FavoriteSnapshotSchema.index({ date: 1 }, { unique: true });

const FavoriteSnapshot: Model<IFavoriteSnapshot> =
  mongoose.models.FavoriteSnapshot || mongoose.model<IFavoriteSnapshot>("FavoriteSnapshot", FavoriteSnapshotSchema);

export default FavoriteSnapshot;
