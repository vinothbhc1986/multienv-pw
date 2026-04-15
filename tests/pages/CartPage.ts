import { type Page, type Locator, expect, test } from '@playwright/test';

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
    await test.step('Proceed to checkout', async () => {
      await this.checkoutButton.click();
    });
  }

  async continueShopping() {
    await test.step('Continue shopping', async () => {
      await this.continueShoppingButton.click();
    });
  }

  async removeItem(productName: string) {
    await test.step(`Remove item ${productName} from cart`, async () => {
      const cartItem = this.page.locator('.cart_item').filter({ hasText: productName });
      await cartItem.getByRole('button', { name: /remove/i }).click();
    });
  }

  async expectItemInCart(productName: string) {
    await test.step(`Verify item ${productName} is in cart`, async () => {
      const cartItem = this.page.locator('.cart_item').filter({ hasText: productName });
      await expect(cartItem).toBeVisible();
    });
  }

  async expectItemNotInCart(productName: string) {
    await test.step(`Verify item ${productName} is not in cart`, async () => {
      const cartItem = this.page.locator('.cart_item').filter({ hasText: productName });
      await expect(cartItem).toHaveCount(0);
    });
  }

  async goto() {
    await test.step('Navigate to cart page', async () => {
      await this.page.goto('/cart.html');
    });
  }

  async expectEmptyCart() {
    await test.step('Verify cart is empty', async () => {
      await expect(this.page.locator('.cart_item')).toHaveCount(0);
    });
  }

  async expectUrl() {
    await expect(this.page).toHaveURL(/cart\.html$/);
  }
}
