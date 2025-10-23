import { app, BrowserWindow } from 'electron';
import path from 'path';

// This function creates the main application window.
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/main.js'), // We will create this file later
      sandbox: false,
    },
  });

  // Load the Svelte UI.
  // In development, this will be a URL provided by Vite.
  // In production, it will be a local HTML file.
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Open the DevTools in development.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

// This method is called when Electron has finished initialization.
app.whenReady().then(() => {
  createWindow();

  // On macOS, it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
