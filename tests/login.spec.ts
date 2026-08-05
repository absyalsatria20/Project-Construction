import { test, expect } from '@playwright/test';

test.describe('Login Feature', () => {
  test('unauthenticated redirects to login', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=ONELITO PROJECT').first()).toBeVisible();
    await expect(page.locator('input[placeholder="Masukkan username"]')).toBeVisible();
  });

  test('login failure shows error alert', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder="Masukkan username"]', 'wrong');
    await page.fill('input[placeholder="Masukkan password"]', 'credentials');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Username atau password salah.')).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder="Masukkan username"]', 'admin');
    await page.fill('input[placeholder="Masukkan password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=ONELITO PROJECT').first()).toBeVisible();
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
  });
});
