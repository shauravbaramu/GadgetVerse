const express = require('express');
const router = express.Router();
const authController = require('../../controllers/front/auth/AuthController');

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

// Render register page
router.get("/register", (req, res) => authController.showRegisterPage(req, res));

// Handle register form submission
router.post("/register", (req, res) => authController.register(req, res));

// Render login page
router.get("/login", (req, res) => authController.showLoginPage(req, res));

// Handle login form submission
router.post("/login", (req, res) => authController.login(req, res));

// Handle logout
router.get("/logout", (req, res) => authController.logout(req, res));

router.get('/cart', (req, res) => {
  res.render('front/cart');
});

router.get('/product-details', (req, res) => {
  res.render('front/product-details');
});

module.exports = router;
