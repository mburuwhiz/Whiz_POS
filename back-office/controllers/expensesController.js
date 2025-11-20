const Expense = require('../models/Expense');

exports.index = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.render('pages/expenses', {
            title: 'Expenses',
            expenses
        });
    } catch (error) {
        console.error(error);
        res.render('pages/expenses', {
            title: 'Expenses',
            expenses: [],
            error: 'Failed to load expenses'
        });
    }
};

exports.addExpense = async (req, res) => {
    try {
        const newExpense = new Expense(req.body);
        await newExpense.save();
        res.redirect('/expenses');
    } catch (error) {
        res.status(500).send('Error adding expense');
    }
};
