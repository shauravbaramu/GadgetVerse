// routes/user.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../../controllers/admin/UserController');

// Validation rules for creating/updating a user
const userValidationRules = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
];

// List users
router.get('/', (req, res) => userController.index(req, res));

// Create form
router.get('/create', (req, res) => userController.create(req, res));

// Store user (with validations)
router.post('/store', userValidationRules, (req, res) => userController.store(req, res));

// Show user details
router.get('/show/:id', (req, res) => userController.show(req, res));

// Edit form
router.get('/edit/:id', (req, res) => userController.edit(req, res));

// Update user
router.post('/update/:id', userValidationRules, (req, res) => userController.update(req, res));

// Delete user
router.post('/destroy/:id', (req, res) => userController.delete(req, res));

module.exports = router;
