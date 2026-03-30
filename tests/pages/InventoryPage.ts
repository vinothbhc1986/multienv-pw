import { type Page, type Locator, expect } from '@playwright/test';

export class InventoryPage {
  readonly cartIcon: Locator;
  readonly pageTitle: Locator;

  constructor(private readonly page: Page) {
    this.cartIcon = page.getByTestId('shopping-cart-link');
    this.pageTitle = page.getByText('Products');
  }

  async isLoaded() {
    await expect(this.pageTitle).toBeVisible();
  }

  async addProductToCart(productName: string) {
    const productCard = this.page
      .locator('.inventory_item')
      .filter({ hasText: productName });
    await expect(productCard).toBeVisible();
    await productCard.getByRole('button', { name: /add to cart/i }).click();
  }

  async goToCart() {
    await this.cartIcon.click();
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
}
