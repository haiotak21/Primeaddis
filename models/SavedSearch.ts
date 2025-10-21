import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISavedSearch extends Document {
  user: Types.ObjectId;
  name: string;
  criteria: Record<string, any>;
  createdAt: Date;
  alertEnabled: boolean;
  alertFrequency?: 'instant' | 'daily' | 'weekly';
}

const SavedSearchSchema = new Schema<ISavedSearch>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  criteria: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  alertEnabled: { type: Boolean, default: false },
  alertFrequency: { type: String, enum: ['instant', 'daily', 'weekly'], default: 'instant' },
});

export default mongoose.models.SavedSearch || mongoose.model<ISavedSearch>('SavedSearch', SavedSearchSchema);
