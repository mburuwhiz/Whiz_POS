const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Admin', 'Manager', 'Cashier', 'Stock Clerk', 'SuperAdmin'],
        default: 'Cashier',
    },
    pin: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 4,
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: false, // SuperAdmin is not associated with a specific business
    }
}, {
    timestamps: true,
});

// Hash the password and PIN before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next(error);
        }
    }

    if (this.isModified('pin')) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.pin = await bcrypt.hash(this.pin, salt);
        } catch (error) {
            return next(error);
        }
    }

    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to compare PINs
userSchema.methods.comparePin = async function (candidatePin) {
    return bcrypt.compare(candidatePin, this.pin);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
