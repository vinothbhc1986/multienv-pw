import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import testData from './config/testdata.json';

const { username, password } = testData.credentials;
const { fleeceJacket, boltTShirt, backpack, bikeLight } = testData.products;

/**
 * SauceDemo E2E Purchase Flow
 *
 * Scenario:
 *  1. Login as standard_user
 *  2. Find "Sauce Labs Bolt T-Shirt" and add to cart
 *  3. Open cart → proceed to checkout
 *  4. Fill checkout details and complete purchase
 *  5. Assert order confirmation
 */
test.describe('SauceDemo - Purchase Flow', () => {
  test('should successfully purchase Sauce Labs Fleece Jacket', async ({ page }) => {
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
    await checkoutPage.fillDetails('VInoth', 'UNITED PRO tTECH', '612001');

    // Step 7: Click Continue
    await checkoutPage.clickContinue();

    // Step 8: Click Finish
    await checkoutPage.clickFinish();

    // Step 9: Assert order confirmation
    await checkoutPage.expectOrderConfirmed();
  });

  test('should successfully purchase Sauce Labs Bolt T-Shirt', async ({ page }) => {
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
    await checkoutPage.fillDetails('Nakeem QA', 'Learnings', '500001');

    // Step 7: Click Continue
    await checkoutPage.clickContinue();

    // Step 8: Click Finish
    await checkoutPage.clickFinish();

    // Step 9: Assert order confirmation
    await checkoutPage.expectOrderConfirmed();
  });
  test('should allow removing an item from the cart', async ({ page }) => {
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

  test('should allow continuing shopping from the cart', async ({ page }) => {
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

  test('should display error when checkout information is missing', async ({ page }) => {
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
    await checkoutPage.expectErrorMessage('Error: First Name is required');
  });
});
