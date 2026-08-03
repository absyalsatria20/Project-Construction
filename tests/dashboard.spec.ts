import { test, expect } from '@playwright/test';
import { doLogin } from './helpers';

test.describe('Dashboard Feature - Console Errors', () => {
  test('should not have console errors during load', async ({ page }) => {
    test.setTimeout(60000);
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    await doLogin(page);
    expect(consoleErrors.filter(err => !err.includes('favicon.ico'))).toEqual([]);
  });
});

test.describe('Dashboard Feature', () => {
  test.beforeEach(async ({ page }) => {
    await doLogin(page);
  });

  test('should display metric cards and stats', async ({ page }) => {
    await expect(page.locator('text=Total Dana Masuk')).toBeVisible();
    await expect(page.locator('text=Total Pengeluaran')).toBeVisible();
    await expect(page.locator('text=Saldo Saat Ini')).toBeVisible();
    await expect(page.locator('text=Invoice Belum Lunas')).toBeVisible();
    await expect(page.locator('text=Progress Material')).toBeVisible();
    await expect(page.locator('text=Quick Actions')).toBeVisible();
  });

  test('should contain charts section and recent activity', async ({ page }) => {
    await expect(page.locator('text=Pengeluaran per Kategori')).toBeVisible();
    await expect(page.locator('text=Aktivitas Cashflow Terbaru')).toBeVisible();
  });
});
