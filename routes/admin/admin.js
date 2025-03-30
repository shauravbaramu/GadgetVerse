const express = require('express');
const dashboardController = require('../../controllers/admin/DashboardController');
const router = express.Router();

// Dashboard route
router.get('/', (req, res) => dashboardController.index(req, res));

// Mount Users routes
router.use('/users', require('./users'));

// Mount Product Categories routes
router.use('/productCategories', require('./productCategories'));

// Mount Products routes
router.use('/products', require('./products'));

module.exports = router;
