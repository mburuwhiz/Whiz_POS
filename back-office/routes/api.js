const express = require('express');
const router = express.Router();

// Middleware to check API Key
const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === process.env.API_KEY) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

router.use(checkApiKey);

// Sync endpoint - Receives data from Desktop App
router.post('/sync', async (req, res) => {
    try {
        const { transactions, products, expenses, customers, settings } = req.body;

        // Process sync data here (update MongoDB)
        // Ideally, use bulkWrite for efficiency

        console.log('Received sync data:', {
            transactionsCount: transactions?.length,
            productsCount: products?.length
        });

        res.json({ success: true, message: 'Sync successful' });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ success: false, message: 'Sync failed' });
    }
});

// Endpoints for Mobile App
router.get('/products', (req, res) => {
    // Return products from DB
    res.json({ products: [] });
});

router.post('/transaction', (req, res) => {
    // Receive transaction from Mobile App
    res.json({ success: true });
});

module.exports = router;
