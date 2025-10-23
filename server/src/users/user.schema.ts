import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const UserSchema = new mongoose.Schema({
  businessId: { type: String, required: true },
  name: { type: String, required: true },
  roles: { type: [String], required: true },
  pinHash: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

// Hash the pin before saving the user to the database
UserSchema.pre('save', async function (next) {
  if (!this.isModified('pinHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.pinHash = await bcrypt.hash(this.pinHash, salt);
  next();
});
