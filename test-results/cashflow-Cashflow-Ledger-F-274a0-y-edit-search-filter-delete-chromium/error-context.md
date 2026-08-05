# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cashflow.spec.ts >> Cashflow Ledger Feature >> CRUD - Add entry, edit, search, filter, delete
- Location: tests\cashflow.spec.ts:11:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Beli Kertas A4 E2E').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Beli Kertas A4 E2E').first()

```

```yaml
- complementary:
  - img "Logo"
  - heading "ONELITO PROJECT" [level=1]
  - text: Construction Project Bogor
  - button "Tutup Sidebar"
  - navigation:
    - button "Dashboard"
    - button "Monitoring Material"
    - button "Rekap Pembayaran"
    - button "Cashflow"
  - button "Keluar"
- banner:
  - heading "Cashflow" [level=2]
  - button "A adelia"
- main:
  - text: Total Dana Masuk
  - heading "Rp 475.000.000" [level=3]
  - text: Total Pengeluaran
  - heading "Rp 112.662.900" [level=3]
  - text: Saldo Proyek
  - heading "Rp 362.337.100" [level=3]
  - textbox "Cari deskripsi transaksi..."
  - button "Excel"
  - button "PDF"
  - button "Import"
  - link "Unduh Template":
    - /url: /template-import-cashflow.xlsx
  - button "Input Transaksi"
  - combobox:
    - option "Semua Jenis" [selected]
    - option "Dana Masuk"
    - option "Pengeluaran"
  - combobox:
    - option "Semua Kategori" [selected]
    - option "Admin Bank"
    - option "Biaya Material"
    - option "Biaya Operasional"
    - option "Biaya Operasional Kebun"
    - option "Biaya Operator"
    - option "Biaya Pengukuran & Topografi"
    - option "Biaya Perizinan"
    - option "Biaya Perlengkapan"
    - option "Biaya Persiapan Lahan Awal"
    - option "Biaya SDM Admin Cijeruk"
    - option "Biaya SDM Bekko - Lembur"
    - option "Biaya SDM Belah Batu"
    - option "Biaya SDM Kebun"
    - option "Biaya SDM Logistik"
    - option "Biaya SDM Operator Bekko"
    - option "Biaya SDM Pembuatan Jalan"
    - option "Biaya SDM Pembuatan Pondasi"
    - option "Biaya SDM Pengeboran Sumur"
    - option "Biaya Sewa Alat Bekko"
    - option "Biaya Sewa Alat Mesin Giling"
    - option "Lainnya"
    - option "Petty Cash"
  - textbox:
    - /placeholder: Mulai
  - text: s/d
  - textbox:
    - /placeholder: Sampai
  - table:
    - rowgroup:
      - row "Tanggal Jenis Kategori Keterangan Debit Kredit Total Saldo Edit":
        - columnheader "Tanggal":
          - button "Tanggal"
        - columnheader "Jenis"
        - columnheader "Kategori"
        - columnheader "Keterangan"
        - columnheader "Debit"
        - columnheader "Kredit"
        - columnheader "Total Saldo"
        - columnheader "Edit"
    - rowgroup:
      - row "07/07/2026 Dana Masuk - Top Up Rp 225.000.000 - Rp 362.337.100":
        - cell "07/07/2026"
        - cell "Dana Masuk"
        - cell "-"
        - cell "Top Up"
        - cell "Rp 225.000.000"
        - cell "-"
        - cell "Rp 362.337.100"
        - cell:
          - button
          - button
      - row "07/07/2026 Pengeluaran Biaya Operasional Payment 1 - Sewa Mobil - Rp 5.800.000 Rp 137.337.100":
        - cell "07/07/2026"
        - cell "Pengeluaran"
        - cell "Biaya Operasional"
        - cell "Payment 1 - Sewa Mobil"
        - cell "-"
        - cell "Rp 5.800.000"
        - cell "Rp 137.337.100"
        - cell:
          - button
          - button
      - row "07/07/2026 Pengeluaran Admin Bank Admin Bank BRI - Rp 2.500 Rp 143.137.100":
        - cell "07/07/2026"
        - cell "Pengeluaran"
        - cell "Admin Bank"
        - cell "Admin Bank BRI"
        - cell "-"
        - cell "Rp 2.500"
        - cell "Rp 143.137.100"
        - cell:
          - button
          - button
      - row "07/07/2026 Pengeluaran Biaya Sewa Alat Bekko Perpanjangan Alat Berat / Sewa Bekko - Rp 20.000.000 Rp 143.139.600":
        - cell "07/07/2026"
        - cell "Pengeluaran"
        - cell "Biaya Sewa Alat Bekko"
        - cell "Perpanjangan Alat Berat / Sewa Bekko"
        - cell "-"
        - cell "Rp 20.000.000"
        - cell "Rp 143.139.600"
        - cell:
          - button
          - button
      - row "06/07/2026 Pengeluaran Biaya Material Pembelian Semen - Rp 516.000 Rp 163.139.600":
        - cell "06/07/2026"
        - cell "Pengeluaran"
        - cell "Biaya Material"
        - cell "Pembelian Semen"
        - cell "-"
        - cell "Rp 516.000"
        - cell "Rp 163.139.600"
        - cell:
          - button
          - button
  - paragraph: Menampilkan 1-5 dari 23 data
  - combobox:
    - option "5 / Halaman" [selected]
    - option "10 / Halaman"
    - option "20 / Halaman"
    - option "50 / Halaman"
    - option "100 / Halaman"
  - button [disabled]
  - button "1"
  - button "2"
  - button "3"
  - button "4"
  - button "5"
  - button
  - button "Pilih Banyak"
  - heading "Rekap Pengeluaran" [level=3]
  - paragraph: Tabel rekapitulasi kategori
  - button "Kelola"
  - text: Admin Bank Rp 52.900 Biaya Material Rp 22.560.000 Biaya Operasional Rp 5.800.000 Biaya Operasional Kebun Rp 8.200.000 Biaya Operator Rp 0 Biaya Pengukuran & Topografi Rp 0 Biaya Perizinan Rp 22.500.000 Biaya Perlengkapan Rp 0 Biaya Persiapan Lahan Awal Rp 0 Biaya SDM Admin Cijeruk Rp 0 Biaya SDM Bekko - Lembur Rp 0 Biaya SDM Belah Batu Rp 0 Biaya SDM Kebun Rp 0 Biaya SDM Logistik Rp 0 Biaya SDM Operator Bekko Rp 0 Biaya SDM Pembuatan Jalan Rp 10.000.000 Biaya SDM Pembuatan Pondasi Rp 0 Biaya SDM Pengeboran Sumur Rp 0 Biaya Sewa Alat Bekko Rp 43.500.000 Biaya Sewa Alat Mesin Giling Rp 0 Lainnya Rp 50.000 Petty Cash Rp 0 Grand Total Rp 112.662.900
- alert
- heading "Input Transaksi Proyek" [level=3]
- button
- text: Kategori wajib dipilih. Tanggal Transaksi
- textbox: 2026-08-05
- text: Jenis Transaksi
- combobox:
  - option "Dana Masuk (Income)"
  - option "Pengeluaran (Expense)" [selected]
- text: Kategori
- button "+ Kategori Baru"
- combobox:
  - option "Admin Bank" [selected]
  - option "Biaya Material"
  - option "Biaya Operasional"
  - option "Biaya Operasional Kebun"
  - option "Biaya Operator"
  - option "Biaya Pengukuran & Topografi"
  - option "Biaya Perizinan"
  - option "Biaya Perlengkapan"
  - option "Biaya Persiapan Lahan Awal"
  - option "Biaya SDM Admin Cijeruk"
  - option "Biaya SDM Bekko - Lembur"
  - option "Biaya SDM Belah Batu"
  - option "Biaya SDM Kebun"
  - option "Biaya SDM Logistik"
  - option "Biaya SDM Operator Bekko"
  - option "Biaya SDM Pembuatan Jalan"
  - option "Biaya SDM Pembuatan Pondasi"
  - option "Biaya SDM Pengeboran Sumur"
  - option "Biaya Sewa Alat Bekko"
  - option "Biaya Sewa Alat Mesin Giling"
  - option "Lainnya"
  - option "Petty Cash"
- text: Keterangan
- textbox "Keterangan pengeluaran...": Beli Kertas A4 E2E
- text: Nominal (Rupiah) Rp
- textbox "0": "75.000"
- button "Batal"
- button "Simpan Transaksi"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { doLogin } from './helpers';
  3  | 
  4  | test.describe('Cashflow Ledger Feature', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await doLogin(page);
  7  |     await page.click('text=Cashflow');
  8  |     await expect(page.locator('text=Input Transaksi')).toBeVisible();
  9  |   });
  10 | 
  11 |   test('CRUD - Add entry, edit, search, filter, delete', async ({ page }) => {
  12 |     await page.click('text=Input Transaksi');
  13 |     await page.fill('input[placeholder="Keterangan pengeluaran..."]', 'Beli Kertas A4 E2E');
  14 |     await page.fill('input[placeholder="0"]', '75000');
  15 |     await page.click('button:has-text("Simpan Transaksi")');
  16 | 
> 17 |     await expect(page.locator('text=Beli Kertas A4 E2E').first()).toBeVisible();
     |                                                                   ^ Error: expect(locator).toBeVisible() failed
  18 | 
  19 |     await page.fill('input[placeholder="Cari deskripsi transaksi..."]', 'Nonexistent');
  20 |     await expect(page.locator('text=Beli Kertas A4 E2E').first()).not.toBeVisible();
  21 |     await page.fill('input[placeholder="Cari deskripsi transaksi..."]', 'Beli Kertas');
  22 |     await expect(page.locator('text=Beli Kertas A4 E2E').first()).toBeVisible();
  23 | 
  24 |     // Click edit on the first row
  25 |     await page.click('table tbody tr:first-child td:last-child button:first-child');
  26 |     await page.fill('input[placeholder="Keterangan pengeluaran..."]', 'Beli Kertas A4 E2E Edited');
  27 |     await page.click('button:has-text("Simpan Transaksi")');
  28 |     await expect(page.locator('text=Beli Kertas A4 E2E Edited').first()).toBeVisible();
  29 | 
  30 |     await page.selectOption('select', 'Dana Masuk');
  31 |     await expect(page.locator('text=Beli Kertas A4 E2E Edited').first()).not.toBeVisible();
  32 |     await page.selectOption('select', 'Pengeluaran');
  33 |     await expect(page.locator('text=Beli Kertas A4 E2E Edited').first()).toBeVisible();
  34 |     await page.selectOption('select', '');
  35 | 
  36 |     // Click delete on the first row
  37 |     await page.click('table tbody tr:first-child td:last-child button:last-child');
  38 |     await page.click('button:has-text("Hapus")');
  39 |     await expect(page.locator('text=Beli Kertas A4 E2E Edited').first()).not.toBeVisible();
  40 |   });
  41 | });
  42 | 
```