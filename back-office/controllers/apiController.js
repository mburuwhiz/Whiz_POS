const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const User = require('../models/User');

exports.getData = async (req, res) => {
    try {
        const products = await Product.find({});
        const users = await User.find({});
        const expenses = await Expense.find({});
        const creditCustomers = await Customer.find({});
        // BusinessSetup? Usually local specific but maybe sync global settings.
        // For now return main entities.

        // Map Mongoose docs to Desktop interface if needed, or just return as is
        // Desktop expects: { products: [], users: [], expenses: [], creditCustomers: [] }

        // Need to map _id or productId to id for Desktop?
        // Desktop sync logic: `serverDataById.get(localItem.id)`
        // If Desktop uses `productId` (number) and Server uses `productId`, we are good.
        // If Desktop uses `id` (string) for others, we need to ensure consistency.

        const mapProduct = p => ({
            ...p.toObject(),
            id: p.productId || p._id, // Fallback
            // map other fields if names differ
        });

        res.json({
            products: products.map(mapProduct),
            users: users, // User sync might be tricky with passwords.
            expenses: expenses,
            creditCustomers: creditCustomers
        });
    } catch (error) {
        console.error('Get Data Error:', error);
        res.status(500).json({ error: 'Failed to get data' });
    }
};

exports.sync = async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            for (const op of req.body) {
                await processOperation(op);
            }
            res.json({ success: true });
            return;
        }
        res.json({ success: true }); // fallback
    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ success: false, message: 'Sync failed', error: error.message });
    }
};

exports.fullSync = async (req, res) => {
    try {
        const { products, users, expenses, customers, transactions } = req.body;

        if (products) {
            for (const p of products) {
                await processOperation({ type: 'add-product', data: p });
            }
        }
        if (users) {
            for (const u of users) {
                await processOperation({ type: 'add-user', data: u });
            }
        }
        if (expenses) {
            for (const e of expenses) {
                await processOperation({ type: 'add-expense', data: e });
            }
        }
        if (customers) {
            for (const c of customers) {
                await processOperation({ type: 'add-credit-customer', data: c });
            }
        }
        if (transactions) {
            for (const t of transactions) {
                await processOperation({ type: 'new-transaction', data: t });
            }
        }

        res.json({ success: true, message: 'Full sync complete' });
    } catch (error) {
        console.error('Full Sync Error:', error);
        res.status(500).json({ success: false, message: 'Full sync failed', error: error.message });
    }
};

async function processOperation(op) {
    try {
        switch (op.type) {
            case 'new-transaction':
                await Transaction.updateOne(
                    { transactionId: op.data.id },
                    {
                        $set: {
                            transactionId: op.data.id,
                            date: op.data.timestamp,
                            cashier: op.data.cashier,
                            items: op.data.items.map(i => ({
                                productId: i.product.id,
                                name: i.product.name,
                                quantity: i.quantity,
                                price: i.product.price
                            })),
                            totalAmount: op.data.total,
                            paymentMethod: op.data.paymentMethod,
                            customerName: op.data.creditCustomer
                        }
                    },
                    { upsert: true }
                );
                break;

            case 'add-product':
            case 'update-product':
                const prodData = op.type === 'update-product' ? op.data.updates : op.data;
                const prodId = op.type === 'update-product' ? op.data.id : op.data.id;
                const prodUpdate = { ...prodData };
                if (prodId) prodUpdate.productId = prodId;
                delete prodUpdate.id;

                // Use productId to find
                await Product.updateOne(
                    { productId: prodId },
                    { $set: prodUpdate },
                    { upsert: true }
                );
                break;

            case 'delete-product':
                await Product.deleteOne({ productId: op.data.id });
                break;

            case 'add-expense':
                // data: Expense object
                await Expense.updateOne(
                    { expenseId: op.data.id },
                    { $set: { ...op.data, expenseId: op.data.id } },
                    { upsert: true }
                );
                break;

            case 'add-user':
            case 'update-user':
                const userData = op.type === 'update-user' ? op.data.updates : op.data;
                const userQuery = userData.username ? { username: userData.username } : { _id: userData.id }; // Fallback

                // Use username as unique identifier for sync if available
                // Ensure pin is saved
                await User.updateOne(
                    userQuery,
                    { $set: userData },
                    { upsert: true }
                );
                break;

            case 'add-credit-customer':
            case 'update-credit-customer':
                // data: Customer object or {id, updates}
                // Desktop uses `id` (string like CUST...)
                const custId = op.type === 'update-credit-customer' ? op.data.id : op.data.id;
                const custData = op.type === 'update-credit-customer' ? op.data.updates : op.data;

                // Use customerId for reliable sync
                const updateData = { ...custData };
                if (custId) updateData.customerId = custId;
                // Ensure we don't overwrite the mongo _id with the desktop string id
                delete updateData.id;
                delete updateData._id;

                await Customer.updateOne(
                    { customerId: custId },
                    { $set: updateData },
                    { upsert: true }
                );
                break;
        }
    } catch (e) {
        console.error(`Failed to process op ${op.type}:`, e);
    }
}

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

exports.createTransaction = async (req, res) => {
    try {
        // Simplified for now
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create transaction' });
    }
};
