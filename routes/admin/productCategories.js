const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const productCategoryController = require('../../controllers/admin/ProductCategoryController');

// Configure multer (adjust destination and filename as needed)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/productCategory/';
    // Check if directory exists, if not, create it
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename, e.g., using the current timestamp
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// List product categories
router.get('/', (req, res) => productCategoryController.index(req, res));

// Create form
router.get('/create', (req, res) => productCategoryController.create(req, res));

// Store product category (with validations)
router.post('/store', upload.single('image'), (req, res) => productCategoryController.store(req, res));

// Show product category details
router.get('/show/:id', (req, res) => productCategoryController.show(req, res));

// Edit form
router.get('/edit/:id', (req, res) => productCategoryController.edit(req, res));

// Update product category
router.post('/update/:id', upload.single('image'), (req, res) => productCategoryController.update(req, res));

// Delete product category
router.post('/destroy/:id', (req, res) => productCategoryController.delete(req, res));

module.exports = router;
