const Product = require('../models/Product');

exports.index = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.render('pages/inventory', {
            title: 'Inventory',
            products
        });
    } catch (error) {
        console.error(error);
        res.render('pages/inventory', {
            title: 'Inventory',
            products: [],
            error: 'Failed to load inventory'
        });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.redirect('/inventory');
    } catch (error) {
        res.status(500).send('Error adding product');
    }
};
