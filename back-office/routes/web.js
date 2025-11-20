const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('pages/dashboard', { title: 'Dashboard' });
});

router.get('/sales', (req, res) => {
    res.render('pages/sales', { title: 'Sales' });
});

router.get('/inventory', (req, res) => {
    res.render('pages/inventory', { title: 'Inventory' });
});

router.get('/expenses', (req, res) => {
    res.render('pages/expenses', { title: 'Expenses' });
});

router.get('/credit', (req, res) => {
    res.render('pages/credit', { title: 'Credit Management' });
});

router.get('/reports', (req, res) => {
    res.render('pages/reports', { title: 'Reports' });
});

router.get('/users', (req, res) => {
    res.render('pages/users', { title: 'User Management' });
});

router.get('/settings', (req, res) => {
    res.render('pages/settings', { title: 'Settings' });
});

module.exports = router;
