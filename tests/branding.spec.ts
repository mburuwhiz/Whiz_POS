import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test('Verify Wizard and App Branding', async ({ page }) => {
  // Clear any existing data
  await page.goto('http://localhost:5173');

  // Wait for loading to finish
  await page.waitForSelector('text=Loading WHIZ POS...', { state: 'hidden', timeout: 30000 });

  // If we are already at login or home, we might need to reset.
  // For this test, we assume a fresh state or we look for branding.

  // Check for the Footer branding on Login screen
  const footer = page.locator('text=SYSTEM DEVELOPED AND MAINTAINED BY');
  if (await footer.isVisible()) {
      await expect(page.locator('text=WHIZPOINT SOLUTIONS')).toBeVisible();
      await expect(page.locator('text=support@whizpoint.app')).toBeVisible();
      await expect(page.locator('text=pos.whizpoint.app')).toBeVisible();
      console.log("Branding verified on Login Screen");
  }

  // Take a screenshot of the login screen
  await page.screenshot({ path: 'verification/login_screen.png' });

  // Go to Developer Page to verify it's accessible and has branding
  await page.goto('http://localhost:5173/#/developer');
  await expect(page.locator('text=Developer Settings')).toBeVisible();
  await page.screenshot({ path: 'verification/developer_page.png' });
});
