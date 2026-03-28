// import { test, expect } from '@playwright/test';

// test.describe('SauceDemo Visual Tests', () => {
//   test.beforeEach(async ({ page }) => {
//     await page.addInitScript(() => {
//       const style = document.createElement('style');
//       style.textContent = `
//         *, *::before, *::after {
//           animation-duration: 0s !important;
//           animation-delay: 0s !important;
//           transition-duration: 0s !important;
//           transition-delay: 0s !important;
//           scroll-behavior: auto !important;
//         }
//       `;
//       document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
//     });
//   });

//   test('login page should match baseline', async ({ page }) => {
//     await page.goto('https://www.saucedemo.com/');
//     await page.waitForLoadState('networkidle');
//     await expect(page).toHaveScreenshot('login-page.png', {
//       fullPage: true,
//       animations: 'disabled',
//     });
//   });

//   test('inventory page should match baseline', async ({ page }) => {
//     await page.goto('https://www.saucedemo.com/');
//     await page.fill('[data-test="username"]', 'standard_user');
//     await page.fill('[data-test="password"]', 'secret_sauce');
//     await page.click('[data-test="login-button"]');
//     await page.waitForLoadState('networkidle');

//     await expect(page).toHaveScreenshot('inventory-page.png', {
//       fullPage: true,
//       animations: 'disabled',
//     });
//   });

//   test('cart page should match baseline', async ({ page }) => {
//     await page.goto('https://www.saucedemo.com/');
//     await page.fill('[data-test="username"]', 'standard_user');
//     await page.fill('[data-test="password"]', 'secret_sauce');
//     await page.click('[data-test="login-button"]');
//     await page.waitForLoadState('networkidle');

//     await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
//     await page.click('[data-test="shopping-cart-link"]');
//     await page.waitForLoadState('networkidle');

//     await expect(page).toHaveScreenshot('cart-page.png', {
//       fullPage: true,
//       animations: 'disabled',
//     });
//   });

//   test('checkout page should match baseline', async ({ page }) => {
//     await page.goto('https://www.saucedemo.com/');
//     await page.fill('[data-test="username"]', 'standard_user');
//     await page.fill('[data-test="password"]', 'secret_sauce');
//     await page.click('[data-test="login-button"]');
//     await page.waitForLoadState('networkidle');

//     await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
//     await page.click('[data-test="shopping-cart-link"]');
//     await page.click('[data-test="checkout"]');
//     await page.waitForLoadState('networkidle');

//     await expect(page).toHaveScreenshot('checkout-page.png', {
//       fullPage: true,
//       animations: 'disabled',
//     });
//   });
// });
