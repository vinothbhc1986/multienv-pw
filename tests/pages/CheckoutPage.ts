import { type Page, type Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly confirmationHeader: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.postalCodeInput = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: /continue/i });
    this.finishButton = page.getByRole('button', { name: /finish/i });
    this.confirmationHeader = page.getByText('Thank you for your order!');
    this.errorMessage = page.locator('[data-test="error"]');
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
    await expect.soft(this.confirmationHeader).toBeVisible();
  }

  async expectErrorMessage(message: string) {
    await expect.soft(this.errorMessage).toBeVisible();
    await expect.soft(this.errorMessage).toHaveText(message);
  }
}
