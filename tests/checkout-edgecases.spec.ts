import { test, expect } from './fixtures/base';
import { faker } from '@faker-js/faker';

test.describe('SauceDemo - Address Validation Edge Cases', () => {
  test('should successfully checkout with dynamic edge-case names and ZIP via Faker', async ({ inventoryPage, cartPage, checkoutPage, checkoutOverviewPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    
    // Using Faker to generate extremely long names, characters
    const dynamicFirstName = faker.person.firstName() + " O'Connell-Smiths " + faker.string.alphanumeric(10);
    //
    const dynamicLastName = faker.person.lastName() + " (Jr.)";
    const dynamicZip = faker.location.zipCode() + "-" + faker.location.zipCode();
    
    await checkoutPage.fillDetails(dynamicFirstName, dynamicLastName, dynamicZip);
    await checkoutPage.clickContinue();
    
    await checkoutOverviewPage.isLoaded();
    await checkoutOverviewPage.expectUrl();
  });

  test('should trim whitespace around checkout inputs without failing', async ({ inventoryPage, cartPage, checkoutPage, checkoutOverviewPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    
    // Putting whitespaces which may break some backend validations if not trimmed
    await checkoutPage.fillDetails("   John   ", "   Doe   ", "  12345  ");
    await checkoutPage.clickContinue();
    
    await checkoutOverviewPage.isLoaded();
  });
});
