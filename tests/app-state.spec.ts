import { test, expect } from './fixtures/base';
import fs from 'fs';
import path from 'path';

const env = process.env.TEST_ENV || 'dev';
const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

test.describe('SauceDemo - Reset App State', () => {
  test('should clear the cart and reset buttons when Reset App State is clicked', async ({ page, inventoryPage }) => {
    await inventoryPage.goto();
        await inventoryPage.isLoaded();

    const product = testData.products.backpack;
    console.log('produc ', product)
    await inventoryPage.addProductToCart(product);
    await inventoryPage.expectCartBadgeCount('1');
    await inventoryPage.expectRemoveButtonVisible(product);

    // Open menu and reset app state
    await inventoryPage.header.resetAppState();

    // Close menu to verify state
    await page.keyboard.press('Escape');

    // Cart should be empty
    await inventoryPage.expectNoCartBadge();
    
  });
});
