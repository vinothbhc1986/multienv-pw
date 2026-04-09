import { expect } from '@playwright/test';
import { test } from './fixtures/base';
import {
  PROTECTED_ROUTES,
} from './utils/constants';
import { getBlockedUrlRegex } from './utils/regex';

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
});

