const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script executed');

contextBridge.exposeInMainWorld('electron', {
  saveData: (fileName, data) => ipcRenderer.invoke('save-data', fileName, data),
  readData: (fileName) => ipcRenderer.invoke('read-data', fileName),
  printReceipt: (transaction, businessSetup, isReprint) => ipcRenderer.send('print-receipt', transaction, businessSetup, isReprint),
  saveImage: (tempPath) => ipcRenderer.invoke('save-image', tempPath),
  printClosingReport: (reportData, businessSetup) => ipcRenderer.send('print-closing-report', reportData, businessSetup),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  getApiConfig: () => ipcRenderer.invoke('get-api-config'),
  printBusinessSetup: (businessSetup, adminUser) => ipcRenderer.send('print-business-setup', businessSetup, adminUser),
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
