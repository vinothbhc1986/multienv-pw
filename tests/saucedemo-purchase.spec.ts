import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import fs from 'fs';
import path from 'path';

const env = process.env.TEST_ENV || 'dev';
const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

const { username, lockedOutUser, problemUser, password } = testData.credentials;
const { fleeceJacket, boltTShirt, backpack, bikeLight, onesie, testAllTheThings } = testData.products;
const { checkoutProfiles } = testData;
import { ERROR_MESSAGES } from './utils/constants';


test.describe('SauceDemo - Purchase Flow', () => {
  test('[TC-01] should successfully purchase Sauce Labs Fleece Jacket', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Step 1: Navigate and Login
    await loginPage.goto();
    await loginPage.login(username, password);

    // Step 2: Verify inventory is loaded
    await inventoryPage.isLoaded();

    // Step 3: Add "Sauce Labs Fleece Jacket" to cart
    await inventoryPage.addProductToCart(fleeceJacket);

    // Step 4: Go to cart
    await inventoryPage.goToCart();

    // Step 5: Verify cart loaded and proceed to checkout
    await cartPage.isLoaded();
    await cartPage.proceedToCheckout();

    // Step 6: Fill checkout details
    await checkoutPage.isLoaded();
    await checkoutPage.fillDetails(checkoutProfiles[0].firstName, checkoutProfiles[0].lastName, checkoutProfiles[0].postalCode);

    // Step 7: Click Continue
    await checkoutPage.clickContinue();

    // Step 8: Click Finish
    await checkoutPage.clickFinish();

    // Step 9: Assert order confirmation
    await checkoutPage.expectOrderConfirmed();
  });

  test('[TC-02] should successfully purchase Sauce Labs Bolt T-Shirt', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Step 1: Navigate and Login
    await loginPage.goto();
    await loginPage.login(username, password);

    // Step 2: Verify inventory is loaded
    await inventoryPage.isLoaded();

    // Step 3: Add "Sauce Labs Bolt T-Shirt" to cart
    await inventoryPage.addProductToCart(boltTShirt);

    // Step 4: Go to cart
    await inventoryPage.goToCart();

    // Step 5: Verify cart loaded and proceed to checkout
    await cartPage.isLoaded();
    await cartPage.proceedToCheckout();

    // Step 6: Fill checkout details
    await checkoutPage.isLoaded();
    await checkoutPage.fillDetails(checkoutProfiles[1].firstName, checkoutProfiles[1].lastName, checkoutProfiles[1].postalCode);

    // Step 7: Click Continue
    await checkoutPage.clickContinue();

    // Step 8: Click Finish
    await checkoutPage.clickFinish();

    // Step 9: Assert order confirmation
    await checkoutPage.expectOrderConfirmed();
  });
  test('[TC-03] should allow removing an item from the cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.isLoaded();
    
    await inventoryPage.addProductToCart(backpack);
    await inventoryPage.goToCart();
    await cartPage.isLoaded();
    
    await cartPage.expectItemInCart(backpack);
    await cartPage.removeItem(backpack);
    await cartPage.expectItemNotInCart(backpack);
  });

  test('[TC-04] should allow continuing shopping from the cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.isLoaded();
    
    await inventoryPage.addProductToCart(bikeLight);
    await inventoryPage.goToCart();
    await cartPage.isLoaded();
    
    await cartPage.continueShopping();
    await inventoryPage.isLoaded();
    await page.screenshot({ path: `test-results/screenshots/Bike.png`, fullPage: true });
  });

  test('[TC-05] should display error when checkout information is missing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page); 
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.isLoaded();
    
    await inventoryPage.addProductToCart(fleeceJacket);
    await inventoryPage.goToCart();
    await cartPage.isLoaded();
    
    await cartPage.proceedToCheckout();
    await checkoutPage.isLoaded();
    
    // Click continue without filling details
    await checkoutPage.clickContinue();
    await checkoutPage.expectErrorMessage(ERROR_MESSAGES.checkoutFirstNameRequired);
  });

  test('[TC-06] should display error when checkout last name is missing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page); 
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.isLoaded();
    
    await inventoryPage.addProductToCart(fleeceJacket);
    await inventoryPage.goToCart();
    await cartPage.isLoaded();
    
    await cartPage.proceedToCheckout();
    await checkoutPage.isLoaded();
    
    await checkoutPage.fillDetails(checkoutProfiles[0].firstName, '', '');
    await checkoutPage.clickContinue();
    await checkoutPage.expectErrorMessage(ERROR_MESSAGES.checkoutLastNameRequired);
  });

  test('[TC-07] should display error when checkout postal code is missing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page); 
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.isLoaded();
    
    await inventoryPage.addProductToCart(fleeceJacket);
    await inventoryPage.goToCart();
    await cartPage.isLoaded();
    
    await cartPage.proceedToCheckout();
    await checkoutPage.isLoaded();
    
    await checkoutPage.fillDetails(checkoutProfiles[0].firstName, checkoutProfiles[0].lastName, '');
    await checkoutPage.clickContinue();
    await checkoutPage.expectErrorMessage(ERROR_MESSAGES.checkoutPostalCodeRequired);
  });

  test('[TC-08] should display error message for locked out user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(lockedOutUser, password);
    await loginPage.expectErrorMessage(ERROR_MESSAGES.lockedOutUser);
  });

  test('[TC-09] should display error when logging in with invalid username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('invalid_user', password);
    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
  });

  test('[TC-10] should display error when logging in with invalid password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(username, 'invalid_password');
    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
  });

  test('[TC-11] should display error when logging in without username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('', password);
    await loginPage.expectErrorMessage(ERROR_MESSAGES.usernameRequired);
  });

  test('[TC-12] should display error when logging in without password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(username, '');
    await loginPage.expectErrorMessage(ERROR_MESSAGES.passwordRequired);
  });

  test('[TC-13] should allow sorting items from low to high price', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.isLoaded();

    // Sort by price (low to high) -> value is 'lohi' based on SauceDemo dropdown
    await inventoryPage.sortItems('lohi');
    
    // Verify first item price
    const firstPrice = await inventoryPage.getFirstItemPrice();
    expect(firstPrice).toBe(7.99); // based on SauceLabs onesie price
  });

  test('[TC-14] should allow sorting items from high to low price', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.isLoaded();

    await inventoryPage.sortItems('hilo');
    
    const firstPrice = await inventoryPage.getFirstItemPrice();
    expect(firstPrice).toBe(49.99); // based on SauceLabs fleece jacket price
  });

  test('[TC-15] should allow sorting items by name (A to Z)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.isLoaded();

    await inventoryPage.sortItems('az');
    
    const firstName = await inventoryPage.getFirstItemName();
    expect(firstName).toBe('Sauce Labs Backpack');
  });

  test('[TC-16] should allow sorting items by name (Z to A)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.isLoaded();

    await inventoryPage.sortItems('za');
    
    const firstName = await inventoryPage.getFirstItemName();
    expect(firstName).toBe('Test.allTheThings() T-Shirt (Red)');
  });

  test('[TC-17] should allow purchasing multiple items', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.isLoaded();

    // Add multiple items
    await inventoryPage.addProductToCart(fleeceJacket);
    await inventoryPage.addProductToCart(onesie);
    await inventoryPage.addProductToCart(testAllTheThings);

    await inventoryPage.goToCart();
    await cartPage.isLoaded();

    // Proceed to checkout
    await cartPage.proceedToCheckout();
    await checkoutPage.isLoaded();
    await checkoutPage.fillDetails(checkoutProfiles[2].firstName, checkoutProfiles[2].lastName, checkoutProfiles[2].postalCode);
    await checkoutPage.clickContinue();
    await checkoutPage.clickFinish();
    await checkoutPage.expectOrderConfirmed();
  });

  test('[TC-18] should handle XSS injection attempts in login safely', async ({ page }) => {
    const loginPage = new LoginPage(page);
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

  test('[TC-19] should handle SQL injection attempts in login safely', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const sqlPayload = "' OR '1'='1";

    await loginPage.goto();
    await loginPage.login(sqlPayload, password);
    
    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
  });
});
