import { test, expect } from '@playwright/test';
import { doLogin } from './helpers';

test.describe('Cashflow Ledger Feature', () => {
  test.beforeEach(async ({ page }) => {
    await doLogin(page);
    await page.click('text=Cashflow');
    await expect(page.locator('text=Input Transaksi')).toBeVisible();
  });

  test('CRUD - Add entry, edit, search, filter, delete', async ({ page }) => {
    await page.click('text=Input Transaksi');
    await page.fill('input[placeholder="Keterangan pengeluaran..."]', 'Beli Kertas A4 E2E');
    await page.fill('input[placeholder="0"]', '75000');
    await page.click('button:has-text("Simpan Transaksi")');

    await expect(page.locator('text=Beli Kertas A4 E2E').first()).toBeVisible();

    await page.fill('input[placeholder="Cari deskripsi transaksi..."]', 'Nonexistent');
    await expect(page.locator('text=Beli Kertas A4 E2E').first()).not.toBeVisible();
    await page.fill('input[placeholder="Cari deskripsi transaksi..."]', 'Beli Kertas');
    await expect(page.locator('text=Beli Kertas A4 E2E').first()).toBeVisible();

    // Click edit on the first row
    await page.click('table tbody tr:first-child td:last-child button:first-child');
    await page.fill('input[placeholder="Keterangan pengeluaran..."]', 'Beli Kertas A4 E2E Edited');
    await page.click('button:has-text("Simpan Transaksi")');
    await expect(page.locator('text=Beli Kertas A4 E2E Edited').first()).toBeVisible();

    await page.selectOption('select', 'Dana Masuk');
    await expect(page.locator('text=Beli Kertas A4 E2E Edited').first()).not.toBeVisible();
    await page.selectOption('select', 'Pengeluaran');
    await expect(page.locator('text=Beli Kertas A4 E2E Edited').first()).toBeVisible();
    await page.selectOption('select', '');

    // Click delete on the first row
    await page.click('table tbody tr:first-child td:last-child button:last-child');
    await page.click('button:has-text("Hapus")');
    await expect(page.locator('text=Beli Kertas A4 E2E Edited').first()).not.toBeVisible();
  });
});
