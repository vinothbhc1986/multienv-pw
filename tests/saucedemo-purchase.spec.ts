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
const defaultProfile = checkoutProfiles[0];

test.describe('SauceDemo - Login & Negative Tests (No Auth) @regression', () => {
  // Clear authentication state for login tests
  test.use({ storageState: { cookies: [], origins: [] } });

  const invalidLoginScenarios = [
    { id: 'TC-08', type: '@smoke locked out user', user: lockedOutUser, pass: password, error: ERROR_MESSAGES.lockedOutUser },
    { id: 'TC-09', type: 'invalid user', user: 'invalid_user', pass: password, error: ERROR_MESSAGES.invalidCredentials },
    { id: 'TC-10', type: 'invalid password', user: testData.credentials.username, pass: 'invalid_password', error: ERROR_MESSAGES.invalidCredentials },
    { id: 'TC-11', type: 'missing username', user: '', pass: password, error: ERROR_MESSAGES.usernameRequired },
    { id: 'TC-12', type: 'missing password', user: testData.credentials.username, pass: '', error: ERROR_MESSAGES.passwordRequired },
  ];

  for (const scenario of invalidLoginScenarios) {
    test(`[${scenario.id}] should display error for ${scenario.type}`, async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login(scenario.user, scenario.pass);
      await loginPage.expectErrorMessage(scenario.error);
    });
  }

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

test.describe('SauceDemo - Purchase Flow (Authenticated) @regression', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  for (const profile of checkoutProfiles) {
    test(`[TC-01] @smoke should complete purchase dynamically for ${profile.firstName}`, async ({ inventoryPage, cartPage, checkoutPage }) => {
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
    await checkoutPage.fillDetails(defaultProfile.firstName, '', '');
    await checkoutPage.clickContinue();
    await checkoutPage.expectErrorMessage(ERROR_MESSAGES.checkoutLastNameRequired);
  });

  test('[TC-07] should display error when checkout postal code is missing', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addProductToCart(fleeceJacket);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillDetails(defaultProfile.firstName, defaultProfile.lastName, '');
    await checkoutPage.clickContinue();
    await checkoutPage.expectErrorMessage(ERROR_MESSAGES.checkoutPostalCodeRequired);
  });

  test.describe('Sorting functionality', () => {
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
      expect(firstName).toBe(testAllTheThings);
    });
  });

  test('[TC-17] @smoke should allow purchasing multiple items', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addProductToCart(fleeceJacket);
    await inventoryPage.addProductToCart(onesie);
    await inventoryPage.addProductToCart(testAllTheThings);

    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    
    await checkoutPage.fillDetails(defaultProfile.firstName, defaultProfile.lastName, defaultProfile.postalCode);
    await checkoutPage.clickContinue();
    await checkoutPage.clickFinish();
    await checkoutPage.expectOrderConfirmed();
  });
});

test.describe('SauceDemo - Cart Persistence @regression', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('[TC-20] should keep cart item after navigating from cart back to inventory and return to cart', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addProductToCart(backpack);
    await inventoryPage.goToCart();
    await cartPage.expectItemInCart(backpack);

    await cartPage.continueShopping();
    await inventoryPage.isLoaded();

    await inventoryPage.goToCart();
    await cartPage.expectItemInCart(backpack);
  });

  test('[TC-21] should show empty cart with zero products when nothing added', async ({ cartPage }) => {
    await cartPage.goto();
    await cartPage.expectEmptyCart();
    await cartPage.isLoaded();
  });

  test('[TC-22] should update cart badge count when adding/removing items', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addProductToCart(bikeLight);
    await inventoryPage.expectCartBadgeCount('1');

    await inventoryPage.goToCart();
    await cartPage.isLoaded();
    await cartPage.expectUrl();
    await cartPage.removeItem(bikeLight);
    await inventoryPage.expectNoCartBadge();
  });

  test('[TC-23] should preserve cart item when returning from checkout overview to cart', async ({ inventoryPage, cartPage, checkoutPage, checkoutOverviewPage }) => {
    await inventoryPage.addProductToCart(backpack);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.fillDetails(defaultProfile.firstName, defaultProfile.lastName, defaultProfile.postalCode);
    await checkoutPage.clickContinue();

    await checkoutPage.expectCheckoutStepTwoUrl();

    await checkoutOverviewPage.expectCorrectTotal()
    
    await checkoutPage.clickCancel();
    
    await inventoryPage.isLoaded();
    await inventoryPage.expectUrl();

    await inventoryPage.goToCart();
    await cartPage.isLoaded();
    await cartPage.expectItemInCart(backpack);
  });
});
