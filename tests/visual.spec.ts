import { test, expect } from '@playwright/test';
import { doLogin } from './helpers';

test.describe('Visual Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    await doLogin(page);
  });

  test('Dashboard page snapshot', async ({ page }) => {
    await expect(page.locator('text=Total Dana Masuk')).toBeVisible();
    await expect(page).toHaveScreenshot('dashboard.png', { maxDiffPixelRatio: 0.05 });
  });

  test('Monitoring Material page snapshot', async ({ page }) => {
    await page.click('text=Monitoring Material');
    await expect(page.locator('text=Tambah Material')).toBeVisible();
    await expect(page).toHaveScreenshot('material.png', { maxDiffPixelRatio: 0.05 });
  });

  test('Rekap Pembayaran page snapshot', async ({ page }) => {
    await page.click('text=Rekap Pembayaran');
    await expect(page.locator('text=Create Invoice')).toBeVisible();
    await expect(page).toHaveScreenshot('payment.png', { maxDiffPixelRatio: 0.05 });
  });

  test('Cashflow page snapshot', async ({ page }) => {
    await page.click('text=Cashflow');
    await expect(page.locator('text=Input Transaksi')).toBeVisible();
    await expect(page).toHaveScreenshot('cashflow.png', { maxDiffPixelRatio: 0.05 });
  });
});
