const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const adminRoute = require('./routes/admin/admin');
const usersRoute = require('./routes/admin/users');
const productCategoriesRoute = require('./routes/admin/productCategories');
const productsRoute = require('./routes/admin/products');

// Connect to MongoDB
mongoose
  .connect(`${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Register admin routes
app.use('/admin', adminRoute);

// Home route
app.get('/', (req, res) => {
  res.send("Welcome to GadgetVerse!");
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
