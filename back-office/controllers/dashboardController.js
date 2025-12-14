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

        // 6. Sales Data for Chart
        const period = req.query.period || 'week'; // today, week, month, year
        let startDate = new Date();
        let endDate = new Date();
        let dateFormat = "%Y-%m-%d";
        let groupBy = "$date"; // default
        let labels = [];
        let data = [];

        if (period === 'today') {
            startDate.setHours(0, 0, 0, 0);
            dateFormat = "%H:00"; // Hourly

            // Hourly aggregation
            const hourlySales = await Transaction.aggregate([
                { $match: { date: { $gte: startDate, $lte: endDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%H", date: "$date" } },
                        total: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Fill 0-23 hours
            for (let i = 0; i < 24; i++) {
                const hourStr = i.toString().padStart(2, '0');
                labels.push(`${hourStr}:00`);
                const sale = hourlySales.find(s => s._id === hourStr);
                data.push(sale ? sale.total : 0);
            }

        } else if (period === 'month') {
            startDate.setDate(startDate.getDate() - 30);
            startDate.setHours(0,0,0,0);

            const dailySales = await Transaction.aggregate([
                { $match: { date: { $gte: startDate, $lte: endDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        total: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                const sale = dailySales.find(s => s._id === dateStr);
                data.push(sale ? sale.total : 0);
            }

        } else if (period === 'year') {
            startDate = new Date(new Date().getFullYear(), 0, 1); // Jan 1st

            const monthlySales = await Transaction.aggregate([
                { $match: { date: { $gte: startDate, $lte: endDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%m", date: "$date" } },
                        total: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            for (let i = 1; i <= 12; i++) {
                const monthStr = i.toString().padStart(2, '0');
                labels.push(monthNames[i-1]);
                const sale = monthlySales.find(s => s._id === monthStr);
                data.push(sale ? sale.total : 0);
            }

        } else {
            // Default: Week (Last 7 days)
            startDate.setDate(startDate.getDate() - 6);
            startDate.setHours(0,0,0,0);

            const dailySales = await Transaction.aggregate([
                { $match: { date: { $gte: startDate, $lte: endDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        total: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
                const sale = dailySales.find(s => s._id === dateStr);
                data.push(sale ? sale.total : 0);
            }
        }

        res.render('pages/dashboard', {
            title: 'Dashboard',
            stats: {
                totalSales,
                transactionCount,
                inventoryValue,
                creditDue
            },
            recentTransactions,
            chartData: JSON.stringify({ labels, data }),
            currentPeriod: period
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.render('pages/dashboard', {
            title: 'Dashboard',
            stats: { totalSales: 0, transactionCount: 0, inventoryValue: 0, creditDue: 0 },
            recentTransactions: [],
            chartData: '{"labels":[], "data":[]}',
            currentPeriod: 'week',
            error: 'Failed to load dashboard data'
        });
    }
};
