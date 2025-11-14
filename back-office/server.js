
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3003;

// --- Mongoose Schemas ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pin: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'cashier'], default: 'cashier' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  stock: { type: Number, default: 0 },
  image: { type: String }, // URL or path to the image
  description: { type: String },
}, { timestamps: true });
const Product = mongoose.model('Product', ProductSchema);

const ExpenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
}, { timestamps: true });
const Expense = mongoose.model('Expense', ExpenseSchema);

const BusinessSetupSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  receiptFooter: { type: String },
}, { timestamps: true });
const BusinessSetup = mongoose.model('BusinessSetup', BusinessSetupSchema);

const PrintJobSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'printed'], default: 'pending' },
}, { timestamps: true });
const PrintJob = mongoose.model('PrintJob', PrintJobSchema);

const TransactionSchema = new mongoose.Schema({
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
  }],
  total: Number,
  paymentMethod: String,
  cashier: String,
}, { timestamps: true });
const Transaction = mongoose.model('Transaction', TransactionSchema);

const CreditCustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  creditSales: [{
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    amount: Number,
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['unpaid', 'partially-paid', 'paid'], default: 'unpaid' },
  }],
}, { timestamps: true });
const CreditCustomer = mongoose.model('CreditCustomer', CreditCustomerSchema);

// --- Express App Setup ---
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'your-super-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.use(cors());

// --- Middleware ---
const checkAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

const checkApiKey = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// --- Routes ---
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid email or password.' });
  }
});

app.post('/register', async (req, res) => {
  const { name, email, password, pin, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, pin, role });
  res.json(user);
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/', checkAuth, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailySales = await Transaction.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);

  const topProducts = await Transaction.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.product', sales: { $sum: '$items.quantity' } } },
    { $sort: { sales: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
    { $unwind: '$productDetails' },
    { $project: { name: '$productDetails.name', sales: 1 } }
  ]);

  res.render('index', {
    dailySales: dailySales.length > 0 ? dailySales[0].total : 0,
    topSellingProducts: topProducts
  });
});

app.get('/expenses', checkAuth, async (req, res) => {
  const expenses = await Expense.find();
  res.render('expenses', { expenses });
});

app.post('/expenses/add', checkAuth, async (req, res) => {
  await Expense.create(req.body);
  res.redirect('/expenses');
});

app.get('/expenses/edit/:id', checkAuth, async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  res.render('edit-expense', { expense });
});

app.post('/expenses/edit/:id', checkAuth, async (req, res) => {
  await Expense.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/expenses');
});

app.post('/expenses/delete/:id', checkAuth, async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.redirect('/expenses');
});

app.get('/credit-customers', checkAuth, async (req, res) => {
  const customers = await CreditCustomer.find().populate('creditSales.transaction');
  res.render('credit-customers', { customers });
});

app.get('/credit-customers/:id', checkAuth, async (req, res) => {
  const customer = await CreditCustomer.findById(req.params.id).populate('creditSales.transaction');
  res.render('credit-customer-details', { customer });
});

app.post('/credit-customers/:id/add-payment', checkAuth, async (req, res) => {
  const { amount, saleId } = req.body;
  const customer = await CreditCustomer.findById(req.params.id);
  const sale = customer.creditSales.id(saleId);
  sale.paidAmount += parseFloat(amount);
  if (sale.paidAmount >= sale.amount) {
    sale.status = 'paid';
  } else {
    sale.status = 'partially-paid';
  }
  await customer.save();
  res.redirect(`/credit-customers/${req.params.id}`);
});

app.get('/business-details', checkAuth, async (req, res) => {
  const businessSetup = await BusinessSetup.findOne();
  res.render('business-details', { businessSetup: businessSetup || {} });
});

app.post('/business-details', checkAuth, async (req, res) => {
  await BusinessSetup.findOneAndUpdate({}, req.body, { upsert: true });
  res.redirect('/business-details');
});

app.post('/reprint/:id', checkAuth, async (req, res) => {
  await PrintJob.create({ transactionId: req.params.id });
  res.redirect('/reports'); // Or wherever you want to redirect after queuing
});

app.get('/reports', checkAuth, async (req, res) => {
  const { filter } = req.query;
  let transactions;
  if (filter === 'credit') {
    transactions = await Transaction.find({ paymentMethod: 'credit' }).sort({ createdAt: -1 });
  } else {
    transactions = await Transaction.find().sort({ createdAt: -1 });
  }
  res.render('reports', { transactions, filter: filter || 'all' });
});

app.get('/closing', checkAuth, async (req, res) => {
  res.render('closing');
});

// --- Multer Setup for Image Uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'back-office/public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Append extension
  }
});
const upload = multer({ storage: storage });

app.post('/closing', checkAuth, async (req, res) => {
  // Logic to archive daily sales and reset totals will be added here
  res.redirect('/');
});

app.get('/products', checkAuth, async (req, res) => {
  const products = await Product.find();
  res.render('products', { products });
});

app.get('/products/add', checkAuth, (req, res) => {
  res.render('add-product');
});

app.post('/products/add', checkAuth, upload.single('image'), async (req, res) => {
  const { name, price, category, stock, description } = req.body;
  let imageUrl;
  if (req.file) {
    imageUrl = `/public/uploads/${req.file.filename}`;
  }
  await Product.create({ name, price, category, stock, description, image: imageUrl });
  res.redirect('/products');
});

app.get('/products/edit/:id', checkAuth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('edit-product', { product });
});

app.post('/products/edit/:id', checkAuth, upload.single('image'), async (req, res) => {
  const { name, price, category, stock, description } = req.body;
  const updates = { name, price, category, stock, description };
  if (req.file) {
    updates.image = `/public/uploads/${req.file.filename}`;
  }
  await Product.findByIdAndUpdate(req.params.id, updates);
  res.redirect('/products');
});

app.post('/products/delete/:id', checkAuth, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/products');
});

app.get('/users', checkAuth, async (req, res) => {
  const users = await User.find();
  res.render('users', { users });
});

app.get('/users/add', checkAuth, (req, res) => {
  res.render('add-user');
});

app.post('/users/add', checkAuth, async (req, res) => {
  const { name, email, password, pin, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashedPassword, pin, role });
  res.redirect('/users');
});

app.get('/users/edit/:id', checkAuth, async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('edit-user', { user });
});

app.post('/users/edit/:id', checkAuth, async (req, res) => {
  const { name, email, password, pin, role } = req.body;
  const updates = { name, email, pin, role };
  if (password) {
    updates.password = await bcrypt.hash(password, 10);
  }
  await User.findByIdAndUpdate(req.params.id, updates);
  res.redirect('/users');
});

app.post('/users/delete/:id', checkAuth, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});


// --- API Routes for Sync ---
app.post('/api/upload', checkApiKey, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  // Construct the URL to the uploaded file
  const fileUrl = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
  res.json({ imageUrl: fileUrl });
});

app.get('/api/sync', checkApiKey, async (req, res) => {
  try {
    const [users, products, expenses, creditCustomers, businessSetup, printJobs] = await Promise.all([
      User.find(),
      Product.find(),
      Expense.find(),
      CreditCustomer.find(),
      BusinessSetup.findOne(),
      PrintJob.find({ status: 'pending' })
    ]);

    res.json({
      users,
      products,
      expenses,
      creditCustomers,
      businessSetup,
      printJobs
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data for sync.' });
  }
});

app.post('/api/clear-print-job/:id', checkApiKey, async (req, res) => {
  try {
    await PrintJob.findByIdAndUpdate(req.params.id, { status: 'printed' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear print job.' });
  }
});

app.post('/api/sync', checkApiKey, async (req, res) => {
  const operations = req.body;
  try {
    for (const op of operations) {
      switch (op.type) {
        case 'add-product':
          await Product.create(op.data);
          break;
        case 'update-product':
          await Product.findByIdAndUpdate(op.data.id, op.data.updates);
          break;
        case 'delete-product':
          await Product.findByIdAndDelete(op.data.id);
          break;
        case 'add-user':
          // Hash password before saving
          const hashedPassword = await bcrypt.hash(op.data.password, 10);
          await User.create({ ...op.data, password: hashedPassword });
          break;
        case 'update-user':
          await User.findByIdAndUpdate(op.data.id, op.data.updates);
          break;
        case 'delete-user':
          await User.findByIdAndDelete(op.data.id);
          break;
        case 'new-transaction':
          await Transaction.create(op.data);
          break;
        // Add other cases for expenses, etc.
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Sync operation failed.' });
  }
});

// Catch-all 404 route
app.use((req, res) => {
  res.status(404).render('404');
});

// --- Start Server ---
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // Create a default admin user if one doesn't exist
    const adminExists = await User.findOne({ email: process.env.BACK_OFFICE_EMAIL });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.BACK_OFFICE_PASSWORD, 10);
      await User.create({
        name: 'Admin',
        email: process.env.BACK_OFFICE_EMAIL,
        password: hashedPassword,
        pin: '1234', // Default PIN, can be changed later
        role: 'admin',
      });
      console.log('Default admin user created.');
    }

    app.listen(port, () => {
      console.log(`Back office server listening at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });
