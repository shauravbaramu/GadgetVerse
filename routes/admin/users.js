const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// List users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.render('admin/users', { activePage: 'users', users });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// New user form
router.get('/new', (req, res) => {
  res.render('admin/newUser', { activePage: 'users' });
});

// Create a new user
router.post('/new', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const newUser = new User({ name, email, role });
    await newUser.save();
    res.redirect('/admin/users');
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
