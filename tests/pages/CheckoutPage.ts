import { type Page, type Locator, expect, test } from '@playwright/test';

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
    await test.step(`Fill checkout details: ${firstName} ${lastName}, ${postalCode}`, async () => {
      await this.firstNameInput.fill(firstName);
      await this.lastNameInput.fill(lastName);
      await this.postalCodeInput.fill(postalCode);
    });
  }

  async clickContinue() {
    await test.step('Click continue button', async () => {
      await this.continueButton.click();
    });
  }

  async clickFinish() {
    await test.step('Click finish button', async () => {
      await this.finishButton.click();
    });
  }

  async expectOrderConfirmed() {
    await test.step('Verify order is confirmed', async () => {
      await expect(this.confirmationHeader).toBeVisible();
    });
  }

  async clickCancel() {
    await test.step('Click cancel button', async () => {
      await this.cancelButton.click();
    });
  }

  async expectErrorMessage(message: string) {
    await test.step(`Verify error message: ${message}`, async () => {
      await expect(this.errorMessage).toBeVisible();
      await expect(this.errorMessage).toHaveText(message);
    });
  }

  async expectCheckoutStepTwoUrl() {
    await test.step('Verify checkout step two URL', async () => {
      await expect(this.page).toHaveURL(/checkout-step-two\.html$/);
    });
  }
}
