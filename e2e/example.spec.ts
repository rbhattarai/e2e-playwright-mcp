import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to the base URL before each test.
  await page.goto('/');
}); 

test.afterEach(async ({ page }) => {
  // Close the page after each test to ensure a clean state for the next test.
  await page.close();
});


test('has title', async ({ page }) => {
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Fast and reliable end-to-end testing for modern web apps | Playwright");

});

test('get started link', async ({ page }) => {
  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});


