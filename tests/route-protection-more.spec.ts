import { expect } from '@playwright/test';
import { test } from './fixtures/base';
import fs from 'fs';
import path from 'path';
import {
  PROTECTED_ROUTES,
} from './utils/constants';
import { getBlockedUrlRegex } from './utils/regex';

const env = process.env.TEST_ENV || 'dev';
const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

test.describe('SauceDemo - Additional Route Protection @regression', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    '[TC-34] should block direct access to all additional protected routes when not authenticated',
    async ({ page, loginPage }) => {
      for (const { url } of PROTECTED_ROUTES) {
        const blockedUrlRegex = getBlockedUrlRegex(url);
        await page.goto('/'+url);
        await loginPage.isLoaded();
        await expect(page).not.toHaveURL(blockedUrlRegex);
      }
    },
  );

  test('[TC-43] should block deep link with query/hash when unauthenticated and allow inventory after login', async ({
    page,
    loginPage,
    inventoryPage,
  }) => {
    await page.goto('/checkout-step-two.html?source=direct#summary');
    await loginPage.isLoaded();
    await expect(page).not.toHaveURL(/checkout-step-two\.html/);

    await loginPage.login(testData.credentials.username, testData.credentials.password);
    await inventoryPage.isLoaded();
    await inventoryPage.expectUrl();
  });
});

