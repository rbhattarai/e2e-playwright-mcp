import { test, expect } from '@playwright/test';

test.describe('Sauce Demo Shopping Flow', () => {
  test('should login, add item to cart, and proceed to checkout', async ({ page }) => {
    // Navigate to the login page
    await page.goto('https://www.saucedemo.com/');

    // Verify login page is displayed
    await expect(page).toHaveTitle('Swag Labs');

    // Fill in login credentials (standard_user / secret_sauce)
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');

    // Click login button
    await page.locator('[data-test="login-button"]').click();

    // Verify Products page is displayed
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');

    // Add "Sauce Labs Backpack" to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Verify cart badge shows 1 item
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // Click on shopping cart icon
    await page.locator('[data-test="shopping-cart-link"]').click();

    // Verify we're on the cart page
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
    await expect(page.locator('[data-test="title"]')).toHaveText('Your Cart');

    // Verify Sauce Labs Backpack is in the cart
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');

    // Click Checkout button
    await page.locator('[data-test="checkout"]').click();

    // Verify we're on the checkout step one page
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Your Information');
  });
});
