const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

        if (!superAdminEmail) {
            throw new Error('SUPER_ADMIN_EMAIL is not defined in the .env file.');
        }

        // Check if the super admin already exists
        const existingAdmin = await User.findOne({ email: superAdminEmail });

        if (existingAdmin) {
            console.log('Super Admin user already exists.');
            return;
        }

        // If not, create the super admin user
        const superAdmin = new User({
            email: superAdminEmail,
            password: process.env.SUPER_ADMIN_PASSWORD, // The pre-save hook in the model will hash this
            pin: process.env.SUPER_ADMIN_PIN,           // The pre-save hook will hash this
            role: 'SuperAdmin' // Assign a special role
        });

        await superAdmin.save();
        console.log('Super Admin user created successfully!');

    } catch (error) {
        console.error('Error during Super Admin setup:', error.message);
    } finally {
        // Ensure the connection is closed
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

createSuperAdmin();
