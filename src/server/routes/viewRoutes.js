const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Render Login Page
// @route   GET /
router.get('/', (req, res) => {
    res.render('login');
});

// @desc    Render POS Login Page
// @route   GET /pos-login
router.get('/pos-login', (req, res) => {
    res.render('pos-login');
});

// @desc    Render Super Admin Dashboard
// @route   GET /super-admin
router.get('/super-admin', protect, authorize('SuperAdmin'), (req, res) => {
    res.render('super-admin', { user: req.user });
});

// @desc    Render Business Admin Dashboard
// @route   GET /business-admin
router.get('/business-admin', protect, authorize('Admin'), (req, res) => {
    res.render('business-admin', { user: req.user });
});

// @desc    Render POS Terminal
// @route   GET /pos-terminal
router.get('/pos-terminal', protect, (req, res) => {
    res.render('pos-terminal', { user: req.user });
});

module.exports = router;
