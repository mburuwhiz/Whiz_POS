const fs = require('fs');
const path = require('path');

// Mock Electron
const mockIpcMain = {
    handle: (channel, listener) => {
        mockIpcMain.handlers[channel] = listener;
    },
    on: () => {},
    handlers: {}
};

const mockApp = {
    getPath: () => __dirname, // Use current dir for userData
    whenReady: () => Promise.resolve(),
    on: () => {},
    isPackaged: false,
    getVersion: () => '1.0.0',
    getName: () => 'WhizPOS',
    commandLine: { appendSwitch: () => {} }
};

const mockBrowserWindow = class {
    constructor() {
        this.webContents = { on: () => {}, send: () => {}, openDevTools: () => {} };
    }
    setMenu() {}
    loadURL() { return Promise.resolve(); }
    static getAllWindows() { return []; }
};

// Mock dependencies
const mockModule = require('module');
const originalRequire = mockModule.prototype.require;
mockModule.prototype.require = function(request) {
    if (request === 'electron') {
        return {
            app: mockApp,
            BrowserWindow: mockBrowserWindow,
            ipcMain: mockIpcMain,
            protocol: { registerFileProtocol: () => {} },
            dialog: { showSaveDialog: () => {}, showOpenDialog: () => {} }
        };
    }
    if (request === 'electron-store') {
        return class Store {
            get() { return {}; }
            set() {}
        };
    }
    return originalRequire.apply(this, arguments);
};

// Setup Data Environment
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Reset users.json
fs.writeFileSync(path.join(dataDir, 'users.json'), '[]');
fs.writeFileSync(path.join(dataDir, 'sessions.json'), '[]');
fs.writeFileSync(path.join(dataDir, 'server-config.json'), '{}');

// Load Electron Main Process
// We need to catch the "server started" log or similar to know it loaded
console.log("Loading electron.cjs...");
require('../electron.cjs');

// Helper wrapper
async function invoke(channel, ...args) {
    if (mockIpcMain.handlers[channel]) {
        return await mockIpcMain.handlers[channel]({}, ...args);
    }
    throw new Error(`Handler not found: ${channel}`);
}

async function test() {
    console.log("Starting Test: Add User WHIZ and Modify...");

    // 1. Add User WHIZ
    const newUser = {
        name: 'WHIZ',
        pin: '1234',
        role: 'admin',
        isActive: true
    };

    console.log("Adding User WHIZ...");
    const addResult = await invoke('user-add', newUser);
    if (!addResult.success) throw new Error(`Add failed: ${addResult.error}`);
    console.log("User Added.");

    // Verify File Persistence
    let users = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf-8'));
    let whizUser = users.find(u => u.name === 'WHIZ');
    if (!whizUser) throw new Error("WHIZ not found in users.json");
    if (whizUser.role !== 'admin') throw new Error("Incorrect role");
    console.log(`Verified persistence: ID=${whizUser.id}`);

    // 2. Modify User WHIZ
    console.log("Modifying User WHIZ (Role: admin -> manager)...");
    const updateResult = await invoke('user-update', whizUser.id, { role: 'manager' });
    if (!updateResult.success) throw new Error(`Update failed: ${updateResult.error}`);
    console.log("User Updated.");

    // Verify Persistence
    users = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf-8'));
    whizUser = users.find(u => u.id === whizUser.id);
    if (whizUser.role !== 'manager') throw new Error(`Update persistence failed. Role is ${whizUser.role}, expected manager`);

    // Check updatedAt
    if (!whizUser.updatedAt) throw new Error("updatedAt not set");
    console.log("Verified Update Persistence.");

    // 3. Test Legacy Block
    console.log("Testing Legacy Block...");
    const legacyResult = await invoke('save-data', 'users.json', []);
    if (legacyResult.success) throw new Error("Legacy save-data for users.json SHOULD FAIL");
    console.log("Legacy Block Confirmed.");

    console.log("TEST PASSED SUCCESSFULY");
    process.exit(0);
}

// Give electron.cjs a moment to init
setTimeout(test, 1000);
