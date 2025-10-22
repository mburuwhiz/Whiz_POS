import { Schema, model, Document } from 'mongoose';

interface IBusiness extends Document {
  name: string;
  apiKey: string;
  subscriptionPlan: 'Free' | 'Standard' | 'Pro';
  createdAt: Date;
}

const businessSchema = new Schema<IBusiness>({
  name: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true },
  subscriptionPlan: { type: String, enum: ['Free', 'Standard', 'Pro'], default: 'Free' },
  createdAt: { type: Date, default: Date.now },
});

const Business = model<IBusiness>('Business', businessSchema);

export default Business;
