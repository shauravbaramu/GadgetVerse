const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const seedAdmin = require("./seeders/AdminSeeder");
const MongoStore = require('connect-mongo');
const bcrypt = require("bcryptjs");
require('dotenv').config();

const app = express();
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

//front routes

const homeRoute = require('./routes/front/home');


// admin routes
const adminRoute = require('./routes/admin/admin');

app.use(express.json());

// Middleware to parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
// mongoose
//   .connect(`${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   })
//   .then(async () => {
//     console.log("Connected to MongoDB")

//     // Seed the admin user
//     await seedAdmin();
//   })
//   .catch(err => console.error(err));

// Connect to MongoDB Atlas
mongoose
  .connect(`${process.env.DB_CONNECTION}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB Atlas");

    // Seed the admin user
    await seedAdmin();
  })
  .catch(err => console.error("MongoDB connection error:", err));

// Set up sessions middleware (configure as needed)
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({
//     mongoUrl: `${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
//   }),
//   cookie: {
//     maxAge: 1000 * 60 * 60 * 24, // 1 day (default session duration)
//   },
// })
// );
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: `${process.env.DB_CONNECTION}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

// Set up flash middleware
app.use(flash());

// Make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  res.locals.admin = req.session.adminUser || null; // Pass the logged-in admin's data to all views
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // User is accessible in all views
  next();
});


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));


// Register admin routes
app.use('/admin', adminRoute);

// Home route
app.use('/', homeRoute);

// Catch 404 and render the error page
app.use((req, res, next) => {
  res.status(404).render("404");
});

// Global error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something went wrong! Please try again later.");
// });

// Start the server
app.listen(PORT, HOST, () => console.log(`Server running on port ${PORT}`));
