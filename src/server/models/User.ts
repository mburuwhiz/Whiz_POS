import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser extends Document {
  businessId: Schema.Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Optional for PIN-only users
  pin: string;
  role: 'Admin' | 'Manager' | 'Cashier' | 'Stock Clerk';
  comparePassword(password: string): Promise<boolean>;
  comparePin(pin: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  pin: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Manager', 'Cashier', 'Stock Clerk'], required: true },
});

// Hash password and PIN before saving
userSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified('pin')) {
    this.pin = await bcrypt.hash(this.pin, 10);
  }
  next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

// Method to compare PIN for login
userSchema.methods.comparePin = async function (pin: string): Promise<boolean> {
  return bcrypt.compare(pin, this.pin);
};


const User = model<IUser>('User', userSchema);

export default User;
