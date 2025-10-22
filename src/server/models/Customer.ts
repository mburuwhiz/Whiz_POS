import { Schema, model, Document } from 'mongoose';

interface ICustomer extends Document {
  businessId: Schema.Types.ObjectId;
  name: string;
  phone?: string;
  email?: string;
  loyaltyPoints?: number;
}

const customerSchema = new Schema<ICustomer>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  loyaltyPoints: { type: Number, default: 0 },
});

const Customer = model<ICustomer>('Customer', customerSchema);

export default Customer;
