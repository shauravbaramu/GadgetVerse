// models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
    stock: { type: Number, default: 0 },
    sku: { type: String, trim: true },
    image: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
