const mongoose = require('mongoose');

const ProductCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String
});

module.exports = mongoose.model('ProductCategory', ProductCategorySchema);
