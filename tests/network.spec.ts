import { test, expect } from './fixtures/base';

test.describe('SauceDemo - Network Interception', () => {
  test('should handle blocked imagery gracefully by simulating 500 Network errors', async ({ page, inventoryPage }) => {
    // Intercept image requests and abort them
    await page.route('**/*.jpg', route => route.abort());

    // Still able to navigate and interact
    await inventoryPage.goto();
    await inventoryPage.isLoaded();
    

    
    // Can still add to cart despite image failure
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.expectCartBadgeCount('1');
  });
  
  test('Mocking a Google Analytics request endpoint using route.fulfill', async ({ page, inventoryPage }) => {
     // Fulfill an analytics tracking request with a fake ok response immediately so it doesn't slow the test down
     await page.route('https://events.backtrace.io/**', async route => {
         await route.fulfill({
             status: 200,
             body: JSON.stringify({ success: true }),
         });
     });

     await inventoryPage.goto();
     await inventoryPage.isLoaded();
  });
});
