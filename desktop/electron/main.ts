import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fork, ChildProcess } from 'child_process';

let serverProcess: ChildProcess;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Vite dev server URL
  const viteDevServerURL = 'http://localhost:5173';

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(viteDevServerURL);
    // Open DevTools for debugging
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built HTML file
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function startServer() {
  const serverPath = app.isPackaged
    ? path.join(process.resourcesPath, 'server/main.js')
    : path.resolve(__dirname, '../../server/dist/main.js');

  console.log(`[Electron] Starting server at: ${serverPath}`);

  serverProcess = fork(serverPath, [], {
    stdio: 'inherit', // Pipe server's stdout/stderr to Electron's console
  });

  serverProcess.on('error', (err) => {
    console.error('[Electron] Failed to start server process.', err);
  });

  serverProcess.on('exit', (code) => {
    console.log(`[Electron] Server process exited with code ${code}`);
  });
}

app.whenReady().then(() => {
  if (process.env.NODE_ENV !== 'development') {
    startServer();
  }
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('[Electron] Stopping server process...');
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});

// For development, we don't start the server here because `npm run dev` in `desktop`
// is expected to be run alongside `npm run start:dev` in `server`.
// The production build, however, will manage the server process.
