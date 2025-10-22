const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const createUser = async () => {
    const [,, email, password, pin, role] = process.argv;

    if (!email || !password || !pin || !role) {
        console.log('Usage: node createUser.js <email> <password> <pin> <role>');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = new User({ email, password, pin, role });
        await user.save();

        console.log(`User ${email} created successfully with role ${role}`);
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

createUser();
