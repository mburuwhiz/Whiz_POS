const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const express = require('express');
const qrcode = require('qrcode');
const crypto = require('crypto');
const os = require('os');
const { generateReceipt, generateClosingReport, generateBusinessSetup } = require(path.join(__dirname, 'print-jobs.cjs'));

// Define paths for storing user data and assets.
const userDataPath = path.join(app.getPath('userData'), 'data');
const productImagesPath = path.join(app.getPath('userData'), 'assets', 'product_images');

async function ensureAppDirs() {
  try {
    await fs.mkdir(userDataPath, { recursive: true });
    await fs.mkdir(productImagesPath, { recursive: true });
  } catch (error) {
    console.error('Failed to create application directories:', error);
  }
}

async function ensureDataFilesExist() {
  const dataFiles = {
    'business-setup.json': { isSetup: false },
    'users.json': [],
    'products.json': [],
    'transactions.json': [],
    'expenses.json': [],
    'credit-customers.json': [],
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

const loadUrlWithRetries = (win, url) => {
  win.loadURL(url).catch(() => {
    console.log('Vite server not ready, retrying in 2 seconds...');
    setTimeout(() => {
      loadUrlWithRetries(win, url);
    }, 2000);
  });
};

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

let apiKey = null;
let server = null;

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

function startApiServer() {
    const apiApp = express();
    apiApp.use(express.json());

    const authMiddleware = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    };

    apiApp.get('/api/status', (req, res) => {
        res.json({ status: 'ok' });
    });

    apiApp.get('/api/config', (req, res) => {
      if (!apiKey) {
        apiKey = crypto.randomBytes(32).toString('hex');
      }
      const ipAddress = getLocalIpAddress();
      const port = server.address().port;
      res.json({ apiKey, apiUrl: `http://${ipAddress}:${port}` });
    });

    apiApp.get('/api/products', authMiddleware, async (req, res) => {
        const productsPath = path.join(userDataPath, 'products.json');
        try {
            const data = await fs.readFile(productsPath, 'utf-8');
            res.json(JSON.parse(data));
        } catch (error) {
            res.status(500).json({ error: 'Failed to read products' });
        }
    });

    apiApp.post('/api/transactions', authMiddleware, async (req, res) => {
        const newTransaction = req.body;
        const transactionsPath = path.join(userDataPath, 'transactions.json');
        try {
            let transactions = [];
            try {
                const data = await fs.readFile(transactionsPath, 'utf-8');
                transactions = JSON.parse(data);
            } catch (readError) {
                // File might not exist yet, which is fine
            }
            transactions.unshift(newTransaction);
            await fs.writeFile(transactionsPath, JSON.stringify(transactions, null, 2));
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to save transaction' });
        }
    });

    apiApp.post('/api/print-receipt', authMiddleware, (req, res) => {
        const { transaction, businessSetup } = req.body;
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.webContents.send('print-receipt-from-api', transaction, businessSetup);
        res.json({ success: true });
    });

    server = apiApp.listen(3000, '0.0.0.0', () => {
        console.log('API server started on port 3000');
    });
}

app.whenReady().then(async () => {
  await ensureAppDirs();
  await ensureDataFilesExist();
  startApiServer();

  // Register a custom protocol to serve images from the assets directory
  protocol.registerFileProtocol('local-asset', (request, callback) => {
    const url = request.url.substr(14); // Remove 'local-asset://'
    const filePath = path.join(productImagesPath, url);
    callback({ path: path.normalize(filePath) });
  });

  createWindow();

  // IPC handler for saving an image
  ipcMain.handle('save-image', async (event, tempPath) => {
    if (!tempPath || typeof tempPath !== 'string') {
      console.error('Invalid or missing tempPath for save-image');
      return { success: false, error: 'Invalid or missing file path' };
    }
    try {
      const fileName = `${Date.now()}-${path.basename(tempPath)}`;
      const permanentPath = path.join(productImagesPath, fileName);
      await fs.copyFile(tempPath, permanentPath);
      return { success: true, path: permanentPath, fileName: fileName };
    } catch (error) {
      console.error('Failed to save image:', error);
      return { success: false, error: error.message };
    }
  });

  // IPC handler for saving data
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

  // IPC handler for reading data
  ipcMain.handle('read-data', async (event, fileName) => {
    const filePath = path.join(userDataPath, fileName);
    try {
      // Always try to read from the userData path first.
      const data = await fs.readFile(filePath, 'utf-8');
      return { success: true, data: JSON.parse(data) };
    } catch (error) {
      if (error.code === 'ENOENT') {
        // If the file doesn't exist in userData, *then* try to seed it from public.
        try {
          const seedPath = path.join(__dirname, 'public', 'data', fileName);
          const seedData = await fs.readFile(seedPath, 'utf-8');
          await fs.writeFile(filePath, seedData); // Copy seed data to userData path
          return { success: true, data: JSON.parse(seedData) };
        } catch (seedError) {
          // If there's no seed file, it's not a critical error.
          // The app should handle the absence of data.
          return { success: true, data: null };
        }
      }
      // For any other errors, log them.
      console.error(`Failed to read data from ${fileName}:`, error);
      return { success: false, error: error.message };
    }
  });

  // --- Printing Logic ---
  const printHtml = (htmlContent, options = {}) => {
    const printWindow = new BrowserWindow({ show: false, webPreferences: { contextIsolation: false, nodeIntegration: true } });

    printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    printWindow.webContents.on('did-finish-load', () => {
        printWindow.webContents.print(options, (success, errorType) => {
            if (!success) console.error('Print failed:', errorType);
            else console.log('Print job sent successfully');
            printWindow.close();
        });
    });
  };


  ipcMain.on('print-receipt', async (event, transaction, businessSetup, isReprint = false) => {
      const htmlContent = await generateReceipt(transaction, businessSetup, isReprint);
      printHtml(htmlContent);
  });

  ipcMain.on('print-receipt-from-api', async (event, transaction, businessSetup) => {
      const htmlContent = await generateReceipt(transaction, businessSetup, true);
      printHtml(htmlContent);
  });

  ipcMain.on('print-business-setup', async (event, businessSetup, adminUser) => {
      const htmlContent = await generateBusinessSetup(businessSetup, adminUser);
      printHtml(htmlContent, { copies: 2 });
  });

  ipcMain.on('print-closing-report', async (event, reportData, businessSetup) => {
      const htmlContent = await generateClosingReport(reportData, businessSetup);
      printHtml(htmlContent);
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.handle('get-api-config', async () => {
    if (!apiKey) {
        apiKey = crypto.randomBytes(32).toString('hex');
    }
    const ipAddress = getLocalIpAddress();
    const port = server.address().port;
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
