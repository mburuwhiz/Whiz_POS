const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 },
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
