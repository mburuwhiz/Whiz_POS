const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// const indexRoutes = require('./routes/index');
// app.use('/', indexRoutes);

app.get('/', (req, res) => {
    // In a real app, this would come from a database
    const businessName = "WHIZ POS";
    res.render('dashboard', {
        businessName: businessName,
        pageName: 'Dashboard'
    });
});

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Back-office is running' });
});


app.listen(port, () => {
    console.log(`Back-office server listening at http://localhost:${port}`);
});
