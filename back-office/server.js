require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Key Authentication Middleware
const authenticateApiKey = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const apiKey = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!apiKey) {
        return res.status(401).json({ error: 'Access denied. No API key provided.' });
    }

    // In a real implementation, you would validate this key against a database.
    // For this independent deployment, you might store the allowed key in an ENV variable
    // or a database.

    // Example: Check against environment variable or database
    // if (apiKey !== process.env.ALLOWED_API_KEY) {
    //     return res.status(403).json({ error: 'Invalid API key.' });
    // }

    console.log(`Request received with API Key: ${apiKey}`);
    next();
};

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'WHIZ POS Back Office API is running',
        status: 'active',
        version: '1.0.0'
    });
});

// Protected Route Example for Syncing
app.post('/api/sync', authenticateApiKey, (req, res) => {
    const syncData = req.body;
    console.log('Received sync data:', syncData.length, 'items');

    // Process sync data (save to MongoDB, etc.)

    res.json({ success: true, message: 'Data synced successfully' });
});

app.listen(PORT, () => {
    console.log(`Back Office Server running on port ${PORT}`);
});
