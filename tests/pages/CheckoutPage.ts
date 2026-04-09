import { type Page, type Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly confirmationHeader: Locator;
  readonly errorMessage: Locator;
  readonly cancelButton: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.postalCodeInput = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: /continue/i });
    this.finishButton = page.getByRole('button', { name: /finish/i });
    this.confirmationHeader = page.getByText('Thank you for your order!');
    this.errorMessage = page.locator('[data-test="error"]');
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
  }

  async isLoaded() {
    await expect(this.firstNameInput).toBeVisible();
  }

  async fillDetails(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async clickFinish() {
    await this.finishButton.click();
  }

  async expectOrderConfirmed() {
   // Prefer expect over expect.soft for functional checks (fail-fast makes debugging easier):
    await expect(this.confirmationHeader).toBeVisible();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(message);
  }

  async expectCheckoutStepTwoUrl() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html$/);
  }
}
