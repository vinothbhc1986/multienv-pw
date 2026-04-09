import { expect } from '@playwright/test';
import { test } from './fixtures/base';
import {
  UNAUTHENTICATED_ROUTE_CASES,
} from './utils/constants';
import { getBlockedUrlRegex } from './utils/regex';

test.describe('SauceDemo - Additional Route Protection @regression', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    '[TC-34] should block direct access to all additional protected routes when not authenticated',
    async ({ page, loginPage }) => {
      for (const { url } of UNAUTHENTICATED_ROUTE_CASES) {
        const blockedUrlRegex = getBlockedUrlRegex(url);
        await page.goto('/'+url);
        await loginPage.isLoaded();
        await expect(page).not.toHaveURL(blockedUrlRegex);
      }
    },
  );
});

