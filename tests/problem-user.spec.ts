import { test, expect } from '@playwright/test';
import { InventoryPage } from './pages/InventoryPage';
import { LoginPage } from './pages/LoginPage';

import fs from 'fs';
import path from 'path';

const env = process.env.TEST_ENV || 'dev';
const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
const { problemUser, password } = testData.credentials;

test.describe('SauceDemo - Problem User Personas', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Problem user should experience sorting failures', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(problemUser, password);
    await inventoryPage.isLoaded();

    // The problem user fails to sort properly, it's a known simulated bug in the app.
    // Here we assert that sorting from Z to A actually fails to modify the list correctly
    // or we verify the bug behaves as expected for demonstration of catching bugs.
    
    // Original list
    const originalNames = await inventoryPage.getAllItemNames();

    await inventoryPage.sortItems('za');
    const newNames = await inventoryPage.getAllItemNames();

    // For problem_user, sorting throws no error but does not re-sort the DOM
    expect(newNames).toEqual(originalNames);
  });
});
