import { type Page, type Locator, expect } from '@playwright/test';

export class CartPage {
  readonly checkoutButton: Locator;
  readonly pageTitle: Locator;
  readonly continueShoppingButton: Locator;

  constructor(private readonly page: Page) {
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.pageTitle = page.getByText('Your Cart');
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  async isLoaded() {
    await expect(this.pageTitle).toBeVisible();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async removeItem(productName: string) {
    const cartItem = this.page.locator('.cart_item').filter({ hasText: productName });
    await cartItem.getByRole('button', { name: /remove/i }).click();
  }

  async expectItemInCart(productName: string) {
    const cartItem = this.page.locator('.cart_item').filter({ hasText: productName });
    await expect(cartItem).toBeVisible();
  }

  async expectItemNotInCart(productName: string) {
    const cartItem = this.page.locator('.cart_item').filter({ hasText: productName });
    await expect(cartItem).toHaveCount(0);
  }
}
