import { test, expect } from '@playwright/test';

test('Verify Multi-Outlet Setup Wizard', async ({ page }) => {
  // Clear localStorage to force setup wizard
  await page.goto('http://localhost:5173');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // Wait for loading to finish
  await page.waitForSelector('text=Loading WHIZ POS...', { state: 'hidden', timeout: 30000 });

  // 1. Welcome Screen
  await expect(page.locator('text=Welcome to Whiz POS')).toBeVisible();
  await page.screenshot({ path: 'verification/wizard_1_welcome.png' });
  await page.click('text=Begin Setup');

  // 2. Mode Selection
  await expect(page.locator('text=Select Operation Mode')).toBeVisible();
  await expect(page.locator('text=Main Server')).toBeVisible();
  await expect(page.locator('text=Outlet Terminal')).toBeVisible();
  await page.screenshot({ path: 'verification/wizard_2_mode.png' });

  // Select Server Mode
  await page.click('text=Main Server');
  await page.click('text=Next Step');

  // 3. Business Info
  await expect(page.locator('text=Business Information')).toBeVisible();
  await page.fill('input[placeholder="Enter business name"]', 'Whiz Test Server');
  await page.screenshot({ path: 'verification/wizard_3_info.png' });
  await page.click('text=Next Step');

  // 4. Admin Setup
  await expect(page.locator('text=Create Admin Account')).toBeVisible();
  await page.fill('input[placeholder="Admin Name"]', 'Super Admin');
  await page.fill('input[placeholder="4-Digit PIN"]', '1234');
  await page.screenshot({ path: 'verification/wizard_4_admin.png' });
  await page.click('text=Complete Setup');

  // 5. Success
  await expect(page.locator('text=Setup Complete!')).toBeVisible();
  await page.screenshot({ path: 'verification/wizard_5_success.png' });

  // Launch Application
  await page.click('text=Launch Application');

  // Should be at Login Screen
  await expect(page.locator('text=WHIZ TEST SERVER')).toBeVisible();
  await page.screenshot({ path: 'verification/login_final.png' });
});
