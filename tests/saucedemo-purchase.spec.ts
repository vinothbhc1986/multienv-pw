import { test } from './fixtures/base';
import { expect } from '@playwright/test';

import fs from 'fs';
import path from 'path';
import { ERROR_MESSAGES } from './utils/constants';

const env = process.env.TEST_ENV || 'dev';
const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

const { lockedOutUser, password } = testData.credentials;
const { fleeceJacket, boltTShirt, backpack, bikeLight, onesie, testAllTheThings } = testData.products;
const { checkoutProfiles } = testData;

test.describe('SauceDemo - Login & Negative Tests (No Auth)', () => {
  // Clear authentication state for login tests
  test.use({ storageState: { cookies: [], origins: [] } });

  test('[TC-08] should display error message for locked out user', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(lockedOutUser, password);
    await loginPage.expectErrorMessage(ERROR_MESSAGES.lockedOutUser);
  });

  test('[TC-09] should display error when logging in with invalid username', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('invalid_user', password);
    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
  });

  test('[TC-10] should display error when logging in with invalid password', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'invalid_password');
    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
  });

  test('[TC-11] should display error when logging in without username', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', password);
    await loginPage.expectErrorMessage(ERROR_MESSAGES.usernameRequired);
  });

  test('[TC-12] should display error when logging in without password', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', '');
    await loginPage.expectErrorMessage(ERROR_MESSAGES.passwordRequired);
  });

  test('[TC-18] should handle XSS injection attempts in login safely', async ({ page, loginPage }) => {
    const xssPayload = '<script>alert("xss")</script>';
    let xssExecuted = false;
    page.on('dialog', async dialog => {
      xssExecuted = true;
      await dialog.dismiss();
    });

    await loginPage.goto();
    await loginPage.login(xssPayload, password);
    
    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
    expect(xssExecuted).toBe(false);
  });

  test('[TC-19] should handle SQL injection attempts in login safely', async ({ loginPage }) => {
    const sqlPayload = "' OR '1'='1";
    await loginPage.goto();
    await loginPage.login(sqlPayload, password);
    
    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
  });
});

test.describe('SauceDemo - Purchase Flow (Authenticated)', () => {
  // We don't need to login manually here! `storageState` is applied.
  test.beforeEach(async ({ page }) => {
    // We navigate straight to inventory since we're already logged in via global Setup
    await page.goto('/inventory.html');
  });

  // Data-Driven Testing (DDT) looping through checkout profiles dynamically!
  for (const profile of checkoutProfiles) {
    test(`[TC-01] should complete purchase dynamically for ${profile.firstName}`, async ({ inventoryPage, cartPage, checkoutPage }) => {
      await inventoryPage.addProductToCart(fleeceJacket);
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
      
      await checkoutPage.fillDetails(profile.firstName, profile.lastName, profile.postalCode);
      await checkoutPage.clickContinue();
      await checkoutPage.clickFinish();
      await checkoutPage.expectOrderConfirmed();
    });
  }

  test('[TC-03] should allow removing an item from the cart', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addProductToCart(backpack);
    await inventoryPage.goToCart();
    await cartPage.expectItemInCart(backpack);
    await cartPage.removeItem(backpack);
    await cartPage.expectItemNotInCart(backpack);
  });

  test('[TC-04] should allow continuing shopping from the cart', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.addProductToCart(bikeLight);
    await inventoryPage.goToCart();
    await cartPage.continueShopping();
    await inventoryPage.isLoaded();
    await page.screenshot({ path: `test-results/screenshots/Bike.png`, fullPage: true });
  });

  test('[TC-05] should display error when checkout information is missing', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addProductToCart(fleeceJacket);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.clickContinue();
    await checkoutPage.expectErrorMessage(ERROR_MESSAGES.checkoutFirstNameRequired);
  });

  test('[TC-06] should display error when checkout last name is missing', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addProductToCart(fleeceJacket);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    const profile = checkoutProfiles[0];
    await checkoutPage.fillDetails(profile.firstName, '', '');
    await checkoutPage.clickContinue();
    await checkoutPage.expectErrorMessage(ERROR_MESSAGES.checkoutLastNameRequired);
  });

  test('[TC-07] should display error when checkout postal code is missing', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addProductToCart(fleeceJacket);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    const profile = checkoutProfiles[0];
    await checkoutPage.fillDetails(profile.firstName, profile.lastName, '');
    await checkoutPage.clickContinue();
    await checkoutPage.expectErrorMessage(ERROR_MESSAGES.checkoutPostalCodeRequired);
  });

  test('[TC-13] should allow sorting items from low to high price', async ({ inventoryPage }) => {
    await inventoryPage.sortItems('lohi');
    const firstPrice = await inventoryPage.getFirstItemPrice();
    expect(firstPrice).toBe(7.99); 
  });

  test('[TC-14] should allow sorting items from high to low price', async ({ inventoryPage }) => {
    await inventoryPage.sortItems('hilo');
    const firstPrice = await inventoryPage.getFirstItemPrice();
    expect(firstPrice).toBe(49.99);
  });

  test('[TC-15] should allow sorting items by name (A to Z)', async ({ inventoryPage }) => {
    await inventoryPage.sortItems('az');
    const firstName = await inventoryPage.getFirstItemName();
    expect(firstName).toBe(testData.products.backpack);
  });

  test('[TC-16] should allow sorting items by name (Z to A)', async ({ inventoryPage }) => {
    await inventoryPage.sortItems('za');
    const firstName = await inventoryPage.getFirstItemName();
    expect(firstName).toBe('Test.allTheThings() T-Shirt (Red)');
  })

  test('[TC-17] should allow purchasing multiple items', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addProductToCart(fleeceJacket);
    await inventoryPage.addProductToCart(onesie);
    await inventoryPage.addProductToCart(testAllTheThings);

    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    
    const profile = checkoutProfiles[0];
    await checkoutPage.fillDetails(profile.firstName, profile.lastName, profile.postalCode);
    await checkoutPage.clickContinue();
    await checkoutPage.clickFinish();
    await checkoutPage.expectOrderConfirmed();
  });
});
