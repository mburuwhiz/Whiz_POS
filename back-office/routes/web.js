const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const salesController = require('../controllers/salesController');
const inventoryController = require('../controllers/inventoryController');
const expensesController = require('../controllers/expensesController');
const creditController = require('../controllers/creditController');
const reportsController = require('../controllers/reportsController');
const usersController = require('../controllers/usersController');
const settingsController = require('../controllers/settingsController');

// Auth Middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.redirect('/login');
};

// Public Routes
router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Protected Routes
router.use(requireAuth);

router.get('/', dashboardController.index);

router.get('/sales', salesController.index);

router.get('/inventory', inventoryController.index);
router.post('/inventory/add', inventoryController.addProduct);
router.post('/inventory/edit/:id', inventoryController.updateProduct);
router.post('/inventory/delete/:id', inventoryController.deleteProduct);

router.get('/expenses', expensesController.index);
router.post('/expenses/add', expensesController.addExpense);
router.post('/expenses/delete/:id', expensesController.deleteExpense);

router.get('/credit', creditController.index);
router.post('/credit/add', creditController.addCustomer);
router.post('/credit/payment/:id', creditController.recordPayment);
router.post('/credit/delete/:id', creditController.deleteCustomer);

router.get('/reports', reportsController.index);

router.get('/users', usersController.index);
router.post('/users/add', usersController.addUser);
router.post('/users/edit/:id', usersController.updateUser);
router.post('/users/delete/:id', usersController.deleteUser);

router.get('/settings', settingsController.index);

module.exports = router;
