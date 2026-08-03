import { test, expect } from '@playwright/test';
import { doLogin } from './helpers';

test.describe('UI Interactive Elements', () => {
  test.beforeEach(async ({ page }) => {
    await doLogin(page);
  });

  test('Sidebar Desktop collapsible toggle', async ({ page }) => {
    await expect(page.locator('text=Monitoring Material')).toBeVisible();
    await page.click('button[title="Tutup Sidebar"]');
    await expect(page.locator('aside')).toHaveClass(/w-20/);
    await page.click('button[title="Buka Sidebar"]');
    await expect(page.locator('aside')).toHaveClass(/w-64/);
  });

  test('User dropdown menu opens/closes', async ({ page }) => {
    await page.click('button:has-text("admin")');
    await expect(page.locator('text=Edit Akun')).toBeVisible();
    // Click backdrop overlay to close dropdown
    await page.locator('.fixed.inset-0.z-40').click({ force: true });
    await expect(page.locator('text=Edit Akun')).not.toBeVisible();
  });

  test('Modals open/close and overlay clicks', async ({ page }) => {
    await page.click('text=Monitoring Material');
    await page.click('text=Tambah Material');
    await expect(page.locator('text=Tambah Data Penerimaan')).toBeVisible();
    // Click Batal button inside the modal to close it
    await page.click('form button:has-text("Batal")');
    await expect(page.locator('text=Tambah Data Penerimaan')).not.toBeVisible();
  });
});
