const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String }, // For web login
  pin: { type: String }, // For POS login
  role: { type: String, enum: ['admin', 'cashier', 'manager'], default: 'cashier' },
  name: String,
  email: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
