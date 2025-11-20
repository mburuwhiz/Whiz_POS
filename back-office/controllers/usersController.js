const User = require('../models/User');

exports.index = async (req, res) => {
    try {
        const users = await User.find().sort({ username: 1 });
        res.render('pages/users', {
            title: 'User Management',
            users
        });
    } catch (error) {
        console.error(error);
        res.render('pages/users', {
            title: 'User Management',
            users: [],
            error: 'Failed to load users'
        });
    }
};
