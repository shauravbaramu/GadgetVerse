const express = require('express');
const router = express.Router();
const authController = require('../../controllers/front/auth/AuthController');
const productController = require('../../controllers/front/ProductController');
const HomeController = require('../../controllers/front/HomeController');
const { ensureAuthenticatedUser } = require("../../middlewares/auth");
const { createOrder } = require("../../controllers/front/OrderController");
const userController = require("../../controllers/front/UserController");
const orderController = require('../../controllers/front/OrderController');
const contactController = require('../../controllers/front/ContactController');
const CartController = require("../../controllers/front/CartController");
const forgotPasswordController = require("../../controllers/front/auth/ForgotPasswordController");
const CheckoutController = require("../../controllers/front/CheckoutController");

// home page route
// router.get('/', (req, res) => {
//   res.render('front/index', { user: req.session.user });
// });

router.get('/', HomeController.index);

router.get('/about', (req, res) => {
  res.render('front/about', { user: req.session.user });
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

// Reset Password
router.get("/forgot-password", (req, res) => forgotPasswordController.showForgotPasswordPage(req, res));
router.post("/forgot-password", (req, res) => forgotPasswordController.handleForgotPassword(req, res));
router.get("/reset-password/:token", (req, res) => forgotPasswordController.showResetPasswordPage(req, res));
router.post("/reset-password/:token", (req, res) => forgotPasswordController.handleResetPassword(req, res));

// Route to display all products
router.get('/products', (req, res) => productController.getAllProducts(req, res));
router.get("/search-products", productController.searchProducts);

router.get("/product-details", productController.getProductDetails);

// router.get('/cart', (req, res) => {
//   res.render('front/cart', { user: req.session.user });
// });

// Cart routes
router.get("/cart", ensureAuthenticatedUser, (req, res) => res.render("front/cart", { user: req.user }));
router.get("/cart/items", ensureAuthenticatedUser, CartController.getCart);
router.post("/cart/add", ensureAuthenticatedUser, CartController.addToCart);
router.post("/cart/update-quantity", ensureAuthenticatedUser, CartController.updateQuantity);
router.post("/cart/remove", ensureAuthenticatedUser, CartController.removeFromCart);
router.post("/cart/update-settings", ensureAuthenticatedUser, CartController.updateCartSettings);
router.get("/cart/count", ensureAuthenticatedUser, CartController.getCartCount);

module.exports = router;

// Render Checkout Page
router.get("/checkout", ensureAuthenticatedUser, (req, res) =>
  CheckoutController.showCheckoutPage(req, res)
);

// Place Order Route
router.post("/checkout", ensureAuthenticatedUser, CheckoutController.placeOrder);

// Success Page Route
router.get("/checkout/success", ensureAuthenticatedUser, (req, res) => {
  const { orderId } = req.query;
  res.render("front/checkout-success", { orderId });
});

// Handle Checkout Form Submission
router.post("/checkout", ensureAuthenticatedUser, (req, res) =>
  CheckoutController.handleCheckout(req, res)
);

router.get("/profile", ensureAuthenticatedUser, (req, res) => {
  res.render("front/user/profile", {
    user: req.session.user,
    messages: {
      success: req.flash("success"),
      error: req.flash("error")
    }
  });
});

router.post("/profile/update", ensureAuthenticatedUser, (req, res) => userController.updateProfile(req, res));


// POST route for creating an order
router.post('/order', ensureAuthenticatedUser, orderController.createOrder);

// Route to show the order success page
router.get('/order/success/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Fetch the order details by its ID from the database
    const order = await Order.findById(orderId).populate('items.product');

    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Render the order success page and pass the order details to the view
    res.render('orderSuccess', { order });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.get('/my-orders', ensureAuthenticatedUser, orderController.getOrders);

// View Order Details
router.get('/my-orders/:orderId', ensureAuthenticatedUser, orderController.getOrderDetails);

router.get('/search', productController.searchProducts);

router.get("/contactus", (req, res) => contactController.showContactPage(req, res));
router.post("/contact/store", (req, res) => contactController.store(req, res));


module.exports = router;
