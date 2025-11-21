// src/electronApiMock.ts

/**
 * Mocks the Electron `window.electron` API for browser-based testing (Playwright).
 * This allows the Zustand store to "load" data from the public folder by fetching it,
 * mimicking the behavior of the Electron main process reading files from disk.
 *
 * @returns {void}
 */
export const setupElectronMock = () => {
  if (process.env.NODE_ENV === 'development' && !window.electron) {
    console.log('Setting up mock Electron API for browser environment.');

    window.electron = {
      /**
       * Mock save data. Logs to console.
       * @param {string} fileName - File name.
       * @param {any} data - Data to save.
       * @returns {Promise<{success: boolean}>} Success result.
       */
      saveData: async (fileName, data) => {
        console.log(`[Mock] saveData(${fileName}):`, data);
        return { success: true };
      },
      /**
       * Mock read data. Fetches from /data/ directory in public folder.
       * @param {string} fileName - File name.
       * @returns {Promise<{success: boolean, data?: any}>} The mock data.
       */
      readData: async (fileName) => {
        try {
          const response = await fetch(`/data/${fileName}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch mock data: ${fileName}`);
          }
          const data = await response.json();
          console.log(`[Mock] readData(${fileName}):`, data);
          return { success: true, data };
        } catch (error) {
          console.error(`[Mock] Error reading data ${fileName}:`, error);
          // Return success:true with undefined data to mimic file-not-found scenario without breaking the app
          return { success: true, data: undefined };
        }
      },
      /**
       * Mock print receipt. Logs to console.
       */
      printReceipt: (transaction, businessSetup, isReprint) => {
        console.log('[Mock] printReceipt:', { transaction, businessSetup, isReprint });
      },
      /**
       * Mock save image. Returns a mock path.
       * @param {string} tempPath - The path.
       * @returns {Promise<{success: boolean, path: string, fileName: string}>}
       */
      saveImage: async (tempPath) => {
        console.log('[Mock] saveImage:', tempPath);
        return { success: true, path: `mock/path/to/${tempPath}`, fileName: tempPath };
      },
      /**
       * Mock print closing report. Logs to console.
       */
      printClosingReport: (reportData, businessSetup) => {
        console.log('[Mock] printClosingReport:', { reportData, businessSetup });
      },
      /**
       * Mock print business setup. Logs to console.
       */
      printBusinessSetup: (businessSetup, adminUser) => {
        console.log('[Mock] printBusinessSetup:', { businessSetup, adminUser });
      },
      /**
       * Mock get API config. Returns hardcoded mock values.
       * @returns {Promise<{apiUrl: string, apiKey: string, qrCodeDataUrl: string}>}
       */
      getApiConfig: async () => {
        console.log('[Mock] getApiConfig');
        return {
          apiUrl: 'http://localhost:3001/api',
          apiKey: 'mock-api-key',
          qrCodeDataUrl: 'mock-qr-code-data-url',
        };
      },
      /**
       * Mock upload image. Returns a placeholder URL.
       * @param {string} filePath
       * @param {string} apiUrl
       * @param {string} apiKey
       * @returns {Promise<{imageUrl: string}>}
       */
      uploadImage: async (filePath, apiUrl, apiKey) => {
        console.log('[Mock] uploadImage:', { filePath, apiUrl, apiKey });
        // Return a placeholder image URL for browser-based testing
        return { imageUrl: 'https://via.placeholder.com/150' };
      },
      /**
       * Mock get printers. Returns an empty list.
       * @returns {Promise<any[]>}
       */
      getPrinters: async () => {
        console.log('[Mock] getPrinters');
        return [];
      },
    };
  }
};
