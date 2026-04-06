import { type Page, type Locator, expect } from '@playwright/test';
import { HeaderComponent } from './components/HeaderComponent';

export class InventoryPage {
  readonly pageTitle: Locator;
  readonly header: HeaderComponent;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.pageTitle = page.getByText('Products');
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
    const productCard = this.page
      .locator('.inventory_item')
      .filter({ hasText: productName });
    await expect(productCard).toBeVisible();
    await productCard.getByRole('button', { name: /add to cart/i }).click();
  }

  async goToCart() {
    await this.header.goToCart();
  }

  async sortItems(option: string) {
    await this.page.getByRole('combobox').selectOption(option);
  }

  async getFirstItemPrice(): Promise<number> {
    const priceText = await this.page.locator('.inventory_item_price').first().innerText();
    return parseFloat(priceText.replace('$', ''));
  }

  async getFirstItemName(): Promise<string> {
    return await this.page.locator('.inventory_item_name').first().innerText();
  }

  async expectCartBadgeCount(count: string) {
    await expect(this.header.cartBadge).toHaveText(count);
  }

  async expectNoCartBadge() {
    await expect(this.header.cartBadge).not.toBeVisible();
  }
}
