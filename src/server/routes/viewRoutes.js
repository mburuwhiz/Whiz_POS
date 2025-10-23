const express = require('express');
const router = express.Router();
const { protect, isSuperAdmin, isBusinessAdmin } = require('../middleware/authMiddleware');

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/pos-login', (req, res) => {
    res.render('pos-login');
});

router.get('/super-admin', protect, isSuperAdmin, (req, res) => {
    res.render('super-admin');
});

router.get('/business-admin', protect, isBusinessAdmin, (req, res) => {
    res.render('business-admin');
});

router.get('/pos-terminal', protect, (req, res) => {
    res.render('pos-terminal');
});

module.exports = router;
