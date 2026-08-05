# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Login Feature >> successful login redirects to dashboard
- Location: tests\login.spec.ts:18:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h2:has-text("Dashboard")')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h2:has-text("Dashboard")')

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
  2  | 
  3  | test.describe('Login Feature', () => {
  4  |   test('unauthenticated redirects to login', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await expect(page.locator('text=ONELITO PROJECT').first()).toBeVisible();
  7  |     await expect(page.locator('input[placeholder="Masukkan username"]')).toBeVisible();
  8  |   });
  9  | 
  10 |   test('login failure shows error alert', async ({ page }) => {
  11 |     await page.goto('/');
  12 |     await page.fill('input[placeholder="Masukkan username"]', 'wrong');
  13 |     await page.fill('input[placeholder="Masukkan password"]', 'credentials');
  14 |     await page.click('button[type="submit"]');
  15 |     await expect(page.locator('text=Username atau password salah.')).toBeVisible();
  16 |   });
  17 | 
  18 |   test('successful login redirects to dashboard', async ({ page }) => {
  19 |     await page.goto('/');
  20 |     await page.fill('input[placeholder="Masukkan username"]', 'admin');
  21 |     await page.fill('input[placeholder="Masukkan password"]', 'admin123');
  22 |     await page.click('button[type="submit"]');
  23 |     await expect(page.locator('text=ONELITO PROJECT').first()).toBeVisible();
> 24 |     await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
     |                                                            ^ Error: expect(locator).toBeVisible() failed
  25 |   });
  26 | });
  27 | 
```