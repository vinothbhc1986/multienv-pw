import { type Page, type Locator, expect } from '@playwright/test';
import { CheckoutOverviewPage } from './CheckoutOverviewPage';

export class CheckoutStepOnePage {
  readonly pageTitle: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.pageTitle = page.getByText('Checkout: Your Information');
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.postalCodeInput = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: /continue/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async isLoaded() {
    await expect(this.pageTitle).toBeVisible();
  }

  async fillDetails(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async clickContinue(): Promise<CheckoutOverviewPage> {
    await this.continueButton.click();
    return new CheckoutOverviewPage(this.page);
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(message);
  }

  async goto() {
    await this.page.goto('/checkout-step-one.html');
  }
}
