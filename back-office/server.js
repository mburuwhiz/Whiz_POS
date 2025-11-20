require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// const indexRoutes = require('./routes/index');
// app.use('/', indexRoutes);

app.get('/', (req, res) => {
    // In a real app, this would come from a database
    const businessName = "WHIZ POS";
    res.render('dashboard', {
        businessName: businessName,
        pageName: 'Dashboard'
    });
});

// Load API key from environment variables
const API_KEY = process.env.API_KEY;

// Middleware for API Key Authentication
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.get('X-API-KEY');
    if (!apiKey || apiKey !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Group API routes and apply the middleware
const apiRoutes = express.Router();
apiRoutes.use(apiKeyAuth);

// API Health Check
apiRoutes.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Back-office is running' });
});

app.use('/api', apiRoutes);


app.listen(port, () => {
    console.log(`Back-office server listening at http://localhost:${port}`);
});
