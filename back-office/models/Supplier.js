const mongoose = require('mongoose');

/**
 * Schema for Supplier model.
 */
const SupplierSchema = new mongoose.Schema({
  /**
   * Unique identifier synced from Desktop POS.
   */
  supplierId: { type: String, unique: true },

  /**
   * Name of the supplier.
   */
  name: { type: String, required: true },

  /**
   * Contact phone number.
   */
  contact: String,

  /**
   * Physical location/address.
   */
  location: String,

  /**
   * Is the supplier active?
   */
  active: { type: Boolean, default: true },

  /**
   * Notes or ratings for the supplier.
   */
  notes: String,

  /**
   * Creation timestamp.
   */
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
