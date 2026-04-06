import { type Page, type Locator, expect } from '@playwright/test';

export class CheckoutCompletePage {
  readonly pageTitle: Locator;
  readonly confirmationHeader: Locator;
  readonly backToProductsButton: Locator;

  constructor(private readonly page: Page) {
    this.pageTitle = page.getByText('Checkout: Complete!');
    this.confirmationHeader = page.getByText('Thank you for order!');
    this.backToProductsButton = page.getByRole('button', { name: /back home/i });
  }

  async isLoaded() {
    await expect(this.pageTitle).toBeVisible();
  }

  async expectOrderConfirmed() {
    await expect(this.confirmationHeader).toBeVisible();
  }

  async clickBackHome() {
    await this.backToProductsButton.click();
  }
}
