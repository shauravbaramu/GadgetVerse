const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

// const studentRoutes = require('./routes/student');
// const courseRoutes = require('./routes/course');

const app = express();

const PORT = process.env.PORT || 3000;

// Connect to MongoDB (adjust the URL as needed)
mongoose
  .connect(`${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error(err));


// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Register routes for students and courses
// app.use('/students', studentRoutes);
// app.use('/courses', courseRoutes);

// Home route redirecting to students page
app.get('/', (req, res) => {
//   res.redirect('/students');
res.send("Welcome to GadgetVerse!");
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
