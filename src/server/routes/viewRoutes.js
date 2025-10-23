const express = require('express');
const router = express.Router();
const { protect, isSuperAdmin, isBusinessAdmin } = require('../middleware/authMiddleware');

// Note: The protection for view routes is handled by the client-side script
// in each respective EJS file, which checks for a token in localStorage.
// The server freely serves the page shell, and the client-side code handles auth.
// API routes remain protected by the server-side middleware.

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/pos-login', (req, res) => {
    res.render('pos-login');
});

router.get('/super-admin', (req, res) => {
    res.render('super-admin');
});

router.get('/business-admin', (req, res) => {
    res.render('business-admin');
});

router.get('/pos-terminal', (req, res) => {
    res.render('pos-terminal');
});

module.exports = router;
