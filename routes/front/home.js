const express = require('express');
const router = express.Router();

// home page route
router.get('/', (req, res) => {
  res.render('/');
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/products', (req, res) => {
  res.render('products');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/cart', (req, res) => {
  res.render('cart');
});

router.get('/product-details', (req, res) => {
  res.render('product-details');
});

module.exports = router;
