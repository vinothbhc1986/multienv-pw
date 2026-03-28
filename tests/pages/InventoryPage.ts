import { type Page, type Locator, expect } from '@playwright/test';

export class InventoryPage {
  readonly cartIcon: Locator;
  readonly pageTitle: Locator;

  constructor(private readonly page: Page) {
    this.cartIcon = page.locator('.shopping_cart_link');
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
    await this.page.locator('.product_sort_container').selectOption(option);
  }

  async getFirstItemPrice(): Promise<number> {
    const priceText = await this.page.locator('.inventory_item_price').first().innerText();
    return parseFloat(priceText.replace('$', ''));
  }
}
