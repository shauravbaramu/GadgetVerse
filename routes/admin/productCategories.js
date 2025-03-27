const express = require('express');
const router = express.Router();
const ProductCategory = require('../../models/ProductCategory');

// List categories
router.get('/', async (req, res) => {
  try {
    const categories = await ProductCategory.find();
    res.render('admin/productCategories', { activePage: 'categories', categories });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// New category form
router.get('/new', (req, res) => {
  res.render('admin/newCategory', { activePage: 'categories' });
});

// Create a new category
router.post('/new', async (req, res) => {
  try {
    const { name, description } = req.body;
    const newCategory = new ProductCategory({ name, description });
    await newCategory.save();
    res.redirect('/admin/product-categories');
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
