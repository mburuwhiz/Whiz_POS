const LoyaltyCustomer = require('../models/LoyaltyCustomer');

exports.index = async (req, res) => {
    try {
        const customers = await LoyaltyCustomer.find().sort({ points: -1 });
        res.render('pages/loyalty', {
            title: 'Loyalty Program',
            customers
        });
    } catch (error) {
        console.error(error);
        res.render('pages/loyalty', {
            title: 'Loyalty Program',
            customers: [],
            error: 'Failed to load loyalty data'
        });
    }
};
