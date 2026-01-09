const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const crypto = require('crypto');
const os = require('os');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');
const { generateReceipt, generateClosingReport, generateBusinessSetup } = require(path.join(__dirname, 'print-jobs.cjs'));
const { MongoClient } = require('mongodb');
const { dialog } = require('electron'); // For file dialogs

const store = new Store();

/**
 * Main Electron Process Script.
 * Handles application lifecycle, window management, IPC communication, and a local API server for mobile printing.
 */

// Custom Logger Setup
const logFilePath = path.join(app.getPath('userData'), 'logs.txt');

function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;
    fs.appendFile(logFilePath, logLine).catch(err => console.error('Failed to write to log file:', err));
}

// Override console methods to capture logs
const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
    const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
    logToFile(`INFO: ${message}`);
    originalLog.apply(console, args);
};

console.error = (...args) => {
    const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
    logToFile(`ERROR: ${message}`);
    originalError.apply(console, args);
};

// Define paths for storing user data and assets.
const userDataPath = path.join(app.getPath('userData'), 'data');
const productImagesPath = path.join(app.getPath('userData'), 'assets', 'product_images');

/**
 * Ensures that the necessary application directories exist.
 * Creates 'data' and 'assets/product_images' directories in the user data path.
 */
async function ensureAppDirs() {
  try {
    await fs.mkdir(userDataPath, { recursive: true });
    await fs.mkdir(productImagesPath, { recursive: true });
  } catch (error) {
    console.error('Failed to create application directories:', error);
  }
}

/**
 * Helper to safely read JSON file
 */
async function readJsonFile(filename) {
    try {
        const data = await fs.readFile(path.join(userDataPath, filename), 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return []; // Default to empty array or object depending on usage, but array is safer for lists
    }
}

/**
 * Helper to safely write JSON file
 */
async function writeJsonFile(filename, data) {
    await fs.writeFile(path.join(userDataPath, filename), JSON.stringify(data, null, 2));
}

/**
 * Ensures that the initial JSON data files exist in the user data directory.
 * If a file is missing, it is created with a default empty structure.
 */
async function ensureDataFilesExist() {
  const dataFiles = {
    'business-setup.json': { isSetup: false },
    'server-config.json': { apiKey: null }, // Persist API Key
    'users.json': [],
    'products.json': [],
    'transactions.json': [],
    'expenses.json': [],
    'salaries.json': [], // New file for salaries
    'credit-customers.json': [],
    'mobile-receipts.json': [], // New file for queuing mobile receipts
    'credit-payments.json': [], // New file for credit payments
    'inventory-logs.json': [], // New file for inventory logs
    'daily-summaries.json': {}, // New file for archived daily reports
  };

  for (const [fileName, content] of Object.entries(dataFiles)) {
    const filePath = path.join(userDataPath, fileName);
    try {
      await fs.access(filePath);
    } catch {
      // File does not exist, so create it
      await fs.writeFile(filePath, JSON.stringify(content, null, 2));
    }
  }
}

/**
 * Loads a URL into a BrowserWindow with retry logic.
 * Useful for development when the Vite server might not be ready immediately.
 *
 * @param {BrowserWindow} win - The window to load the URL into.
 * @param {string} url - The URL to load.
 */
const loadUrlWithRetries = (win, url) => {
  win.loadURL(url).catch(() => {
    console.log('Vite server not ready, retrying in 2 seconds...');
    setTimeout(() => {
      loadUrlWithRetries(win, url);
    }, 2000);
  });
};

/**
 * Creates the main application window.
 * Configures size, preferences, and loads the application content.
 */
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // contextIsolation is true by default and is a security best practice.
    },
  });

  // Remove the default menu bar
  mainWindow.setMenu(null);

  // In development, load from the Vite dev server
  if (!app.isPackaged) {
    const url = process.argv[2] || 'http://localhost:5174';
    loadUrlWithRetries(mainWindow, url);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the static build
    mainWindow.loadURL('file://' + path.join(__dirname, 'dist/index.html'));
  }
}

// Enable remote debugging for Playwright
app.commandLine.appendSwitch('remote-debugging-port', '9222');

// Global API Key variable
let apiKey = null;
let server = null;
global.connectedDevicesMap = new Map();

/**
 * Initialize API Key from storage or create if missing
 */
async function initApiKey() {
    try {
        const configPath = path.join(userDataPath, 'server-config.json');
        let config = {};
        try {
            const data = await fs.readFile(configPath, 'utf-8');
            config = JSON.parse(data);
        } catch (e) {
            // Config might not exist yet
        }

        if (config.apiKey) {
            apiKey = config.apiKey;
        } else {
            apiKey = crypto.randomBytes(32).toString('hex');
            config.apiKey = apiKey;
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        }
        console.log('Server API Key initialized');
    } catch (e) {
        console.error('Failed to init API Key', e);
        apiKey = crypto.randomBytes(32).toString('hex'); // Fallback to memory
    }
}


/**
 * Gets the local IPv4 address of the machine.
 * Used for generating the connection URL for the mobile app.
 *
 * @returns {string} The local IP address.
 */
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

/**
 * Starts the local Express API server.
 * This server allows the Mobile App to send print jobs to the Desktop App.
 */
function startApiServer() {
    const apiApp = express();

    // Increase body limit to support large sync payloads
    apiApp.use(express.json({ limit: '50mb' }));
    apiApp.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Enable CORS for all routes, allowing specific headers for mobile sync
    apiApp.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY', 'X-DEVICE-NAME'],
    }));

    // Serve product images statically
    apiApp.use('/assets', express.static(productImagesPath));

    // Middleware to track connected devices
    apiApp.use((req, res, next) => {
        const deviceName = req.headers['x-device-name'] || req.headers['user-agent'] || 'Unknown Device';
        const ip = req.ip.replace('::ffff:', ''); // Clean IPv6 prefix

        // Update device last seen
        if (global.connectedDevicesMap) {
            global.connectedDevicesMap.set(ip, {
                ip,
                name: deviceName,
                lastSeen: new Date().toISOString()
            });
        }

        next();
    });

    const authMiddleware = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const xApiKey = req.headers['x-api-key'];

        if (xApiKey && xApiKey === apiKey) {
            return next();
        }
        if (authHeader && authHeader === `Bearer ${apiKey}`) {
            return next();
        }

        return res.status(401).json({ error: 'Unauthorized' });
    };

    // Public Status Endpoint for Connectivity Check
    // IMPORTANT: Defined before other routes to ensure availability
    apiApp.get('/api/status', (req, res) => {
        console.log(`[API] Status check received from ${req.ip}`);
        res.json({ status: 'ok', message: 'Whiz POS Server Online' });
    });

    apiApp.get('/', (req, res) => {
        console.log(`[API] Root accessed from ${req.ip}`);
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Whiz POS Server</title>
                <style>
                    body { background: #0f172a; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    .container { text-align: center; padding: 2rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; background: rgba(255,255,255,0.05); }
                    h1 { color: #38bdf8; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Whiz POS Server</h1>
                    <p>Status: Online</p>
                    <p><small>Checking connections...</small></p>
                </div>
            </body>
            </html>
        `);
    });

    apiApp.get('/api/config', (req, res) => {
      // apiKey is now managed by initApiKey, but fallback if still null
      if (!apiKey) apiKey = crypto.randomBytes(32).toString('hex');

      const ipAddress = getLocalIpAddress();
      const address = server ? server.address() : null;
      const port = (address && typeof address === 'object' && address.port) ? address.port : 3000;
      res.json({ apiKey, apiUrl: `http://${ipAddress}:${port}` });
    });

    // GET /api/products - Legacy endpoint
    apiApp.get('/api/products', authMiddleware, async (req, res) => {
        const products = await readJsonFile('products.json');
        res.json(products);
    });

    // GET /api/users - For Mobile Login
    apiApp.get('/api/users', authMiddleware, async (req, res) => {
        const users = await readJsonFile('users.json');
        res.json(users);
    });

    // GET /api/sync - Full state for Mobile Pull
    apiApp.get('/api/sync', authMiddleware, async (req, res) => {
        try {
            const [products, users, expenses, salaries, creditCustomers, businessSetup, transactions] = await Promise.all([
                readJsonFile('products.json'),
                readJsonFile('users.json'),
                readJsonFile('expenses.json'),
                readJsonFile('salaries.json'),
                readJsonFile('credit-customers.json'),
                readJsonFile('business-setup.json').then(d => Array.isArray(d) ? d[0] : d), // Handle potential array wrapper
                readJsonFile('transactions.json')
            ]);

            // Filter transactions? Mobile might not need ALL history.
            // But for now, sending last 100 might be safer to avoid huge payloads.
            // posStore handles partial updates.
            const limitedTransactions = Array.isArray(transactions) ? transactions.slice(0, 200) : [];

            // Rewrite image URLs to be accessible via HTTP
            const ipAddress = getLocalIpAddress();
            const address = server ? server.address() : null;
            const port = (address && typeof address === 'object' && address.port) ? address.port : 3000;
            const baseUrl = `http://${ipAddress}:${port}`;

            const productsWithUrls = products.map(p => {
                if (p.localImage && !p.image.startsWith('http')) {
                    // Assuming localImage is absolute path, we need to extract filename
                    const filename = path.basename(p.localImage);
                    return { ...p, image: `${baseUrl}/assets/${filename}` };
                }
                return p;
            });

            res.json({
                products: productsWithUrls,
                users,
                expenses,
                salaries,
                creditCustomers,
                businessSetup,
                transactions: limitedTransactions
            });
        } catch (error) {
            console.error('Sync GET error:', error);
            res.status(500).json({ error: 'Sync failed' });
        }
    });

    // POST /api/sync - Handle Push Operations
    apiApp.post('/api/sync', authMiddleware, async (req, res) => {
        const operations = req.body;
        // Support wrapping operations in an object { operations: [] } or just array
        const ops = Array.isArray(operations) ? operations : operations.operations;

        if (!Array.isArray(ops)) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        try {
            // Process operations sequentially
            for (const op of ops) {
                const { type, data } = op;

                if (type === 'new-transaction' || type === 'transaction') { // Handle both type names
                    const transactions = await readJsonFile('transactions.json');
                    // Check for duplicate transaction ID
                    if (!transactions.some(t => t.id === data.id)) {
                        transactions.unshift(data);
                        await writeJsonFile('transactions.json', transactions);
                    }

                } else if (type === 'add-credit-customer') {
                    const customers = await readJsonFile('credit-customers.json');
                    customers.push(data);
                    await writeJsonFile('credit-customers.json', customers);

                } else if (type === 'update-credit-customer') {
                    const customers = await readJsonFile('credit-customers.json');
                    const idx = customers.findIndex(c => c.id === data.id);
                    if (idx !== -1) {
                        customers[idx] = { ...customers[idx], ...data.updates };
                        await writeJsonFile('credit-customers.json', customers);
                    }

                } else if (type === 'add-expense') {
                    const expenses = await readJsonFile('expenses.json');
                    // Ensure cashier field is set if present (Back-Office logic parity)
                    if (data.cashier && !data.recordedBy) {
                        data.recordedBy = data.cashier;
                    }
                    expenses.unshift(data);
                    await writeJsonFile('expenses.json', expenses);

                } else if (type === 'add-salary') {
                    const salaries = await readJsonFile('salaries.json');
                    salaries.unshift(data);
                    await writeJsonFile('salaries.json', salaries);

                } else if (type === 'delete-salary') {
                    const salaries = await readJsonFile('salaries.json');
                    const newSalaries = salaries.filter(s => s.id !== data.id);
                    await writeJsonFile('salaries.json', newSalaries);

                } else if (type === 'add-product') {
                    const products = await readJsonFile('products.json');
                    // Check for duplicate
                    const exists = products.find(p => p.productId === data.id || p.productId === data.productId);
                    if (!exists) {
                        const newProduct = { ...data, productId: data.id || data.productId };
                        delete newProduct.id;
                        products.push(newProduct);
                        await writeJsonFile('products.json', products);
                    }

                } else if (type === 'update-product') {
                    const products = await readJsonFile('products.json');
                    const prodId = data.id || data.productId;
                    const idx = products.findIndex(p => p.productId === prodId);
                    if (idx !== -1) {
                        const updates = data.updates || data; // Handle both wrapper and direct updates
                        delete updates.id;
                        products[idx] = { ...products[idx], ...updates };
                        await writeJsonFile('products.json', products);
                    }

                } else if (type === 'delete-product') {
                    const products = await readJsonFile('products.json');
                    const prodId = data.id || data.productId;
                    const newProducts = products.filter(p => p.productId !== prodId);
                    await writeJsonFile('products.json', newProducts);

                } else if (type === 'add-user') {
                    const users = await readJsonFile('users.json');
                    const newUser = { ...data, userId: data.id || data.userId };
                    delete newUser.id;
                    // Generate username if missing (Back-Office logic)
                    if (!newUser.username && newUser.name) {
                        newUser.username = newUser.name.toLowerCase().replace(/\s+/g, '');
                    }
                    users.push(newUser);
                    await writeJsonFile('users.json', users);

                } else if (type === 'update-user') {
                    const users = await readJsonFile('users.json');
                    const userId = data.id || data.userId;
                    const idx = users.findIndex(u => u.userId === userId);
                    if (idx !== -1) {
                        const updates = data.updates || data;
                        delete updates.id;
                        users[idx] = { ...users[idx], ...updates };
                        await writeJsonFile('users.json', users);
                    }

                } else if (type === 'delete-user') {
                    const users = await readJsonFile('users.json');
                    const userId = data.id || data.userId;
                    const newUsers = users.filter(u => u.userId !== userId);
                    await writeJsonFile('users.json', newUsers);

                } else if (type === 'delete-transaction') {
                    const transactions = await readJsonFile('transactions.json');
                    const newTransactions = transactions.filter(t => t.id !== data.id);
                    await writeJsonFile('transactions.json', newTransactions);
                }
            }

            // Notify Renderer to update state and push to Cloud
            const mainWindow = BrowserWindow.getAllWindows()[0];
            if (mainWindow) {
                mainWindow.webContents.send('mobile-data-sync', ops);
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Sync POST error:', error);
            res.status(500).json({ error: 'Sync processing failed' });
        }
    });

    apiApp.post('/api/transactions', authMiddleware, async (req, res) => {
        const newTransaction = req.body;
        try {
            const transactions = await readJsonFile('transactions.json');
            if (!transactions.some(t => t.id === newTransaction.id)) {
                transactions.unshift(newTransaction);
                await writeJsonFile('transactions.json', transactions);
            }
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to save transaction' });
        }
    });

    apiApp.post('/api/print-receipt', authMiddleware, async (req, res) => {
        const { transaction, businessSetup } = req.body;

        try {
            // Instead of auto-printing, save to mobile-receipts.json
            const receipts = await readJsonFile('mobile-receipts.json');
            const newReceipt = {
                ...transaction,
                _printId: Date.now().toString(), // Unique ID for the print job
                _receivedAt: new Date().toISOString()
            };
            receipts.push(newReceipt);
            await writeJsonFile('mobile-receipts.json', receipts);

            const mainWindow = BrowserWindow.getAllWindows()[0];
            if (mainWindow) {
                // Notify Renderer of new receipt
                mainWindow.webContents.send('new-mobile-receipt', newReceipt);
            }
            res.json({ success: true });
        } catch (e) {
            console.error("Failed to queue mobile receipt", e);
            res.status(500).json({ error: 'Failed to queue receipt' });
        }
    });

    server = apiApp.listen(3000, '0.0.0.0', () => {
        console.log('API server started on port 3000');
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error('CRITICAL: Port 3000 is already in use. The API server could not start. Please close other instances of Whiz POS.');
            // We can't exit the whole app as the user might want to use it offline, but we should alert
            // For now, logging to console which might be seen in DevTools
        } else {
            console.error('API Server error:', err);
        }
    });
}

app.whenReady().then(async () => {
  await ensureAppDirs();
  await ensureDataFilesExist();
  await initApiKey(); // Init and persist API Key
  startApiServer();

  // Register a custom protocol to serve images from the assets directory
  protocol.registerFileProtocol('local-asset', (request, callback) => {
    const url = request.url.substr(14); // Remove 'local-asset://'
    const filePath = path.join(productImagesPath, url);
    callback({ path: path.normalize(filePath) });
  });

  createWindow();

  /**
   * IPC Handler: 'save-image'
   * Saves an image from a temporary path to the application's persistent storage.
   *
   * @param {Electron.IpcMainInvokeEvent} event
   * @param {string} tempPath - The path to the temporary image file.
   * @returns {Promise<{success: boolean, path?: string, fileName?: string, error?: string}>}
   */
  ipcMain.handle('save-image', async (event, tempPath) => {
    if (!tempPath || typeof tempPath !== 'string') {
      console.error('Invalid or missing tempPath for save-image');
      return { success: false, error: 'Invalid or missing file path' };
    }
    try {
      // Decode URL if it was passed as a file:// URL
      let sourcePath = tempPath;
      if (sourcePath.startsWith('file://')) {
          sourcePath = decodeURIComponent(sourcePath.replace('file://', ''));
          // On Windows, remove leading slash if present (e.g., /C:/...)
          if (process.platform === 'win32' && sourcePath.startsWith('/') && sourcePath.includes(':')) {
              sourcePath = sourcePath.substring(1);
          }
      }

      // If the path is just a filename (no directory separators), assume it's already in the product images folder
      // This happens if the user tries to "re-save" an image that is already local-asset://...
      if (!sourcePath.includes(path.sep) && !sourcePath.includes('/')) {
         const existingPath = path.join(productImagesPath, sourcePath);
         try {
             await fs.access(existingPath);
             return { success: true, path: existingPath, fileName: sourcePath };
         } catch (e) {
             // Not found, proceed to fail
         }
      }

      // Verify source file exists
      try {
          await fs.access(sourcePath);
      } catch (e) {
          console.error(`Source image not found at: ${sourcePath}`);
          return { success: false, error: `Source image not found: ${sourcePath}` };
      }

      const fileName = `${Date.now()}-${path.basename(sourcePath)}`;
      const permanentPath = path.join(productImagesPath, fileName);
      await fs.copyFile(sourcePath, permanentPath);
      return { success: true, path: permanentPath, fileName: fileName };
    } catch (error) {
      console.error('Failed to save image:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: 'save-data'
   * Writes JSON data to a file in the user data directory.
   *
   * @param {Electron.IpcMainInvokeEvent} event
   * @param {string} fileName - The name of the file to save.
   * @param {any} data - The data to serialize and save.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  ipcMain.handle('save-data', async (event, fileName, data) => {
    try {
      const filePath = path.join(userDataPath, fileName);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return { success: true };
    } catch (error) {
      console.error(`Failed to save data to ${fileName}:`, error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: 'read-data'
   * Reads JSON data from a file in the user data directory.
   * If the file is missing, attempts to seed it from default data.
   *
   * @param {Electron.IpcMainInvokeEvent} event
   * @param {string} fileName - The name of the file to read.
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  ipcMain.handle('read-data', async (event, fileName) => {
    const filePath = path.join(userDataPath, fileName);
    try {
      // Always try to read from the userData path first.
      const data = await fs.readFile(filePath, 'utf-8');
      return { success: true, data: JSON.parse(data) };
    } catch (error) {
      if (error.code === 'ENOENT') {
        // If the file doesn't exist in userData, *then* try to seed it from default assets
        try {
          let seedPath;
          if (app.isPackaged) {
             seedPath = path.join(app.getAppPath(), 'data', fileName);
             try { await fs.access(seedPath); }
             catch { seedPath = path.join(process.resourcesPath, 'data', fileName); }
          } else {
             seedPath = path.join(__dirname, 'public', 'data', fileName);
          }

          const seedData = await fs.readFile(seedPath, 'utf-8');
          await fs.writeFile(filePath, seedData); // Copy seed data to userData path
          return { success: true, data: JSON.parse(seedData) };
        } catch (seedError) {
          return { success: true, data: null };
        }
      }
      console.error(`Failed to read data from ${fileName}:`, error);
      return { success: false, error: error.message };
    }
  });

  // --- Printer Management Handlers ---

  ipcMain.handle('get-printers', async () => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      return await mainWindow.webContents.getPrintersAsync();
    }
    return [];
  });

  ipcMain.handle('save-printer-settings', async (event, settings) => {
    store.set('printerSettings', settings);
    return { success: true };
  });

  ipcMain.handle('get-printer-settings', async () => {
    return store.get('printerSettings', { defaultPrinter: '' });
  });

  ipcMain.handle('toggle-fullscreen', () => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  ipcMain.handle('get-connected-devices', () => {
      // Return array of connected devices (active in last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      if (!global.connectedDevicesMap) return [];

      const devices = [];
      for (const [ip, device] of global.connectedDevicesMap.entries()) {
          if (new Date(device.lastSeen) > oneHourAgo) {
              devices.push(device);
          }
      }
      return devices;
  });

  // --- Logs ---
  ipcMain.handle('get-logs', async () => {
      try {
          const content = await fs.readFile(logFilePath, 'utf-8');
          // Filter last 48 hours
          const lines = content.split('\n');
          const now = new Date();
          const filteredLines = lines.filter(line => {
              const match = line.match(/^\[(.*?)\]/);
              if (match && match[1]) {
                  const logTime = new Date(match[1]);
                  const hoursDiff = (now - logTime) / (1000 * 60 * 60);
                  return hoursDiff <= 48;
              }
              return false; // Filter out malformed lines or empty lines
          });
          return filteredLines.join('\n');
      } catch (e) {
          return ''; // Return empty if file missing or error
      }
  });

  // --- Developer & Direct DB Sync ---

  ipcMain.handle('backup-data', async () => {
    try {
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Save Backup',
            defaultPath: `whiz-pos-backup-${new Date().toISOString().split('T')[0]}.json`,
            filters: [{ name: 'JSON Backup', extensions: ['json'] }]
        });

        if (canceled || !filePath) return { success: false, error: 'Cancelled' };

        const files = [
            'business-setup.json', 'products.json', 'users.json', 'transactions.json',
            'expenses.json', 'salaries.json', 'credit-customers.json', 'server-config.json',
            'credit-payments.json', 'inventory-logs.json'
        ];

        const backupData = {
            timestamp: new Date().toISOString(),
            version: '5.2.0',
            data: {}
        };

        for (const file of files) {
            try {
                const content = await fs.readFile(path.join(userDataPath, file), 'utf-8');
                backupData.data[file] = JSON.parse(content);
            } catch (e) {
                // Ignore missing files
            }
        }

        await fs.writeFile(filePath, JSON.stringify(backupData, null, 2));
        return { success: true, filePath };
    } catch (e) {
        console.error("Backup failed", e);
        return { success: false, error: e.message };
    }
  });

  ipcMain.handle('restore-data', async () => {
      try {
          const { canceled, filePaths } = await dialog.showOpenDialog({
              title: 'Select Backup File',
              properties: ['openFile'],
              filters: [{ name: 'JSON Backup', extensions: ['json'] }]
          });

          if (canceled || filePaths.length === 0) return { success: false, error: 'Cancelled' };

          const backupContent = await fs.readFile(filePaths[0], 'utf-8');
          const backup = JSON.parse(backupContent);

          if (!backup.data) throw new Error("Invalid backup file format");

          // Restore files
          for (const [filename, content] of Object.entries(backup.data)) {
              await fs.writeFile(path.join(userDataPath, filename), JSON.stringify(content, null, 2));
          }

          // Reload window to apply changes
          const mainWindow = BrowserWindow.getAllWindows()[0];
          if (mainWindow) mainWindow.reload();

          return { success: true };
      } catch (e) {
          console.error("Restore failed", e);
          return { success: false, error: e.message };
      }
  });

  ipcMain.handle('get-developer-config', async () => {
      try {
          const configPath = path.join(userDataPath, 'server-config.json');
          const data = await fs.readFile(configPath, 'utf-8');
          const config = JSON.parse(data);
          return {
              developerPin: config.developerPin || null,
              mongoUri: config.mongoUri || '',
              backOfficeUrl: config.backOfficeUrl || '',
              backOfficeApiKey: config.backOfficeApiKey || ''
          };
      } catch (e) {
          return { developerPin: null, mongoUri: '', backOfficeUrl: '', backOfficeApiKey: '' };
      }
  });

  ipcMain.handle('save-developer-config', async (event, newConfig) => {
      try {
          const configPath = path.join(userDataPath, 'server-config.json');
          let currentConfig = {};
          try {
              const data = await fs.readFile(configPath, 'utf-8');
              currentConfig = JSON.parse(data);
          } catch (e) {}

          const updatedConfig = { ...currentConfig, ...newConfig };
          await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2));
          return { success: true };
      } catch (e) {
          console.error("Failed to save developer config", e);
          return { success: false, error: e.message };
      }
  });

  ipcMain.handle('direct-db-push', async (event, mongoUri) => {
      if (!mongoUri) return { success: false, error: 'MongoDB URI is missing' };

      let client;
      try {
          client = new MongoClient(mongoUri);
          await client.connect();
          const db = client.db(); // Uses db name from URI

          // Read local data
          const [products, users, expenses, salaries, transactions, creditCustomers] = await Promise.all([
              readJsonFile('products.json'),
              readJsonFile('users.json'),
              readJsonFile('expenses.json'),
              readJsonFile('salaries.json'),
              readJsonFile('transactions.json'),
              readJsonFile('credit-customers.json')
          ]);

          // Sync Products (Collection: products)
          if (products.length > 0) {
              const ops = products.map(p => {
                  const product = { ...p };
                  delete product._id; // Strip _id
                  if (product.price) product.price = Number(product.price);
                  if (product.cost) product.cost = Number(product.cost);
                  if (product.stock) product.stock = Number(product.stock);
                  if (product.minStock) product.minStock = Number(product.minStock);
                  return {
                      updateOne: {
                          filter: { productId: p.productId },
                          update: { $set: product },
                          upsert: true
                      }
                  };
              });
              await db.collection('products').bulkWrite(ops);
          }

          // Sync Users (Collection: users)
          if (users.length > 0) {
              const ops = users.map(u => {
                  const user = { ...u, userId: u.id };
                  delete user._id; // Strip _id
                  if (user.createdAt) user.createdAt = new Date(user.createdAt);
                  return {
                      updateOne: {
                          filter: { userId: u.id },
                          update: { $set: user },
                          upsert: true
                      }
                  };
              });
              await db.collection('users').bulkWrite(ops);
          }

          // Sync Expenses (Collection: expenses)
          if (expenses.length > 0) {
            const ops = expenses.map(e => {
                const expense = { ...e };
                delete expense._id; // Strip _id
                if (expense.cashier && !expense.recordedBy) {
                    expense.recordedBy = expense.cashier;
                }
                if (expense.amount) expense.amount = Number(expense.amount);
                if (expense.timestamp) expense.timestamp = new Date(expense.timestamp);
                if (expense.date) expense.date = new Date(expense.date);
                return {
                    updateOne: {
                        filter: { expenseId: e.expenseId || e.id },
                        update: { $set: expense },
                        upsert: true
                    }
                };
            });
            await db.collection('expenses').bulkWrite(ops);
          }

          // Sync Salaries (Collection: salaries)
          if (salaries.length > 0) {
            const ops = salaries.map(s => {
                const salary = { ...s };
                delete salary._id; // Strip _id
                if (salary.amount) salary.amount = Number(salary.amount);
                if (salary.date) salary.date = new Date(salary.date);
                return {
                    updateOne: {
                        filter: { salaryId: s.salaryId || s.id },
                        update: { $set: salary },
                        upsert: true
                    }
                };
            });
            await db.collection('salaries').bulkWrite(ops);
          }

          // Sync Transactions (Collection: transactions)
          if (transactions.length > 0) {
              const ops = transactions.map(t => {
                  const transaction = { ...t, transactionId: t.id };
                  delete transaction._id; // Strip _id

                  if (transaction.total !== undefined) {
                      transaction.totalAmount = Number(transaction.total);
                  }

                  if (transaction.tax) transaction.tax = Number(transaction.tax);
                  if (transaction.subtotal) transaction.subtotal = Number(transaction.subtotal);
                  if (transaction.timestamp) transaction.timestamp = new Date(transaction.timestamp);

                  if (transaction.items && Array.isArray(transaction.items)) {
                      transaction.items = transaction.items.map(i => {
                          if (i.product && i.product.id) {
                              return {
                                  productId: String(i.product.id),
                                  name: i.product.name,
                                  quantity: Number(i.quantity),
                                  price: Number(i.product.price)
                              };
                          }
                          if (i.id && !i.productId) {
                               return {
                                   ...i,
                                   productId: String(i.id),
                                   price: Number(i.price),
                                   quantity: Number(i.quantity)
                               };
                          }
                          return i;
                      });
                  }

                  return {
                      updateOne: {
                          filter: { transactionId: t.id },
                          update: { $set: transaction },
                          upsert: true
                      }
                  };
              });
              await db.collection('transactions').bulkWrite(ops);
          }

          // Sync Customers (Collection: customers)
          if (creditCustomers.length > 0) {
              const ops = creditCustomers.map(c => {
                  const customer = { ...c, customerId: c.id };
                  delete customer._id; // Strip _id
                  if (customer.limit) customer.limit = Number(customer.limit);
                  if (customer.balance) customer.balance = Number(customer.balance);
                  if (customer.loyaltyPoints) customer.loyaltyPoints = Number(customer.loyaltyPoints);
                  return {
                      updateOne: {
                          filter: { customerId: c.id },
                          update: { $set: customer },
                          upsert: true
                      }
                  };
              });
              await db.collection('customers').bulkWrite(ops);
          }

          return { success: true };
      } catch (e) {
          console.error("Direct DB Sync Failed", e);
          return { success: false, error: e.message };
      } finally {
          if (client) await client.close();
      }
  });

  ipcMain.handle('direct-db-pull', async (event, mongoUri) => {
    if (!mongoUri) return { success: false, error: 'MongoDB URI is missing' };

    let client;
    try {
        client = new MongoClient(mongoUri);
        await client.connect();
        const db = client.db();

        // 1. Fetch Products
        const productsRaw = await db.collection('products').find({}).toArray();
        const products = productsRaw.map(p => {
             // Clean up _id and ensure desktop compatibility
             const { _id, ...rest } = p;
             return { ...rest, id: rest.productId ? Number(rest.productId) : rest.id };
        });

        // 2. Fetch Users
        const usersRaw = await db.collection('users').find({}).toArray();
        const users = usersRaw.map(u => {
            const { _id, ...rest } = u;
            return { ...rest, id: rest.userId || rest.id };
        });

        // 3. Fetch Expenses
        const expensesRaw = await db.collection('expenses').find({}).sort({ date: -1 }).limit(100).toArray();
        const expenses = expensesRaw.map(e => {
            const { _id, ...rest } = e;
            // Map back to desktop fields
            return {
                ...rest,
                id: rest.expenseId || rest.id,
                cashier: rest.recordedBy || rest.cashier
            };
        });

        // 4. Fetch Salaries
        const salariesRaw = await db.collection('salaries').find({}).sort({ date: -1 }).limit(100).toArray();
        const salaries = salariesRaw.map(s => {
            const { _id, ...rest } = s;
            return { ...rest, id: rest.salaryId || rest.id };
        });

        // 5. Fetch Credit Customers
        const customersRaw = await db.collection('customers').find({}).toArray();
        const creditCustomers = customersRaw.map(c => {
            const { _id, ...rest } = c;
            return { ...rest, id: rest.customerId || rest.id };
        });

        // 6. Fetch Business Setup (Assuming stored in 'settings' or similar, but for now relying on local persistence primarily or sync API if needed.
        // If business settings are in Mongo, fetch them. Based on `BusinessSettings.js`, likely collection is 'businesssettings' or 'settings'
        // But the model name is BusinessSettings -> collection: businesssettings (by Mongoose default)
        // Let's check for it.
        let businessSetup = null;
        try {
            const settingsRaw = await db.collection('businesssettings').findOne({});
            if (settingsRaw) {
                 const { _id, ...rest } = settingsRaw;
                 businessSetup = rest;
            }
        } catch(e) { console.log("No remote settings found"); }


        return {
            success: true,
            data: {
                products,
                users,
                expenses,
                salaries,
                creditCustomers,
                businessSetup
            }
        };

    } catch (e) {
        console.error("Direct DB Pull Failed", e);
        return { success: false, error: e.message };
    } finally {
        if (client) await client.close();
    }
  });

  // --- Printing Logic ---
  /**
   * Creates a hidden BrowserWindow to render HTML content and triggers the print dialog.
   *
   * @param {string} htmlContent - The HTML string to print.
   * @param {Object} options - Electron print options.
   */
  const printHtml = async (htmlContent, options = {}) => {
    const printWindow = new BrowserWindow({ show: false, webPreferences: { contextIsolation: false, nodeIntegration: true } });

    // Check for saved printer preferences
    const printerSettings = store.get('printerSettings', {});
    if (printerSettings.defaultPrinter) {
        options.deviceName = printerSettings.defaultPrinter;
        options.silent = true; // Skip dialog if a printer is explicitly set
    }

    printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    printWindow.webContents.on('did-finish-load', () => {
        // Force margins to 0 for better fit on thermal printers
        // Unless specific margins were passed in options, we override them to 0
        const printOptions = {
             margins: { marginType: 'custom', top: 0, bottom: 0, left: 0, right: 0 },
             ...options
        };

        printWindow.webContents.print(printOptions, (success, errorType) => {
            if (!success) console.error('Print failed:', errorType);
            else console.log('Print job sent successfully');
            printWindow.close();
        });
    });
  };

  /**
   * IPC Listener: 'print-receipt'
   * Generates and prints a transaction receipt.
   */
  ipcMain.on('print-receipt', async (event, transaction, businessSetup, isReprint = false) => {
      const htmlContent = await generateReceipt(transaction, businessSetup, isReprint);
      printHtml(htmlContent);
  });

  /**
   * IPC Listener: 'print-receipt-from-api'
   * Generates and prints a receipt requested via the local API (e.g., from Mobile App).
   */
  ipcMain.on('print-receipt-from-api', async (event, transaction, businessSetup) => {
      const htmlContent = await generateReceipt(transaction, businessSetup, true);
      printHtml(htmlContent);
  });

  /**
   * IPC Listener: 'print-business-setup'
   * Generates and prints the initial business setup invoice.
   */
  ipcMain.on('print-business-setup', async (event, businessSetup, adminUser) => {
      const htmlContent = await generateBusinessSetup(businessSetup, adminUser);
      printHtml(htmlContent, { copies: 2 });
  });

  /**
   * IPC Listener: 'print-closing-report'
   * Generates and prints the daily closing report.
   * Now supports 'detailed' flag.
   */
  ipcMain.on('print-closing-report', async (event, reportData, businessSetup, detailed = true) => {
      const htmlContent = await generateClosingReport(reportData, businessSetup, detailed);
      printHtml(htmlContent);
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // --- Auto Updater ---

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });
  autoUpdater.on('update-available', (info) => {
     console.log('Update available.', info);
     const mainWindow = BrowserWindow.getAllWindows()[0];
     if (mainWindow) mainWindow.webContents.send('update-available', info);
  });
  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available.', info);
  });
  autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater. ' + err);
  });
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
  });
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded');
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) mainWindow.webContents.send('update-downloaded', info);
  });

  ipcMain.on('check-for-update', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  // Check for updates immediately on startup
  autoUpdater.checkForUpdatesAndNotify();

  // Background check loop (every hour)
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 1000 * 60 * 60);

  ipcMain.on('download-update', () => {
    // electron-updater downloads automatically if autoDownload is true (default)
    // but if we set it to false, we can call downloadUpdate() here.
    // For now, checkForUpdatesAndNotify handles it.
  });
});

/**
 * IPC Handler: 'get-api-config'
 * Retrieves or generates the API Key and connection details for the local API server.
 * Returns a QR code data URL for easy mobile connection.
 *
 * @returns {Promise<{apiKey: string, apiUrl: string, qrCodeDataUrl: string}>}
 */
ipcMain.handle('get-api-config', async () => {
    if (!apiKey) {
        // Should have been init'd, but just in case
        await initApiKey();
    }
    const ipAddress = getLocalIpAddress();
    const address = server ? server.address() : null;
    const port = (address && typeof address === 'object' && address.port) ? address.port : 3000;
    const config = {
        apiKey,
        apiUrl: `http://${ipAddress}:${port}`
    };
    const qrCodeDataUrl = await qrcode.toDataURL(JSON.stringify(config));
    return { ...config, qrCodeDataUrl };
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if(server) server.close();
    app.quit();
  }
});
