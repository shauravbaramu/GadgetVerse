const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: { type: String }
},
{ timestamps: true }
);

module.exports = mongoose.model('ProductCategory', productCategorySchema);