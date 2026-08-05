# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard Feature >> should display metric cards and stats
- Location: tests\dashboard.spec.ts:23:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Total Dana Masuk')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Total Dana Masuk')

```

```yaml
- img "ONELITO CONS Logo"
- heading "ONELITO PROJECT" [level=2]
- paragraph: Construction Project Bogor
- text: Username atau password salah. Username
- textbox "Masukkan username": admin
- text: Password
- textbox "Masukkan password": admin123
- button
- button "Masuk"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { doLogin } from './helpers';
  3  | 
  4  | test.describe('Dashboard Feature - Console Errors', () => {
  5  |   test('should not have console errors during load', async ({ page }) => {
  6  |     test.setTimeout(60000);
  7  |     const consoleErrors: string[] = [];
  8  |     page.on('console', msg => {
  9  |       if (msg.type() === 'error') {
  10 |         consoleErrors.push(msg.text());
  11 |       }
  12 |     });
  13 |     await doLogin(page);
  14 |     expect(consoleErrors.filter(err => !err.includes('favicon.ico'))).toEqual([]);
  15 |   });
  16 | });
  17 | 
  18 | test.describe('Dashboard Feature', () => {
  19 |   test.beforeEach(async ({ page }) => {
  20 |     await doLogin(page);
  21 |   });
  22 | 
  23 |   test('should display metric cards and stats', async ({ page }) => {
> 24 |     await expect(page.locator('text=Total Dana Masuk')).toBeVisible();
     |                                                         ^ Error: expect(locator).toBeVisible() failed
  25 |     await expect(page.locator('text=Total Pengeluaran')).toBeVisible();
  26 |     await expect(page.locator('text=Saldo Saat Ini')).toBeVisible();
  27 |     await expect(page.locator('text=Invoice Belum Lunas')).toBeVisible();
  28 |     await expect(page.locator('text=Progress Material')).toBeVisible();
  29 |     await expect(page.locator('text=Quick Actions')).toBeVisible();
  30 |   });
  31 | 
  32 |   test('should contain charts section and recent activity', async ({ page }) => {
  33 |     await expect(page.locator('text=Pengeluaran per Kategori')).toBeVisible();
  34 |     await expect(page.locator('text=Aktivitas Cashflow Terbaru')).toBeVisible();
  35 |   });
  36 | });
  37 | 
```