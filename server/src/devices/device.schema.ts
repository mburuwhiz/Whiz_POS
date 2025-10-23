import * as mongoose from 'mongoose';

export const DeviceSchema = new mongoose.Schema({
  businessId: { type: String, required: true },
  fingerprint: { type: String, required: true, unique: true },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});
