const express = require('express');
const router = express.Router();

// @desc    Log user out
// @route   GET /api/logout
router.get('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.redirect('/login');
});

module.exports = router;
