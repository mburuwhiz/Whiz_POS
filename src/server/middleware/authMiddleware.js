const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = (req, res, next) => {
    const handleUnauthorized = () => {
        // Check the 'Accept' header to determine the response type
        const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
        if (acceptsHtml) {
            // It's a browser page request, so redirect
            return res.redirect('/login');
        } else {
            // It's an API request, so send a JSON error
            return res.status(401).json({ message: 'Your session has expired or is invalid. Please log in again.' });
        }
    };

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return handleUnauthorized();
            }
            req.user = decoded;
            next();
        });
    } else {
        handleUnauthorized();
    }
};

// Middleware to check for Super Admin
const isSuperAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (user && user.role === 'SuperAdmin') {
            next();
        } else {
            res.status(403).send('Forbidden: Not a Super Admin');
        }
    } catch (error) {
        res.status(500).send('Error checking user role.');
    }
};

// Middleware to check for Business Admin
const isBusinessAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (user && user.role === 'Admin') {
            next();
        } else {
            res.status(403).send('Forbidden: Not a Business Admin');
        }
    } catch (error) {
        res.status(500).send('Error checking user role.');
    }
};

module.exports = {
    protect,
    isSuperAdmin,
    isBusinessAdmin,
};
