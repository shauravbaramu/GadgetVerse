const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

//front routes

const homeRoute = require('./routes/front/home');


// admin routes
const adminRoute = require('./routes/admin/admin');
const usersRoute = require('./routes/admin/users');
const productCategoriesRoute = require('./routes/admin/productCategories');
const productsRoute = require('./routes/admin/products');

app.use(express.json());

// Middleware to parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
mongoose
  .connect(`${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error(err));

  // Set up sessions middleware (configure as needed)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Set up flash middleware
app.use(flash());
// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Register admin routes
app.use('/admin', adminRoute);

// Home route
app.use('/', homeRoute);

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
