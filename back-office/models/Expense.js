const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  expenseId: { type: String, unique: true }, // Desktop ID
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: String,
  date: { type: Date, default: Date.now },
  recordedBy: String
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
