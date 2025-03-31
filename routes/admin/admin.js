const express = require('express');
const dashboardController = require('../../controllers/admin/DashboardController');
const profileController = require('../../controllers/admin/ProfileController');
const loginController = require('../../controllers/admin/auth/LoginController');
const { ensureAuthenticated } = require('../../middlewares/auth');
const router = express.Router();

// Render login page
router.get("/login", (req, res) => loginController.showLoginPage(req, res));

// Handle login form submission
router.post("/login", (req, res) => loginController.login(req, res));

// Handle logout
router.get("/logout", (req, res) => loginController.logout(req, res));

// Protected routes (authentication required)
router.use(ensureAuthenticated); // Apply middleware to all routes below this line

// Dashboard route
router.get('/', (req, res) => dashboardController.index(req, res));
// const admin = req.session.user;   to access the data of logged in users

router.get('/view-profile', (req, res) => profileController.viewProfile(req, res));

router.get('/edit-profile/:id', (req, res) => profileController.editProfile(req, res));
router.post('/update-profile', (req, res) => profileController.updateProfile(req, res));

// Render Change Password Page
router.get('/change-password', (req, res) => profileController.changePasswordPage(req, res));

// Handle Change Password Form Submission
router.post('/change-password', (req, res) => profileController.changePassword(req, res));

// Mount Users routes
router.use('/users', require('./users'));

// Mount Product Categories routes
router.use('/productCategories', require('./productCategories'));

// Mount Products routes
router.use('/products', require('./products'));

// Mount Orders routes
router.use('/orders', require('./orders'));

module.exports = router;
