import { Page, expect } from '@playwright/test';

export async function doLogin(page: Page) {
  await page.goto('/');
  await page.fill('input[placeholder="Masukkan username"]', 'admin');
  await page.fill('input[placeholder="Masukkan password"]', 'admin123');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=ONELITO PROJECT').first()).toBeVisible();
}
