const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  cashier: String,
  items: [{
    productId: String,
    name: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  paymentMethod: String,
  customerName: String // Optional
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
