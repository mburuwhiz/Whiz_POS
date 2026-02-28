const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    unique: true
  },
  productId: String,
  productName: String,
  oldStock: Number,
  newStock: Number,
  variance: Number,
  cashierName: String,
  timestamp: Date,
  reason: String
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
