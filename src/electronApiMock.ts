// src/electronApiMock.ts

/**
 * Mocks the Electron `window.electron` API for browser-based testing (Playwright).
 * This mock is configured to simulate a clean-slate environment where no data files exist.
 * It immediately returns `undefined` data to allow the app to proceed to the registration screen.
 */
export const setupElectronMock = () => {
  if (process.env.NODE_ENV === 'development' && !window.electron) {
    console.log('Setting up mock Electron API for a clean-slate browser environment.');

    window.electron = {
      saveData: async (fileName, data) => {
        console.log(`[Mock] saveData(${fileName}):`, data);
        return { success: true };
      },
      // This is the key change: always return undefined data to simulate no files found.
      readData: async (fileName) => {
        console.log(`[Mock] readData(${fileName}): Simulating file not found.`);
        // Add a small delay to prevent race conditions in the test environment.
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true, data: undefined };
      },
      printReceipt: (transaction, businessSetup, isReprint) => {
        console.log('[Mock] printReceipt:', { transaction, businessSetup, isReprint });
      },
      saveImage: async (tempPath) => {
        console.log('[Mock] saveImage:', tempPath);
        return { success: true, path: `mock/path/to/${tempPath}`, fileName: tempPath };
      },
      printClosingReport: (reportData, businessSetup) => {
        console.log('[Mock] printClosingReport:', { reportData, businessSetup });
      },
      printBusinessSetup: (businessSetup, adminUser) => {
        console.log('[Mock] printBusinessSetup:', { businessSetup, adminUser });
      },
      getApiConfig: async () => {
        console.log('[Mock] getApiConfig');
        return {
          apiUrl: 'http://localhost:3001/api',
          apiKey: 'mock-api-key',
          qrCodeDataUrl: 'mock-qr-code-data-url',
        };
      },
      uploadImage: async (filePath, apiUrl, apiKey) => {
        console.log('[Mock] uploadImage:', { filePath, apiUrl, apiKey });
        return { imageUrl: 'https://via.placeholder.com/150' };
      },
    };
  }
};
