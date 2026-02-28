const mongoose = require('mongoose');

const LoyaltyCustomerSchema = new mongoose.Schema({
  customerId: { type: String, unique: true },
  name: String,
  phone: String,
  email: String,
  points: { type: Number, default: 0 },
  tier: { type: String, default: 'Bronze' },
  totalSpent: { type: Number, default: 0 },
  visitsCount: { type: Number, default: 0 },
  lastVisit: Date,
  rewards: [String] // Array of reward names redeemed
}, { timestamps: true });

module.exports = mongoose.model('LoyaltyCustomer', LoyaltyCustomerSchema);
