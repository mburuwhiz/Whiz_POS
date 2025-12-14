const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const WebsiteUser = require('../models/WebsiteUser');
const websiteController = require('../controllers/websiteController');

// Mock EJS rendering
const app = express();
app.use(bodyParser.json()); // Support JSON bodies for supertest
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/../views');
// Mock res.render to avoid actual EJS compilation errors during test and just return status 200
app.use((req, res, next) => {
    const originalRender = res.render;
    res.render = function (view, locals) {
        res.status(200).send({ view, locals });
    };
    next();
});

// Routes
app.get('/', websiteController.home);
app.post('/signup', websiteController.signup);
app.post('/website/login', websiteController.login);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Website Controller', () => {
    it('should render home page', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.body.view).toBe('website/home');
    });

    it('should create a new user on signup', async () => {
        const res = await request(app).post('/signup').send({
            companyName: 'Test Corp',
            contactPerson: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            phone: '1234567890',
            natureOfBusiness: 'Retail'
        });

        const user = await WebsiteUser.findOne({ email: 'john@example.com' });
        expect(user).toBeTruthy();
        expect(user.companyName).toBe('Test Corp');
        expect(res.header['location']).toBe('/website/login');
    });

    it('should login with correct credentials', async () => {
        // Create user first (password is hashed by controller, but here we invoke controller)
        await request(app).post('/signup').send({
            companyName: 'Login Corp',
            contactPerson: 'Jane Doe',
            email: 'jane@example.com',
            password: 'password123',
            phone: '0987654321',
            natureOfBusiness: 'Cafe'
        });

        const res = await request(app).post('/website/login').send({
            email: 'jane@example.com',
            password: 'password123'
        });

        expect(res.header['location']).toBe('/portal');
    });
});
