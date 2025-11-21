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
const DEFAULT_PORT = process.env.PORT || 5000;

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

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    if (port !== parseInt(DEFAULT_PORT)) {
      console.warn(`\nWARNING: Port ${DEFAULT_PORT} was in use. Running on fallback port ${port}.`);
      console.warn(`Please update your Desktop App .env file to use VITE_BACK_OFFICE_URL=http://localhost:${port} if needed.\n`);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(parseInt(DEFAULT_PORT));
