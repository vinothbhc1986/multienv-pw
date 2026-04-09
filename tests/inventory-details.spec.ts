import { expect } from '@playwright/test';
import { test } from './fixtures/base';

import fs from 'fs';
import path from 'path';

function loadTestData() {
  const env = process.env.TEST_ENV || 'dev';
  const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
  return JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
}

test.describe('SauceDemo - Inventory Item Details @regression', () => {
  test('[TC-28] should open product details page and allow add/remove from details', async ({
    page,
    inventoryPage,
  }) => {
    const testData = loadTestData();
    const productName = testData.products.backpack;

    await inventoryPage.goto();
    await inventoryPage.isLoaded();

    await inventoryPage.openItemDetails(productName);
    await inventoryPage.expectDetailsUrl();

    const addButton = page.getByRole('button', { name: /add to cart/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    const removeButton = page.getByRole('button', { name: /remove/i });
    await expect(removeButton).toBeVisible();
    await removeButton.click();

    await expect(addButton).toBeVisible();
  });

  test('[TC-29] should toggle add/remove state on inventory card', async ({ inventoryPage }) => {
    const testData = loadTestData();
    const productName = testData.products.bikeLight;

    await inventoryPage.goto();
    await inventoryPage.isLoaded();

    await inventoryPage.expectAddToCartButtonVisible(productName);
    await inventoryPage.addProductToCart(productName);
    await inventoryPage.expectRemoveButtonVisible(productName);

    await inventoryPage.removeProductFromCart(productName);
    await inventoryPage.expectAddToCartButtonVisible(productName);
  });

  test('[TC-38] should reflect details add-to-cart in cart badge and cart contents', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    const testData = loadTestData();
    const productName = testData.products.backpack;

    await inventoryPage.goto();
    await inventoryPage.isLoaded();

    await inventoryPage.expectNoCartBadge();
    await inventoryPage.openItemDetails(productName);
    await inventoryPage.expectDetailsUrl();

    await page.getByRole('button', { name: /add to cart/i }).click();

    // Badge appears after adding
    await inventoryPage.expectCartBadgeCount('1');

    await inventoryPage.goToCart();
    await cartPage.isLoaded();
    await cartPage.expectItemInCart(productName);
  });
});

