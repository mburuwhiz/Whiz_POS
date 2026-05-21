
import { test, expect } from '@playwright/test';
import fs from 'fs';

test('verify server dashboard and approval ui', async ({ page }) => {
  // Inject server mode storage
  await page.addInitScript(() => {
    const businessSetup = {
      id: 'server-1',
      name: 'Central Hub',
      mode: 'server',
      isLoggedIn: true,
      outletId: 'main-server'
    };
    const users = [{ id: '1', name: 'Admin', pin: '1234', role: 'admin' }];
    localStorage.setItem('pos-storage', JSON.stringify({
      state: {
        businessSetup,
        users,
        currentCashier: users[0],
        pendingOutlets: [
          { id: 'outlet-1', name: 'Outlet A', ip: '192.168.1.10', requestedAt: new Date().toISOString() }
        ],
        approvedOutlets: []
      }
    }));
  });

  await page.goto('http://localhost:5174');

  // Verify Server Hub is visible
  await expect(page.getByText('Server Hub', { exact: true })).toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: 'verification/server_hub.png' });

  // Navigate to Manage Outlets
  await page.getByText('Manage Outlets').click();
  await expect(page.getByText('Registration Requests')).toBeVisible();
  await expect(page.getByText('Outlet A')).toBeVisible();
  await page.screenshot({ path: 'verification/approval_ui.png' });

  // Approve outlet
  await page.getByRole('button', { name: /approve/i }).first().click();
  await expect(page.getByText('Approved Terminals')).toBeVisible();
  await page.screenshot({ path: 'verification/approved_outlets.png' });
});

test('verify branding in login screen', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await expect(page.getByText('support@whizpoint.app')).toBeVisible();
  await expect(page.getByText('pos.whizpoint.app')).toBeVisible();
  await page.screenshot({ path: 'verification/branding_login.png' });
});
