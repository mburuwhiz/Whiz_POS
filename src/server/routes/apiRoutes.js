const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');
const { protect, isSuperAdmin, isBusinessAdmin } = require('../middleware/authMiddleware');

// User login
router.post('/login', async (req, res) => {
    console.log('Login attempt received.');
    try {
        const { email, password } = req.body;
        console.log(`Attempting to log in user: ${email}`);

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Login failed: User with email ${email} not found.`);
            return res.status(400).send('Invalid email or password.');
        }
        console.log(`User found: ${user.email}, Role: ${user.role}`);

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log(`Login failed: Password mismatch for user ${email}.`);
            return res.status(400).send('Invalid email or password.');
        }

        console.log(`Login successful for user: ${email}`);
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, role: user.role });
    } catch (error) {
        console.error('An unexpected error occurred during login:', error);
        res.status(500).send('Error logging in.');
    }
});

// PIN login
router.post('/api/login/pin', async (req, res) => {
    try {
        const { userId, pin } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).send('User not found.');
        }

        const isMatch = await user.comparePin(pin);
        if (!isMatch) {
            return res.status(400).send('Invalid PIN.');
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).send('Error logging in with PIN.');
    }
});

// Get users for a specific business (for POS)
router.get('/api/users', async (req, res) => {
    try {
        const { apiKey } = req.query;
        if (!apiKey) {
            return res.status(401).send('API key is required.');
        }

        const business = await Business.findOne({ apiKey });
        if (!business) {
            return res.status(404).send('Business not found.');
        }

        const users = await User.find({ business: business._id }).select('email');
        res.json(users);
    } catch (error) {
        res.status(500).send('Error fetching users.');
    }
});

// Business Admin: Get their own users
router.get('/api/business-admin/users', protect, isBusinessAdmin, async (req, res) => {
    try {
        const adminUser = await User.findById(req.user.userId);
        const users = await User.find({ business: adminUser.business }).select('email role');
        res.json(users);
    } catch (error) {
        res.status(500).send('Error fetching users.');
    }
});

// Business Admin: Create a new user
router.post('/api/business-admin/users', protect, isBusinessAdmin, async (req, res) => {
    try {
        const { email, password, pin, role } = req.body;
        const adminUser = await User.findById(req.user.userId);

        const newUser = new User({
            email,
            password,
            pin,
            role,
            business: adminUser.business,
        });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).send('Error creating user.');
    }
});

// Super Admin: Get all businesses
router.get('/api/super-admin/businesses', protect, isSuperAdmin, async (req, res) => {
    try {
        const businesses = await Business.find().select('name');
        res.json(businesses);
    } catch (error) {
        res.status(500).send('Error fetching businesses.');
    }
});

// Super Admin: Register a new business
router.post('/api/super-admin/register-business', protect, isSuperAdmin, async (req, res) => {
    try {
        const { businessName, email, password, pin } = req.body;

        const business = new Business({ name: businessName });
        await business.save();

        const user = new User({
            email,
            password,
            pin,
            role: 'Admin',
            business: business._id,
        });
        await user.save();

        res.status(201).json({ apiKey: business.apiKey });
    } catch (error) {
        res.status(500).send('Error registering business.');
    }
});

// Super Admin: Create a new user for any business
router.post('/api/super-admin/users', protect, isSuperAdmin, async (req, res) => {
    try {
        const { email, password, pin, role, businessId } = req.body;

        const newUser = new User({
            email,
            password,
            pin,
            role,
            business: businessId,
        });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).send('Error creating user.');
    }
});

module.exports = router;
