import { Schema, model, Document } from 'mongoose';

interface ISale extends Document {
  businessId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  products: {
    productId: Schema.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  createdAt: Date;
}

const saleSchema = new Schema<ISale>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // Price at the time of sale
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Sale = model<ISale>('Sale', saleSchema);

export default Sale;
