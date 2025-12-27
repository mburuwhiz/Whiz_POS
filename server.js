const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection & Admin Seeding
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await seedAdmin();
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'System Admin';
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || '0000000000';

  if (!adminEmail || !adminPassword) {
    console.log('Admin seeding skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set.');
    return;
  }

  try {
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        contactPerson: adminName,
        phone: adminPhone,
        natureOfBusiness: 'Administration',
        role: 'admin',
        status: 'approved'
      });
      console.log(`Admin account created: ${adminEmail}`);
    } else {
      // Optional: Update admin role/status if they exist but aren't admin?
      // For now, just log.
      console.log('Admin account already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Make env available to views
app.use((req, res, next) => {
  res.locals.env = process.env;
  next();
});

// Routes
app.use('/', require('./routes/pageRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
