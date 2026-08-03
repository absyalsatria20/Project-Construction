import { test, expect } from '@playwright/test';
import { doLogin } from './helpers';

test.describe('Monitoring Material Feature', () => {
  test.beforeEach(async ({ page }) => {
    await doLogin(page);
    await page.click('text=Monitoring Material');
    await expect(page.locator('text=Tambah Material')).toBeVisible();
  });

  test('Form validation should prevent submit if empty', async ({ page }) => {
    await page.click('text=Tambah Material');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Nama Item wajib diisi.')).toBeVisible();
  });

  test('CRUD - Add, view, edit, search, sorting, filter, delete', async ({ page }) => {
    await page.click('text=Tambah Material');
    await page.fill('input[placeholder="Contoh: Semen Portland, Pasir Pasang"]', 'Batu Bata Merah E2E');
    await page.fill('input[placeholder="Zak, M3, Kg, Batang, dll"]', 'Pcs');
    await page.fill('label:has-text("Jml Pengajuan") >> xpath=.. >> input[type="number"]', '1000');
    await page.click('button:has-text("Simpan")');

    await expect(page.locator('text=Batu Bata Merah E2E')).toBeVisible();

    await page.fill('input[placeholder="Cari material..."]', 'Nonexistent');
    await expect(page.locator('text=Batu Bata Merah E2E')).not.toBeVisible();
    await page.fill('input[placeholder="Cari material..."]', 'Batu Bata');
    await expect(page.locator('text=Batu Bata Merah E2E')).toBeVisible();

    await page.click('button[title="Edit"]');
    await page.fill('input[placeholder="Contoh: Semen Portland, Pasir Pasang"]', 'Batu Bata Merah E2E Edited');
    await page.fill('label:has-text("Jml Diterima") >> xpath=.. >> input[type="number"]', '500');
    await page.fill('form input[type="date"]', '2026-08-03');
    await page.click('button:has-text("Simpan")');
    await expect(page.locator('td:has-text("Batu Bata Merah E2E Edited")')).toBeVisible();

    await page.selectOption('select', 'Partial');
    await expect(page.locator('td:has-text("Batu Bata Merah E2E Edited")')).toBeVisible();
    await page.selectOption('select', 'Complete');
    await expect(page.locator('td:has-text("Batu Bata Merah E2E Edited")')).not.toBeVisible();
    await page.selectOption('select', '');

    await page.click('button[title="Detail"]');
    await expect(page.locator('text=Detail Data Penerimaan')).toBeVisible();
    await expect(page.locator('p:has-text("Batu Bata Merah E2E Edited")')).toBeVisible();
    await page.click('button:has-text("Tutup")');

    await page.click('button[title="Hapus"]');
    await expect(page.locator('text=Apakah Anda yakin ingin menghapus data material ini?')).toBeVisible();
    await page.click('button:has-text("Hapus")');
    await expect(page.locator('td:has-text("Batu Bata Merah E2E Edited")')).not.toBeVisible();
  });
});
