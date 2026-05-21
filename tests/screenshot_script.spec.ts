import { test, expect } from '@playwright/test';

test.describe('Take screenshots', () => {
  const pagesToScreenshot = [
    { name: 'POS_Page', path: '#/' },
    { name: 'Closing', path: '#/closing' },
    { name: 'Credits', path: '#/credits' },
    { name: 'Loyalty', path: '#/loyalty' },
    { name: 'InvoiceGenerator', path: '#/invoice-generator' },
    { name: 'Reports', path: '#/reports' },
    { name: 'MobileReceipts', path: '#/mobile-receipts' },
    { name: 'Inventory', path: '#/inventory' },
    { name: 'Settings', path: '#/settings' },
  ];

  for (const { name, path } of pagesToScreenshot) {
    test(`Screenshot ${name}`, async ({ page }) => {
      // Navigate to the app URL
      await page.goto(`http://localhost:5174/${path}`);

      // Inject state to bypass login
      await page.evaluate(() => {
        localStorage.setItem('pos-storage', JSON.stringify({
          state: {
            businessSetup: {
              isSetup: true,
              isLoggedIn: true,
              businessName: 'Test Business',
            },
            isDataLoaded: true,
            currentCashier: {
              id: '1',
              name: 'Test Cashier',
              role: 'admin',
              pin: '1234'
            }
          },
          version: 1
        }));

        // Mock electron APIs needed for UI rendering
        (window as any).electron = {
          readData: async (fileName: string) => {
            if (fileName === 'business-setup.json') {
               return { success: true, data: {
                 isSetup: true,
                 isLoggedIn: true,
                 businessName: 'Test Business',
               } };
            }
            if (fileName === 'users.json') {
               return { success: true, data: [
                 { id: '1', name: 'Test Cashier', role: 'admin', pin: '1234' }
               ] };
            }
            return { success: true, data: [] };
          },
          saveData: async () => ({ success: true }),
          getApiConfig: async () => ({ apiUrl: '', apiKey: '' }),
          onMobileDataSync: () => {},
          onNewMobileReceipt: () => {},
          getConnectedDevices: async () => [],
        };
      });

      // Reload so the state is picked up
      await page.reload();

      // Wait a bit for everything to load and render
      await page.waitForTimeout(2000);

      // Take screenshot
      await page.screenshot({ path: `server_${name}.png` });
    });
  }
});
