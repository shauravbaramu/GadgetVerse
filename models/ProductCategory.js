// models/ProductCategory.js
const mongoose = require('mongoose');

const ProductCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductCategory', ProductCategorySchema);
