const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Business = require('./models/Business');

dotenv.config();

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
                // This will catch expired tokens, etc.
                return res.status(401).redirect('/login');
            }
            // You could attach the user to the request here if needed
            // req.user = decoded;
            next();
        });
    } else {
        // No token, redirect to login
        res.status(401).redirect('/login');
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

app.get('/register-business', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/register-business.html'));
});

app.get('/dashboard', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});

// API endpoint to get users for a specific business
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

app.post('/api/register-business', async (req, res) => {
    try {
        const { businessName, email, password, pin, registrationCode } = req.body;

        // Verify registration code
        if (registrationCode !== process.env.REGISTRATION_CODE) {
            return res.status(401).send('Invalid registration code.');
        }

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

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Invalid email or password.');
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).send('Invalid email or password.');
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
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
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).send('Error logging in with PIN.');
    }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
