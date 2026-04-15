import { type Page, type Locator, expect, test } from '@playwright/test';
import { HeaderComponent } from './components/HeaderComponent';

export class InventoryPage {
  readonly pageTitle: Locator;
  readonly header: HeaderComponent;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.pageTitle = page.getByText('Products');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
  }

  async isLoaded() {
    await expect(this.pageTitle).toBeVisible();
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  async expectUrl() {
    await expect(this.page).toHaveURL(/inventory\.html$/);
  }

  async addProductToCart(productName: string) {
    await test.step(`Adding product ${productName} to cart`, async () => {
      const productCard = this.page
        .locator('.inventory_item')
        .filter({ hasText: productName });
      await expect(productCard).toBeVisible();
      await productCard.getByRole('button', { name: /add to cart/i }).click();
    });
  }

  async goToCart() {
    await this.header.goToCart();
  }

  async sortItems(option: string) {
    await this.page.getByRole('combobox').selectOption(option);
  }

  async getFirstItemPrice(): Promise<number> {
    const priceText = await this.itemPrices.first().innerText();
    return parseFloat(priceText.replace('$', ''));
  }

  async getFirstItemName(): Promise<string> {
    return await this.itemNames.first().innerText();
  }

  async getAllItemPrices(): Promise<number[]> {
    const pricesText = await this.itemPrices.allInnerTexts();
    return pricesText.map(p => parseFloat(p.replace('$', '')));
  }

  async getAllItemNames(): Promise<string[]> {
    return this.itemNames.allInnerTexts();
  }

  async openItemDetails(productName: string) {
    const itemLink = this.itemNames.filter({ hasText: productName }).first();
    await expect(itemLink).toHaveText(productName);
    await itemLink.click();
  }

  async expectAddToCartButtonVisible(productName: string) {
    const productCard = this.page.locator('.inventory_item').filter({ hasText: productName });
    await expect(productCard.getByRole('button', { name: /add to cart/i })).toBeVisible();
  }

  async expectRemoveButtonVisible(productName: string) {
    const productCard = this.page.locator('.inventory_item').filter({ hasText: productName });
    await expect(productCard.getByRole('button', { name: /remove/i })).toBeVisible();
  }

  async removeProductFromCart(productName: string) {
    const productCard = this.page.locator('.inventory_item').filter({ hasText: productName });
    await expect(productCard).toBeVisible();
    await productCard.getByRole('button', { name: /remove/i }).click();
  }

  async expectDetailsUrl() {
    await expect(this.page).toHaveURL(/inventory-item\.html\?id=\d+$/);
  }

  async expectCartBadgeCount(count: string) {
    await expect(this.header.cartBadge).toHaveText(count);
  }

  async expectNoCartBadge() {
    await expect(this.header.cartBadge).not.toBeVisible();
  }
}
