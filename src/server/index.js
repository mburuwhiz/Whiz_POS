const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Route imports
const viewRoutes = require('./routes/viewRoutes');
const apiRoutes = require('./routes/apiRoutes');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../../public')));

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use the routers
app.use('/', viewRoutes);
app.use('/', apiRoutes); // Using '/' as the base for API routes as they have specific prefixes

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
