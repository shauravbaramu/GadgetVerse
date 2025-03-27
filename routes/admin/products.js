const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');

// List products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.render('admin/products', { activePage: 'products', products });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// New product form
router.get('/new', (req, res) => {
  res.render('admin/newProduct', { activePage: 'products' });
});

// Create a new product
router.post('/new', async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const newProduct = new Product({ name, description, price, category });
    await newProduct.save();
    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
