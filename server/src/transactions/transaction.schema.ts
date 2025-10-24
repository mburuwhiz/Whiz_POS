import * as mongoose from 'mongoose';

export const TransactionSchema = new mongoose.Schema({
  businessId: { type: String, required: true },
  deviceId: { type: String, required: true },
  items: [
    {
      sku: { type: String, required: true },
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  payments: [
    {
      method: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  status: { type: String, required: true, default: 'COMPLETED' },
  isPaid: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});
