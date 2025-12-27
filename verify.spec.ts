
import { test, expect } from '@playwright/test';

test('launch app and take screenshot', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshot.png' });
});
