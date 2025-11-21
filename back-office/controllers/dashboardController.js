const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

exports.index = async (req, res) => {
    try {
        // 1. Total Sales (Sum of all transactions)
        const totalSalesResult = await Transaction.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;

        // 2. Transactions Count
        const transactionCount = await Transaction.countDocuments();

        // 3. Inventory Value (Sum of price * stock)
        const inventoryValueResult = await Product.aggregate([
            { $group: { _id: null, total: { $sum: { $multiply: ["$price", "$stock"] } } } }
        ]);
        const inventoryValue = inventoryValueResult.length > 0 ? inventoryValueResult[0].total : 0;

        // 4. Credit Due (Sum of balance for customers)
        const creditDueResult = await Customer.aggregate([
            { $group: { _id: null, total: { $sum: "$balance" } } }
        ]);
        const creditDue = creditDueResult.length > 0 ? creditDueResult[0].total : 0;

        // 5. Recent Transactions
        const recentTransactions = await Transaction.find().sort({ date: -1 }).limit(5);

        res.render('pages/dashboard', {
            title: 'Dashboard',
            stats: {
                totalSales,
                transactionCount,
                inventoryValue,
                creditDue
            },
            recentTransactions
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.render('pages/dashboard', {
            title: 'Dashboard',
            stats: { totalSales: 0, transactionCount: 0, inventoryValue: 0, creditDue: 0 },
            recentTransactions: [],
            error: 'Failed to load dashboard data'
        });
    }
};
