const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  customerId: { type: String, unique: true, sparse: true }, // Added to sync with Desktop ID
  name: { type: String, required: true },
  phone: String,
  balance: { type: Number, default: 0 },
  totalCredit: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  history: [{
    date: Date,
    amount: Number,
    type: { type: String, enum: ['credit', 'payment'] },
    transactionId: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
