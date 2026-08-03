# CPMS Automation Testing Documentation

Sistem testing ini menggunakan **Playwright** untuk pengujian End-to-End (E2E) dan Visual Regression.

## Struktur Folder

```
cpms/
├── playwright.config.ts    # Konfigurasi Playwright
└── tests/
    ├── helpers.ts          # Helper fungsi (seperti login otomatis)
    ├── login.spec.ts       # Pengujian alur login & validasi kredensial
    ├── dashboard.spec.ts   # Pengujian visual metrics & aktivitas terbaru
    ├── material.spec.ts    # Pengujian CRUD Monitoring Material
    ├── payment.spec.ts     # Pengujian CRUD Invoice & Pembayaran (Termin)
    ├── cashflow.spec.ts    # Pengujian CRUD Ledger & Rekap Kategori
    ├── ui.spec.ts          # Pengujian collapsible sidebar & dialog modal
    └── visual.spec.ts      # Pengujian Visual Regression (Screenshot matching)
```

## Cara Menjalankan Verify (Pipeline)

Gunakan perintah verify untuk melakukan verifikasi kode secara penuh (ESLint, Type Check, Production Build, & Playwright E2E Test) sebelum deploy:

```bash
npm run verify
```

Verify akan otomatis gagal jika ada kesalahan lint, tipe data, build, atau pengujian E2E yang gagal.

## Cara Menjalankan Test Lainnya

- **Menjalankan seluruh E2E test**:
  ```bash
  npx playwright test
  ```
- **Menjalankan test secara interaktif (UI Mode)**:
  ```bash
  npx playwright test --ui
  ```
- **Update Visual Baseline Screenshot**:
  Jika Anda melakukan perubahan UI yang disengaja, jalankan perintah berikut untuk memperbarui baseline screenshot:
  ```bash
  npx playwright test --update-snapshots
  ```

## Cara Menambahkan Test Baru

1. Buat file test baru di dalam folder `tests/` dengan format nama `nama-fitur.spec.ts`.
2. Impor helper login untuk masuk ke aplikasi sebelum pengujian:
   ```ts
   import { test, expect } from '@playwright/test';
   import { doLogin } from './helpers';

   test.describe('Fitur Baru', () => {
     test.beforeEach(async ({ page }) => {
       await doLogin(page);
     });

     test('deskripsi pengujian', async ({ page }) => {
       // Kode pengujian Playwright
     });
   });
   ```
```,filePath: