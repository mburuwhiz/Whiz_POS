const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script executed');

/**
 * Exposes secure API methods to the renderer process via the `window.electron` object.
 * These methods handle filesystem operations, printing, and API configuration.
 */
contextBridge.exposeInMainWorld('electron', {
  /**
   * Saves data to a JSON file in the persistent user data directory.
   *
   * @param {string} fileName - The name of the file (e.g., 'products.json').
   * @param {any} data - The data to be saved.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  saveData: (fileName, data) => ipcRenderer.invoke('save-data', fileName, data),

  /**
   * Reads data from a JSON file in the persistent user data directory.
   *
   * @param {string} fileName - The name of the file to read.
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  readData: (fileName) => ipcRenderer.invoke('read-data', fileName),

  /**
   * Triggers a receipt print job.
   *
   * @param {Object} transaction - The transaction object.
   * @param {Object} businessSetup - The business configuration object.
   * @param {boolean} isReprint - Whether this is a reprint operation.
   * @returns {void}
   */
  printReceipt: (transaction, businessSetup, isReprint) => ipcRenderer.send('print-receipt', transaction, businessSetup, isReprint),

  /**
   * Saves a temporary image file to permanent storage.
   *
   * @param {string} tempPath - The path of the temporary file.
   * @returns {Promise<{success: boolean, path?: string, fileName?: string}>}
   */
  saveImage: (tempPath) => ipcRenderer.invoke('save-image', tempPath),

  /**
   * Triggers a closing report print job.
   *
   * @param {Object} reportData - The aggregated closing report data.
   * @param {Object} businessSetup - The business configuration object.
   * @returns {void}
   */
  printClosingReport: (reportData, businessSetup) => ipcRenderer.send('print-closing-report', reportData, businessSetup),

  /**
   * Retrieves a list of available system printers.
   *
   * @returns {Promise<Electron.PrinterInfo[]>}
   */
  getPrinters: () => ipcRenderer.invoke('get-printers'),

  /**
   * Retrieves the current API configuration (Key and URL).
   *
   * @returns {Promise<{apiKey: string, apiUrl: string, qrCodeDataUrl: string}>}
   */
  getApiConfig: () => ipcRenderer.invoke('get-api-config'),

  /**
   * Uploads an image to the back-office API.
   * Uses `node-fetch` and `form-data` directly from the preload context (Node.js enabled).
   *
   * @param {string} filePath - The local path of the image file.
   * @param {string} apiUrl - The base URL of the API.
   * @param {string} apiKey - The authentication key.
   * @returns {Promise<any>} The JSON response from the server.
   * @throws {Error} If the upload fails.
   */
  uploadImage: async (filePath, apiUrl, apiKey) => {
    const fetch = require('node-fetch');
    const fs = require('fs');
    const FormData = require('form-data');
    const path = require('path');

    const form = new FormData();
    form.append('image', fs.createReadStream(filePath), {
      filename: path.basename(filePath)
    });

    const response = await fetch(`${apiUrl}/api/upload`, {
      method: 'POST',
      body: form,
      headers: {
        'x-api-key': apiKey,
        ...form.getHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.statusText}`);
    }

    return await response.json();
  },
});
