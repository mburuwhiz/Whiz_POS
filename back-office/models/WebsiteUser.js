const mongoose = require('mongoose');

const websiteUserSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    natureOfBusiness: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['client', 'admin'],
        default: 'client'
    },
    backOfficeLink: {
        type: String,
        default: ''
    },
    assignedUsername: {
        type: String,
        default: ''
    },
    assignedPassword: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WebsiteUser', websiteUserSchema);
