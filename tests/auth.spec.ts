import { expect } from '@playwright/test';
import { test } from './fixtures/base';

test.describe('SauceDemo - Auth & Route Protection @regression', () => {
  test.describe('Unauthenticated', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('[TC-24] should block direct access to inventory when not authenticated', async ({ page, loginPage }) => {
      await page.goto('/inventory.html');
      await loginPage.isLoaded();
      await expect(page).not.toHaveURL(/inventory\.html$/);
    });

    test('[TC-25] should block direct access to cart when not authenticated', async ({ page, loginPage }) => {
      await page.goto('/cart.html');
      await loginPage.isLoaded();
      await expect(page).not.toHaveURL(/cart\.html$/);
    });
  });

  test('[TC-26] should allow logout and block protected routes afterwards', async ({
    page,
    inventoryPage,
    loginPage,
  }) => {
    await inventoryPage.goto();
    await inventoryPage.isLoaded();

    await inventoryPage.header.logout();
    await loginPage.isLoaded();

    await page.goto('/inventory.html');
    await loginPage.isLoaded();
    await expect(page).not.toHaveURL(/inventory\.html$/);
  });

  test('[TC-27] should require login if auth cookies are cleared mid-session', async ({
    page,
    inventoryPage,
    loginPage,
  }) => {
    await inventoryPage.goto();
    await inventoryPage.isLoaded();

    await page.context().clearCookies();
    await page.goto('/inventory.html');

    await loginPage.isLoaded();
    await expect(page).not.toHaveURL(/inventory\.html$/);
  });
});

