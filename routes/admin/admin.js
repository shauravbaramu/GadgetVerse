const express = require('express');
const router = express.Router();

// Dashboard route
router.get('/', (req, res) => {
  res.render('admin/dashboard', { activePage: 'dashboard' });
});

// Mount Users routes
router.use('/users', require('./users'));

// Mount Product Categories routes
router.use('/product-categories', require('./productCategories'));

// Mount Products routes
router.use('/products', require('./products'));

module.exports = router;
