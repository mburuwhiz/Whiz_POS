const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Middleware to check API Key
const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    // Allow if match OR if it's a development environment (optional, but good for testing)
    if ((apiKey && apiKey === process.env.API_KEY) || process.env.NODE_ENV === 'development') {
        next();
    } else {
        console.log('Unauthorized API access attempt. Key:', apiKey);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

router.use(checkApiKey);

// Sync endpoints
router.post('/sync', apiController.sync);
router.post('/sync/full', apiController.fullSync);
router.get('/sync', apiController.getData);

// Mobile/Direct endpoints
router.get('/products', apiController.getProducts);
router.post('/transaction', apiController.createTransaction);

module.exports = router;
