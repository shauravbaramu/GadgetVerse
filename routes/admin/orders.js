// routes/order.js
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/OrderController');

// List orders
router.get('/', (req, res) => orderController.index(req, res));

// Create form
router.get('/create', (req, res) => orderController.create(req, res));

// Store order (with validations)
router.post('/store', (req, res) => orderController.store(req, res));

// Show order details
router.get('/show/:id', (req, res) => orderController.show(req, res));

// Edit form
router.get('/edit/:id', (req, res) => orderController.edit(req, res));

// Update order
router.post('/update/:id', (req, res) => orderController.update(req, res));

// Delete order
router.post('/destroy/:id', (req, res) => orderController.delete(req, res));

module.exports = router;
