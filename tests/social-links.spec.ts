import { test } from './fixtures/base';
import { expect } from '@playwright/test';

test.describe('SauceDemo - Footer Social Links', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.isLoaded();
  });

  test('should open Twitter in a new tab', async ({ page }) => {
    const twitterLink = page.locator('.social_twitter a');
    
    // Start waiting for new page before clicking
    const pagePromise = page.context().waitForEvent('page');
    await twitterLink.click();
    const newPage = await pagePromise;

    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(/x\.com\/saucelabs|twitter\.com\/saucelabs/i);
    await newPage.close();
  });

  test('should open Facebook in a new tab', async ({ page }) => {
    const fbLink = page.locator('.social_facebook a');
    
    const pagePromise = page.context().waitForEvent('page');
    await fbLink.click();
    const newPage = await pagePromise;

    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(/facebook\.com\/saucelabs/i);
    await newPage.close();
  });

  test('should open LinkedIn in a new tab', async ({ page }) => {
    const linkedinLink = page.locator('.social_linkedin a');
    
    const pagePromise = page.context().waitForEvent('page');
    await linkedinLink.click();
    const newPage = await pagePromise;

    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(/linkedin\.com\/.*company\/sauce-labs/i);
    await newPage.close();
  });
});
