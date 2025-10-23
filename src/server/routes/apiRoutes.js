const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');
const { protect, isSuperAdmin, isBusinessAdmin } = require('../middleware/authMiddleware');

// User login
router.post('/login', async (req, res) => {
    console.log('API Route: Attempting user login.');
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Login failed: User with email ${email} not found.`);
            return res.status(400).send('Invalid email or password.');
        }

        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) {
            console.log(`Login failed: Password mismatch for user ${email}.`);
            return res.status(400).send('Invalid email or password.');
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(`Login successful for user: ${email}. Token generated.`);
        res.status(200).json({ token, role: user.role });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error logging in.');
    }
});

// PIN login
router.post('/api/login/pin', async (req, res) => {
    console.log('API Route: Attempting PIN login.');
    try {
        const { userId, pin } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            console.log(`PIN login failed: User not found for ID: ${userId}`);
            return res.status(400).send('User not found.');
        }

        const isMatch = await user.comparePin(pin);
        if (!isMatch) {
            console.log(`PIN login failed: Invalid PIN for user: ${user.email}`);
            return res.status(400).send('Invalid PIN.');
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(`PIN login successful for user: ${user.email}. Token generated.`);
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error during PIN login:', error);
        res.status(500).send('Error logging in with PIN.');
    }
});

// Get users for a specific business (for POS setup)
router.get('/api/users', async (req, res) => {
    console.log('API Route: Fetching users for POS setup.');
    try {
        const { apiKey } = req.query;
        if (!apiKey) {
            console.log('API key is required for fetching users.');
            return res.status(401).send('API key is required.');
        }

        const business = await Business.findOne({ apiKey });
        if (!business) {
            console.log(`Business not found for the provided API key.`);
            return res.status(404).send('Business not found.');
        }

        const users = await User.find({ business: business._id }).select('email');
        console.log(`Found ${users.length} users for business: ${business.name}`);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users for POS:', error);
        res.status(500).send('Error fetching users.');
    }
});

// Business Admin: Get their own users
router.get('/api/business-admin/users', protect, isBusinessAdmin, async (req, res) => {
    console.log(`API Route: Business Admin is fetching users.`);
    try {
        const adminUser = await User.findById(req.user.userId);
        const users = await User.find({ business: adminUser.business }).select('email role');
        console.log(`Found ${users.length} users for business admin: ${adminUser.email}`);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users for Business Admin:', error);
        res.status(500).send('Error fetching users.');
    }
});

// Business Admin: Create a new user
router.post('/api/business-admin/users', protect, isBusinessAdmin, async (req, res) => {
    console.log('API Route: Business Admin creating a new user.');
    try {
        const { email, password, pin, role } = req.body;
        const adminUser = await User.findById(req.user.userId);

        const newUser = new User({ email, password, pin, role, business: adminUser.business });
        await newUser.save();
        console.log(`Business Admin ${adminUser.email} successfully created new user ${email}.`);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user for Business Admin:', error);
        res.status(500).send('Error creating user.');
    }
});

// Super Admin: Get all businesses
router.get('/api/super-admin/businesses', protect, isSuperAdmin, async (req, res) => {
    console.log('API Route: Super Admin fetching all businesses.');
    try {
        const businesses = await Business.find().select('name');
        console.log(`Found ${businesses.length} businesses.`);
        res.json(businesses);
    } catch (error) {
        console.error('Error fetching businesses for Super Admin:', error);
        res.status(500).send('Error fetching businesses.');
    }
});

// Super Admin: Register a new business
router.post('/api/super-admin/register-business', protect, isSuperAdmin, async (req, res) => {
    console.log('API Route: Super Admin registering a new business.');
    try {
        const { businessName, email, password, pin } = req.body;

        const business = new Business({ name: businessName });
        await business.save();
        console.log(`New business "${businessName}" created with ID: ${business._id}`);

        const user = new User({ email, password, pin, role: 'Admin', business: business._id });
        await user.save();
        console.log(`Admin user "${email}" created for new business.`);

        res.status(201).json({ apiKey: business.apiKey });
    } catch (error) {
        console.error('Error registering new business:', error);
        res.status(500).send('Error registering business.');
    }
});

// Super Admin: Create a new user for any business
router.post('/api/super-admin/users', protect, isSuperAdmin, async (req, res) => {
    console.log('API Route: Super Admin creating a new user.');
    try {
        const { email, password, pin, role, businessId } = req.body;
        const newUser = new User({ email, password, pin, role, business: businessId });
        await newUser.save();
        console.log(`Super Admin successfully created new user ${email}.`);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user for Super Admin:', error);
        res.status(500).send('Error creating user.');
    }
});

module.exports = router;
