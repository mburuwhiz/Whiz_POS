const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Business = require('../models/Business');

dotenv.config({ path: '../.env' });

const createUser = async () => {
    const [,, email, password, pin, role, businessId] = process.argv;

    if (!email || !password || !pin || !role || !businessId) {
        console.log('Usage: node createUser.js <email> <password> <pin> <role> <businessId>');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if business exists
        const business = await Business.findById(businessId);
        if (!business) {
            console.error('Business not found.');
            process.exit(1);
        }

        const user = new User({ email, password, pin, role, business: businessId });
        await user.save();

        console.log(`User ${email} created successfully for business ${business.name}`);
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

createUser();
