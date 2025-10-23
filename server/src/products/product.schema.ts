import * as mongoose from 'mongoose';

export const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  sku: { type: String, required: true, unique: true },
  businessId: { type: String, required: true },
});
