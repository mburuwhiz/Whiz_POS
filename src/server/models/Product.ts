import { Schema, model, Document } from 'mongoose';

interface IProduct extends Document {
  businessId: Schema.Types.ObjectId;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const productSchema = new Schema<IProduct>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
});

const Product = model<IProduct>('Product', productSchema);

export default Product;
