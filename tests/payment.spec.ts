import { test, expect } from '@playwright/test';
import { doLogin } from './helpers';

test.describe('Rekap Pembayaran Feature', () => {
  test.beforeEach(async ({ page }) => {
    await doLogin(page);
    await page.click('text=Rekap Pembayaran');
    await expect(page.locator('text=Create Invoice')).toBeVisible();
  });

  test('CRUD - Manage vendor, create/edit/delete invoice, pay termin, export', async ({ page }) => {
    await page.click('text=Kelola Vendor');
    await expect(page.locator('h3:has-text("Daftar Vendor")')).toBeVisible();
    await page.fill('input[placeholder="Nama vendor..."]', 'Vendor E2E');
    await page.click('button:has-text("Tambah")');
    await expect(page.locator('span:has-text("Vendor E2E")').first()).toBeVisible();
    await page.click('button:has-text("Tutup")');

    await page.click('text=Create Invoice');
    await page.selectOption('form select', { label: 'Vendor E2E' });
    await page.fill('div:has(> label:has-text("No. Invoice")) >> input', 'INV-E2E-123');
    await page.fill('div:has(> label:has-text("Tanggal Invoice")) >> input', '2026-08-03');
    await page.fill('div:has(> label:has-text("Total Invoice")) >> input', '1000000');
    await page.fill('div:has(> label:has-text("Termin")) >> input', '1');
    await page.fill('div:has(> label:has-text("Keterangan")) >> textarea', 'Pembelian Semen E2E');
    await page.click('form button:has-text("Simpan")');

    await expect(page.locator('td:has-text("Pembelian Semen E2E")').first()).toBeVisible();

    const row = page.locator('tr:has-text("Pembelian Semen E2E")').first();
    await expect(row.locator('text=Rp 0')).toBeVisible();
    await expect(row.locator('text=Rp 1.000.000').first()).toBeVisible();

    await row.locator('button[title="Edit Invoice"]').click();
    await page.fill('div:has(> label:has-text("Total Invoice")) >> input', '2000000');
    await page.click('form button:has-text("Simpan")');
    await expect(row.locator('text=Rp 2.000.000').first()).toBeVisible();

    await row.locator('button[title="Bayar Termin"]').click();
    await expect(page.locator('text=Tambah Pembayaran')).toBeVisible();
    await page.fill('div:has(> label:has-text("Nominal Pembayaran")) >> input', '500000');
    await page.fill('div:has(> label:has-text("Catatan Pembayaran")) >> input', 'DP E2E');
    await page.click('form button:has-text("Simpan Pembayaran")');

    await expect(row.locator('text=Rp 500.000')).toBeVisible();
    await expect(row.locator('text=Rp 1.500.000')).toBeVisible();
    await expect(row.locator('text=Sebagian')).toBeVisible();

    await row.locator('button[title="Detail & Histori Pembayaran"]').click();
    await expect(page.locator('text=Detail Invoice & Histori')).toBeVisible();
    await expect(page.locator('text=DP E2E')).toBeVisible();
    await page.click('button:has-text("Tutup")');

    const [downloadExcel] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button[title="Export Excel"]')
    ]);
    expect(downloadExcel.suggestedFilename()).toContain('.xlsx');

    const [downloadPDF] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button[title="Export PDF"]')
    ]);
    expect(downloadPDF.suggestedFilename()).toContain('.pdf');

    await row.locator('button[title="Hapus"]').click();
    await page.click('.test-confirm-btn');
    await expect(page.locator('td:has-text("Pembelian Semen E2E")').first()).not.toBeVisible();
  });
});
