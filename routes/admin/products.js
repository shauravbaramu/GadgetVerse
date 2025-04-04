const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require("fs");
const ProductController = require('../../controllers/admin/ProductController');

// Configure multer for product image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/products/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
// const upload = multer({ storage: storage });

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
});

// List products
router.get('/', (req, res) => ProductController.index(req, res));

// Show create form
router.get('/create', (req, res) => ProductController.create(req, res));

// Store product
// router.post('/store', upload.single('image'), (req, res) => ProductController.store(req, res));
router.post('/store', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), (req, res) => ProductController.store(req, res));

// Show product details
router.get('/show/:id', (req, res) => ProductController.show(req, res));

// Show edit form
router.get('/edit/:id', (req, res) => ProductController.edit(req, res));

// Update product
router.post('/update/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), (req, res) => ProductController.update(req, res));

// Delete product
router.post('/destroy/:id', (req, res) => ProductController.delete(req, res));

module.exports = router;
