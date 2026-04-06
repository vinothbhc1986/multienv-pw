import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CheckoutCompletePage } from 'tests/pages/CheckoutCompletePage';
import { CheckoutOverviewPage } from 'tests/pages/CheckoutOverviewPage';

//import {test} from '@playwright/test';
type MyFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  checkoutCompletePage: CheckoutCompletePage;
  checkoutOverviewPage: CheckoutOverviewPage;
};

export const test = base.extend<MyFixtures>({
  page: async ({ page }, use) => {
    // Forcefully disable all transitions and animations via global CSS injection
    await page.addInitScript(`
      if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.setAttribute('data-test', 'disable-animations');
        style.innerHTML = \`
          *, *::before, *::after {
            transition: none !important;
            animation: none !important;
            transition-duration: 0s !important;
            animation-duration: 0s !important;
          }
        \`;
        document.head.appendChild(style);
      }
    `);
    await use(page);
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },  
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
});