const WebsiteUser = require('../models/WebsiteUser');
const bcrypt = require('bcryptjs');

const layout = 'website/layout';

exports.home = (req, res) => {
    res.render('website/home', {
        title: 'Whiz POS - Power Your Business',
        layout: layout,
        path: '/'
    });
};

exports.windows = (req, res) => {
    res.render('website/windows', {
        title: 'Whiz POS for Windows',
        layout: layout,
        path: '/windows-pos'
    });
};

exports.mobile = (req, res) => {
    res.render('website/mobile', {
        title: 'Whiz POS Mobile App',
        layout: layout,
        path: '/mobile-apk'
    });
};

exports.backOfficeInfo = (req, res) => {
    res.render('website/back-office-info', {
        title: 'Cloud Back Office',
        layout: layout,
        path: '/cloud-back-office'
    });
};

exports.signupPage = (req, res) => {
    res.render('website/signup', {
        title: 'Sign Up - Whiz POS',
        layout: layout,
        path: '/signup',
        error: null
    });
};

exports.signup = async (req, res) => {
    const { companyName, contactPerson, email, password, phone, natureOfBusiness } = req.body;
    try {
        const existingUser = await WebsiteUser.findOne({ email });
        if (existingUser) {
            return res.render('website/signup', {
                title: 'Sign Up - Whiz POS',
                layout: layout,
                path: '/signup',
                error: 'Email already registered.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new WebsiteUser({
            companyName,
            contactPerson,
            email,
            password: hashedPassword,
            phone,
            natureOfBusiness
        });

        await newUser.save();
        res.redirect('/website/login');
    } catch (error) {
        console.error(error);
        res.render('website/signup', {
            title: 'Sign Up - Whiz POS',
            layout: layout,
            path: '/signup',
            error: 'An error occurred. Please try again.'
        });
    }
};

exports.loginPage = (req, res) => {
    res.render('website/login', {
        title: 'Login - Whiz POS',
        layout: layout,
        path: '/website/login',
        error: null
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await WebsiteUser.findOne({ email });
        if (!user) {
            return res.render('website/login', {
                title: 'Login - Whiz POS',
                layout: layout,
                path: '/website/login',
                error: 'Invalid email or password.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('website/login', {
                title: 'Login - Whiz POS',
                layout: layout,
                path: '/website/login',
                error: 'Invalid email or password.'
            });
        }

        req.session.websiteUser = user;
        res.redirect('/portal');
    } catch (error) {
        console.error(error);
        res.render('website/login', {
            title: 'Login - Whiz POS',
            layout: layout,
            path: '/website/login',
            error: 'An error occurred.'
        });
    }
};

exports.logout = (req, res) => {
    req.session.websiteUser = null;
    res.redirect('/');
};

exports.dashboard = (req, res) => {
    if (!req.session.websiteUser) {
        return res.redirect('/website/login');
    }
    // Refresh user data from DB to check verification status
    WebsiteUser.findById(req.session.websiteUser._id).then(user => {
        if (!user) {
            req.session.websiteUser = null;
            return res.redirect('/website/login');
        }
        req.session.websiteUser = user; // Update session
        res.render('website/dashboard', {
            title: 'My Account - Whiz POS',
            layout: layout,
            path: '/portal',
            user: user
        });
    }).catch(err => {
        console.error(err);
        res.redirect('/website/login');
    });
};

// Admin Logic for verifying users
exports.adminVerificationList = async (req, res) => {
    // Check if the current logged-in user (Back Office Admin) has rights
    // Using the existing 'req.session.user' from the main back-office auth
    // Assuming 'admin' role check is done in middleware or here
    // For now, assume any logged in back-office user is an admin

    try {
        const pendingUsers = await WebsiteUser.find({ isVerified: false });
        res.render('admin/verification', {
            title: 'Verify Website Users',
            pendingUsers,
            path: '/admin/verification',
            // Use the MAIN app layout for this admin page
            layout: './layout/main',
            user: req.session.user,
            businessName: process.env.BUSINESS_NAME || 'WHIZ POS'
        });
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard');
    }
};

exports.verifyUser = async (req, res) => {
    const { userId, backOfficeLink, assignedUsername, assignedPassword } = req.body;
    try {
        await WebsiteUser.findByIdAndUpdate(userId, {
            isVerified: true,
            backOfficeLink,
            assignedUsername,
            assignedPassword
        });
        res.redirect('/admin/verification');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/verification');
    }
};

exports.downloadExe = (req, res) => {
    if (!req.session.websiteUser || !req.session.websiteUser.isVerified) {
        return res.status(403).send('Access Denied. Please wait for verification.');
    }

    // Serve a placeholder or real file.
    // Since we don't have the .exe, we'll send a text file or 404 handled gracefully.
    // Ideally, this should point to a protected static file.
    // For this task, I'll send a dummy response.
    res.set('Content-Disposition', 'attachment; filename="WhizPOS_Setup_v5.2.0.exe"');
    res.send('This is a placeholder for the Whiz POS Windows Installer.');
};
