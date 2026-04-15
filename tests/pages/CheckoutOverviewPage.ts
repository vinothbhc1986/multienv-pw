import { type Page, type Locator, expect, test } from '@playwright/test';
import { CheckoutCompletePage } from './CheckoutCompletePage';

export class CheckoutOverviewPage {
  readonly pageTitle: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly inventoryItems: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;

  constructor(private readonly page: Page) {
    this.pageTitle = page.getByText('Checkout: Overview');
    this.finishButton = page.getByRole('button', { name: /finish/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.inventoryItems = page.locator('.cart_item');
    this.subtotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
  }

  async isLoaded() {
    await expect(this.pageTitle).toBeVisible();
  }

  async clickFinish(): Promise<CheckoutCompletePage> {
    await this.finishButton.click();
    return new CheckoutCompletePage(this.page);
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async getSubtotal(): Promise<number> {
    const text = await this.subtotalLabel.innerText();
    return parseFloat(text.replace('Item total: $', ''));
  }

  async getTax(): Promise<number> {
    const text = await this.taxLabel.innerText();
    return parseFloat(text.replace('Tax: $', ''));
  }

  async getTotal(): Promise<number> {
    const text = await this.totalLabel.innerText();
    return parseFloat(text.replace('Total: $', ''));
  }

  async getItemPrices(): Promise<number[]> {
    const prices = await this.page.locator('.inventory_item_price').allInnerTexts();
    return prices.map(p => parseFloat(p.replace('$', '')));
  }

  async expectCorrectTotal() {
    await test.step('Verify subtotal, tax, and total values', async () => {
      const itemPrices = await this.getItemPrices();
      const subtotal = itemPrices.reduce((sum, p) => sum + p, 0);
      const displayedSubtotal = await this.getSubtotal();
      expect.soft(displayedSubtotal).toBeCloseTo(subtotal, 2);

      const tax = await this.getTax();
      const total = await this.getTotal();
      
      expect.soft(total).toBeCloseTo(subtotal + tax, 2);
    });
  }

  async expectUrl() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html$/);
  }
}
