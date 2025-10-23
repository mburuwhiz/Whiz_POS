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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../../public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to protect routes
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Token is invalid or expired
                return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
            }
            req.user = decoded;
            next();
        });
    } else {
        // No token provided
        res.status(401).json({ message: 'Not authorized. Please log in.' });
    }
};

// Middleware to check for Super Admin
const isSuperAdmin = async (req, res, next) => {
    const user = await User.findById(req.user.userId);
    if (user && user.role === 'SuperAdmin') {
        next();
    } else {
        res.status(403).send('Forbidden: Not a Super Admin');
    }
};

// Middleware to check for Business Admin
const isBusinessAdmin = async (req, res, next) => {
    const user = await User.findById(req.user.userId);
    if (user && user.role === 'Admin') {
        next();
    } else {
        res.status(403).send('Forbidden: Not a Business Admin');
    }
};

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get('/pos-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/pos-login.html'));
});

app.get('/super-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/super-admin.html'));
});

app.get('/business-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/business-admin.html'));
});

app.get('/pos-terminal', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/pos-terminal.html'));
});

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

        res.status(200).json({ token, role: user.role });
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

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).send('Error logging in with PIN.');
    }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
