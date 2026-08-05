# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payment.spec.ts >> Rekap Pembayaran Feature >> CRUD - Manage vendor, create/edit/delete invoice, pay termin, export
- Location: tests\payment.spec.ts:11:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Rekap Pembayaran')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - img "ONELITO CONS Logo" [ref=e6]
      - heading "ONELITO PROJECT" [level=2] [ref=e7]
      - paragraph [ref=e8]: Construction Project Bogor
    - generic [ref=e9]: Username atau password salah.
    - generic [ref=e13]:
      - generic [ref=e14]:
        - text: Username
        - textbox "Masukkan username" [ref=e19]: admin
      - generic [ref=e20]:
        - text: Password
        - generic [ref=e21]:
          - textbox "Masukkan password" [ref=e25]: admin123
          - button [ref=e26] [cursor=pointer]
      - button "Masuk" [active] [ref=e30] [cursor=pointer]
  - alert [ref=e31]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { doLogin } from './helpers';
  3  | 
  4  | test.describe('Rekap Pembayaran Feature', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await doLogin(page);
> 7  |     await page.click('text=Rekap Pembayaran');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  8  |     await expect(page.locator('text=Create Invoice')).toBeVisible();
  9  |   });
  10 | 
  11 |   test('CRUD - Manage vendor, create/edit/delete invoice, pay termin, export', async ({ page }) => {
  12 |     await page.click('text=Kelola Vendor');
  13 |     await expect(page.locator('h3:has-text("Daftar Vendor")')).toBeVisible();
  14 |     await page.fill('input[placeholder="Nama vendor..."]', 'Vendor E2E');
  15 |     await page.click('button:has-text("Tambah")');
  16 |     await expect(page.locator('span:has-text("Vendor E2E")').first()).toBeVisible();
  17 |     await page.click('button:has-text("Tutup")');
  18 | 
  19 |     await page.click('text=Create Invoice');
  20 |     await page.selectOption('form select', { label: 'Vendor E2E' });
  21 |     await page.fill('div:has(> label:has-text("No. Invoice")) >> input', 'INV-E2E-123');
  22 |     await page.fill('div:has(> label:has-text("Tanggal Invoice")) >> input', '2026-08-03');
  23 |     await page.fill('div:has(> label:has-text("Total Invoice")) >> input', '1000000');
  24 |     await page.fill('div:has(> label:has-text("Termin")) >> input', '1');
  25 |     await page.fill('div:has(> label:has-text("Keterangan")) >> textarea', 'Pembelian Semen E2E');
  26 |     await page.click('form button:has-text("Simpan")');
  27 | 
  28 |     await expect(page.locator('td:has-text("Pembelian Semen E2E")').first()).toBeVisible();
  29 | 
  30 |     const row = page.locator('tr:has-text("Pembelian Semen E2E")').first();
  31 |     await expect(row.locator('text=Rp 0')).toBeVisible();
  32 |     await expect(row.locator('text=Rp 1.000.000').first()).toBeVisible();
  33 | 
  34 |     await row.locator('button[title="Edit Invoice"]').click();
  35 |     await page.fill('div:has(> label:has-text("Total Invoice")) >> input', '2000000');
  36 |     await page.click('form button:has-text("Simpan")');
  37 |     await expect(row.locator('text=Rp 2.000.000').first()).toBeVisible();
  38 | 
  39 |     await row.locator('button[title="Bayar Termin"]').click();
  40 |     await expect(page.locator('text=Tambah Pembayaran')).toBeVisible();
  41 |     await page.fill('div:has(> label:has-text("Nominal Pembayaran")) >> input', '500000');
  42 |     await page.fill('div:has(> label:has-text("Catatan Pembayaran")) >> input', 'DP E2E');
  43 |     await page.click('form button:has-text("Simpan Pembayaran")');
  44 | 
  45 |     await expect(row.locator('text=Rp 500.000')).toBeVisible();
  46 |     await expect(row.locator('text=Rp 1.500.000')).toBeVisible();
  47 |     await expect(row.locator('text=Sebagian')).toBeVisible();
  48 | 
  49 |     await row.locator('button[title="Detail & Histori Pembayaran"]').click();
  50 |     await expect(page.locator('text=Detail Invoice & Histori')).toBeVisible();
  51 |     await expect(page.locator('text=DP E2E')).toBeVisible();
  52 |     await page.click('button:has-text("Tutup")');
  53 | 
  54 |     const [downloadExcel] = await Promise.all([
  55 |       page.waitForEvent('download'),
  56 |       page.click('button[title="Export Excel"]')
  57 |     ]);
  58 |     expect(downloadExcel.suggestedFilename()).toContain('.xlsx');
  59 | 
  60 |     const [downloadPDF] = await Promise.all([
  61 |       page.waitForEvent('download'),
  62 |       page.click('button[title="Export PDF"]')
  63 |     ]);
  64 |     expect(downloadPDF.suggestedFilename()).toContain('.pdf');
  65 | 
  66 |     await row.locator('button[title="Hapus"]').click();
  67 |     await page.click('.test-confirm-btn');
  68 |     await expect(page.locator('td:has-text("Pembelian Semen E2E")').first()).not.toBeVisible();
  69 |   });
  70 | });
  71 | 
```