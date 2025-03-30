const express = require('express');
const router = express.Router();

// home page route
router.get('/', (req, res) => {
  res.render('front/index');
});

router.get('/about', (req, res) => {
  res.render('front/about');
});

router.get('/products', (req, res) => {
  res.render('front/products');
});

router.get('/login', (req, res) => {
  res.render('front/login');
});

router.get('/register', (req, res) => {
  res.render('front/register');
});

router.get('/cart', (req, res) => {
  res.render('front/cart');
});

router.get('/product-details', (req, res) => {
  res.render('front/product-details');
});

module.exports = router;
