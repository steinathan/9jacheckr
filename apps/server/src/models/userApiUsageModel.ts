import mongoose, { Schema } from 'mongoose';

const userApiUsageSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    totalVerifications: { type: Number, default: 0 },
    foundCount: { type: Number, default: 0 },
    notFoundCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    lastVerifyAt: { type: Date, default: null },
    searchCount: { type: Number, default: 0 },
    lastSearchAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const UserApiUsageModel =
  mongoose.models.UserApiUsage ??
  mongoose.model('UserApiUsage', userApiUsageSchema);
