const mongoose = require('mongoose');
const crypto = require('crypto');

const businessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    apiKey: {
        type: String,
        unique: true,
    },
}, {
    timestamps: true,
});

// Generate a unique API key before saving a new business
businessSchema.pre('save', function (next) {
    if (!this.apiKey) {
        this.apiKey = crypto.randomBytes(20).toString('hex');
    }
    next();
});

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;
