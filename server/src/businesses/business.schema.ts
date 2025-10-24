import * as mongoose from 'mongoose';

export const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: { type: String, required: true },
  apiKeys: [
    {
      key: { type: String, required: true, unique: true },
      status: { type: String, default: 'Inactive' },
      issuedAt: { type: Date, default: Date.now },
    },
  ],
  adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  config: {
    currency: { type: String, default: 'KES' },
    taxRate: { type: Number, default: 16 },
  },
});
