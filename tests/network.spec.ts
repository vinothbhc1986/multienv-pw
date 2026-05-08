import { test } from './fixtures/base';
import { expect } from '@playwright/test';

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

  test('should remain usable when multiple static asset types fail to load', async ({ page, inventoryPage }) => {
    await page.route('**/*', async route => {
      const request = route.request();
      const resourceType = request.resourceType();
      if (['image', 'font', 'stylesheet'].includes(resourceType)) {
        await route.abort();
        return;
      }
      await route.continue();
    });

    await inventoryPage.goto();
    await inventoryPage.isLoaded();
    await expect(page.locator('.inventory_item')).toHaveCount(6);
    await expect(page).toHaveURL(/inventory\.html$/);
  });
});
