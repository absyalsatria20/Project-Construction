# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: material.spec.ts >> Monitoring Material Feature >> Form validation should prevent submit if empty
- Location: tests\material.spec.ts:11:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Monitoring Material')

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
  4  | test.describe('Monitoring Material Feature', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await doLogin(page);
> 7  |     await page.click('text=Monitoring Material');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  8  |     await expect(page.locator('text=Tambah Material')).toBeVisible();
  9  |   });
  10 | 
  11 |   test('Form validation should prevent submit if empty', async ({ page }) => {
  12 |     await page.click('text=Tambah Material');
  13 |     await page.click('button[type="submit"]');
  14 |     await expect(page.locator('text=Nama Item wajib diisi.')).toBeVisible();
  15 |   });
  16 | 
  17 |   test('CRUD - Add, view, edit, search, sorting, filter, delete', async ({ page }) => {
  18 |     await page.click('text=Tambah Material');
  19 |     await page.fill('input[placeholder="Contoh: Semen Portland, Pasir Pasang"]', 'Batu Bata Merah E2E');
  20 |     await page.fill('input[placeholder="Zak, M3, Kg, Batang, dll"]', 'Pcs');
  21 |     await page.fill('label:has-text("Jml Pengajuan") >> xpath=.. >> input[type="number"]', '1000');
  22 |     await page.click('button:has-text("Simpan")');
  23 | 
  24 |     await expect(page.locator('text=Batu Bata Merah E2E')).toBeVisible();
  25 | 
  26 |     await page.fill('input[placeholder="Cari material..."]', 'Nonexistent');
  27 |     await expect(page.locator('text=Batu Bata Merah E2E')).not.toBeVisible();
  28 |     await page.fill('input[placeholder="Cari material..."]', 'Batu Bata');
  29 |     await expect(page.locator('text=Batu Bata Merah E2E')).toBeVisible();
  30 | 
  31 |     await page.click('button[title="Edit"]');
  32 |     await page.fill('input[placeholder="Contoh: Semen Portland, Pasir Pasang"]', 'Batu Bata Merah E2E Edited');
  33 |     await page.fill('label:has-text("Jml Diterima") >> xpath=.. >> input[type="number"]', '500');
  34 |     await page.fill('form input[type="date"]', '2026-08-03');
  35 |     await page.click('button:has-text("Simpan")');
  36 |     await expect(page.locator('td:has-text("Batu Bata Merah E2E Edited")')).toBeVisible();
  37 | 
  38 |     await page.selectOption('select', 'Partial');
  39 |     await expect(page.locator('td:has-text("Batu Bata Merah E2E Edited")')).toBeVisible();
  40 |     await page.selectOption('select', 'Complete');
  41 |     await expect(page.locator('td:has-text("Batu Bata Merah E2E Edited")')).not.toBeVisible();
  42 |     await page.selectOption('select', '');
  43 | 
  44 |     await page.click('button[title="Detail"]');
  45 |     await expect(page.locator('text=Detail Data Penerimaan')).toBeVisible();
  46 |     await expect(page.locator('p:has-text("Batu Bata Merah E2E Edited")')).toBeVisible();
  47 |     await page.click('button:has-text("Tutup")');
  48 | 
  49 |     await page.click('button[title="Hapus"]');
  50 |     await expect(page.locator('text=Apakah Anda yakin ingin menghapus data material ini?')).toBeVisible();
  51 |     await page.click('button:has-text("Hapus")');
  52 |     await expect(page.locator('td:has-text("Batu Bata Merah E2E Edited")')).not.toBeVisible();
  53 |   });
  54 | });
  55 | 
```