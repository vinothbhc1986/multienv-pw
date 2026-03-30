//import { test, expect } from '../fixtures/base';

//test.describe('SauceDemo Visual Tests', () => {

  // test('login page should match baseline', async ({ loginPage, page }) => {
  //   // Clear auth state to view pristine login screen
  //   await page.context().clearCookies();
  //   await loginPage.goto();
    
  //   await expect(page).toHaveScreenshot('login-page.png', {
  //     fullPage: true,
  //     maxDiffPixelRatio: 0.01,
  //   });
  // });

  //test('inventory page should match baseline', async ({ page, inventoryPage }) => {
    // Navigate straight to inventory via Global Auth State
  //   await page.goto('/inventory.html');
  //   await inventoryPage.isLoaded();
    
  //   await expect(page).toHaveScreenshot('inventory-page.png', {
  //     fullPage: true,
  //     mask: [page.locator('.inventory_item_img'), page.locator('.inventory_item_price')], // Dynamic masking
  //   });
  // });

  // test('cart page should match baseline', async ({ page, inventoryPage, cartPage }) => {
  //   await page.goto('/inventory.html');
  //   await inventoryPage.addProductToCart('Sauce Labs Backpack');
  //   await inventoryPage.goToCart();
  //   await cartPage.isLoaded();

  //   await expect(page).toHaveScreenshot('cart-page.png', {
  //     fullPage: true,
  //     mask: [page.locator('.inventory_item_price')], // Dynamic masking
  //   });
  // });

//   test('checkout page should match baseline', async ({ page, inventoryPage, cartPage, checkoutPage }) => {
//     await page.goto('/inventory.html');
//     await inventoryPage.addProductToCart('Sauce Labs Backpack');
//     await inventoryPage.goToCart();
//     await cartPage.proceedToCheckout();
//     await checkoutPage.isLoaded();

//     await expect(page).toHaveScreenshot('checkout-page.png', {
//       fullPage: true,
//     });
//   });
// });
