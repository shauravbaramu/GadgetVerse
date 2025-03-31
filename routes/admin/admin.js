const express = require('express');
const dashboardController = require('../../controllers/admin/DashboardController');
const profileController = require('../../controllers/admin/ProfileController');
const loginController = require('../../controllers/admin/auth/LoginController');
const forgetPasswordController = require("../../controllers/admin/auth/ForgetPasswordController");
const { ensureAuthenticated } = require('../../middlewares/auth');
const router = express.Router();

// Render login page
router.get("/login", (req, res) => loginController.showLoginPage(req, res));

// Handle login form submission
router.post("/login", (req, res) => loginController.login(req, res));

// Handle logout
router.get("/logout", (req, res) => loginController.logout(req, res));

// Forgot Password Routes
router.get("/forgot-password", (req, res) => forgetPasswordController.showForgotPasswordPage(req, res));
router.post("/forgot-password", (req, res) => forgetPasswordController.handleForgotPassword(req, res));
router.get("/reset-password/:token", (req, res) => forgetPasswordController.showResetPasswordPage(req, res));
router.post("/reset-password/:token", (req, res) => forgetPasswordController.handleResetPassword(req, res));

// Protected routes (authentication required)
router.use(ensureAuthenticated); // Apply middleware to all routes below this line

// Dashboard route
router.get('/', (req, res) => dashboardController.index(req, res));
// const admin = req.session.user;   to access the data of logged in users

router.get('/view-profile', ensureAuthenticated, (req, res) => profileController.viewProfile(req, res));

router.get('/edit-profile/:id', ensureAuthenticated, (req, res) => profileController.editProfile(req, res));
router.post('/update-profile', ensureAuthenticated, (req, res) => profileController.updateProfile(req, res));

// Render Change Password Page
router.get('/change-password', ensureAuthenticated, (req, res) => profileController.changePasswordPage(req, res));

// Handle Change Password Form Submission
router.post('/change-password', ensureAuthenticated, (req, res) => profileController.changePassword(req, res));

// Mount Users routes
router.use('/users', require('./users'));

// Mount Product Categories routes
router.use('/productCategories', require('./productCategories'));

// Mount Products routes
router.use('/products', require('./products'));

// Mount Orders routes
router.use('/orders', require('./orders'));

module.exports = router;
