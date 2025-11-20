const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Middleware to check API Key
const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    // Allow if match OR if it's a development environment (optional, but good for testing)
    if ((apiKey && apiKey === process.env.API_KEY) || process.env.NODE_ENV === 'development') {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

router.use(checkApiKey);

// Sync endpoint - Receives data from Desktop App / Mobile App
router.post('/sync', apiController.sync);

// Endpoints for Mobile App / Direct access
router.get('/products', apiController.getProducts);
router.post('/transaction', apiController.createTransaction);

module.exports = router;
