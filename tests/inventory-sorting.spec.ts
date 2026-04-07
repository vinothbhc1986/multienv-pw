import { expect } from '@playwright/test';
import { test } from './fixtures/base';

function isSortedAsc(values: number[]) {
  for (let i = 1; i < values.length; i++) {
    if (values[i] < values[i - 1]) return false;
  }
  return true;
}

function isSortedDesc(values: number[]) {
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) return false;
  }
  return true;
}

function isSortedLexAsc(values: string[]) {
  for (let i = 1; i < values.length; i++) {
    if (values[i].localeCompare(values[i - 1]) < 0) return false;
  }
  return true;
}

function isSortedLexDesc(values: string[]) {
  for (let i = 1; i < values.length; i++) {
    if (values[i].localeCompare(values[i - 1]) > 0) return false;
  }
  return true;
}

test.describe('SauceDemo - Inventory Sorting (full-list assertions) @regression', () => {
  test('[TC-30] should sort prices low-to-high for the full list', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.isLoaded();

    await inventoryPage.sortItems('lohi');
    await expect
      .poll(async () => isSortedAsc(await inventoryPage.getAllItemPrices()))
      .toBe(true);
  });

  test('[TC-31] should sort prices high-to-low for the full list', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.isLoaded();

    await inventoryPage.sortItems('hilo');
    await expect
      .poll(async () => isSortedDesc(await inventoryPage.getAllItemPrices()))
      .toBe(true);
  });

  test('[TC-32] should sort names A-to-Z for the full list', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.isLoaded();

    await inventoryPage.sortItems('az');
    await expect
      .poll(async () => isSortedLexAsc(await inventoryPage.getAllItemNames()))
      .toBe(true);
  });

  test('[TC-33] should sort names Z-to-A for the full list', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.isLoaded();

    await inventoryPage.sortItems('za');
    await expect
      .poll(async () => isSortedLexDesc(await inventoryPage.getAllItemNames()))
      .toBe(true);
  });
});

