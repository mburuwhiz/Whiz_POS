const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Business = require('./models/Business');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../../public')));

const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Mount Routers
const viewRoutes = require('./routes/viewRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/', viewRoutes);
app.use('/api', authRoutes);

// API endpoint to get users for a specific business (for POS)
app.get('/api/users', async (req, res) => {
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

// API endpoint for Business Admin to get their own users
app.get('/api/business-admin/users', protect, isBusinessAdmin, async (req, res) => {
    try {
        const adminUser = await User.findById(req.user.userId);
        const users = await User.find({ business: adminUser.business }).select('email role');
        res.json(users);
    } catch (error) {
        res.status(500).send('Error fetching users.');
    }
});

app.get('/api/super-admin/businesses', protect, isSuperAdmin, async (req, res) => {
    try {
        const businesses = await Business.find().select('name');
        res.json(businesses);
    } catch (error) {
        res.status(500).send('Error fetching businesses.');
    }
});

app.post('/api/super-admin/register-business', protect, isSuperAdmin, async (req, res) => {
    try {
        const { businessName, email, password, pin } = req.body;

        // Create new business
        const business = new Business({ name: businessName });
        await business.save();

        // Create new admin user for the business
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

app.post('/api/super-admin/users', protect, isSuperAdmin, async (req, res) => {
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

// API endpoint for Business Admin to create a new user
app.post('/api/business-admin/users', protect, isBusinessAdmin, async (req, res) => {
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

app.post('/login', async (req, res) => {
    console.log('Login attempt received.');
    try {
        const { email, password } = req.body;
        console.log(`Attempting to log in user: ${email}`);

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Login failed: User with email ${email} not found.`);
            return res.status(400).send('Invalid email or password.');
        }
        console.log(`User found: ${user.email}, Role: ${user.role}`);

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log(`Login failed: Password mismatch for user ${email}.`);
            return res.status(400).send('Invalid email or password.');
        }

        console.log(`Login successful for user: ${email}`);
        // Generate JWT
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1 hour
        });

        res.status(200).json({ role: user.role });
    } catch (error) {
        console.error('An unexpected error occurred during login:', error);
        res.status(500).send('Error logging in.');
    }
});

app.post('/api/login/pin', async (req, res) => {
    try {
        const { userId, pin } = req.body;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).send('User not found.');
        }

        // Compare PIN
        const isMatch = await user.comparePin(pin);
        if (!isMatch) {
            return res.status(400).send('Invalid PIN.');
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1 hour
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).send('Error logging in with PIN.');
    }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
