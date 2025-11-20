const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const salesController = require('../controllers/salesController');
const inventoryController = require('../controllers/inventoryController');
const expensesController = require('../controllers/expensesController');
const creditController = require('../controllers/creditController');
const reportsController = require('../controllers/reportsController');
const usersController = require('../controllers/usersController');
const settingsController = require('../controllers/settingsController');

router.get('/', dashboardController.index);
router.get('/sales', salesController.index);

router.get('/inventory', inventoryController.index);
router.post('/inventory/add', inventoryController.addProduct); // Add route

router.get('/expenses', expensesController.index);
router.post('/expenses/add', expensesController.addExpense); // Add route

router.get('/credit', creditController.index);
router.get('/reports', reportsController.index);
router.get('/users', usersController.index);
router.get('/settings', settingsController.index);

module.exports = router;
