const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Templating Engine
app.use(expressLayouts);
app.set('layout', './layout/main');
app.set('view engine', 'ejs');

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Global variables for views
app.use((req, res, next) => {
  res.locals.businessName = process.env.BUSINESS_NAME || 'WHIZ POS';
  res.locals.currentPath = req.path;
  next();
});

// Routes
app.use('/', require('./routes/web'));
app.use('/api', require('./routes/api'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
