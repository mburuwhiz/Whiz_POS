const Customer = require('../models/Customer');

exports.index = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ name: 1 });
        res.render('pages/credit', {
            title: 'Credit Management',
            customers
        });
    } catch (error) {
        console.error(error);
        res.render('pages/credit', {
            title: 'Credit Management',
            customers: [],
            error: 'Failed to load customers'
        });
    }
};
