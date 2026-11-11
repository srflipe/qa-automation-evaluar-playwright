import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly loginWithUserLink: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginWithUserLink = page.getByRole('link', { name: 'Ingresar con tu usuario' });
    this.emailInput = page.getByRole('textbox', { name: /^Email o número de/ });
    this.submitButton = page.getByRole('button', { name: 'Ingresar' });
  }

  async goto() {
    await this.page.goto(`/auth/autoregister/controlled/${process.env.PROCESS_ID}`);
    await this.loginWithUserLink.click();
  }

  async login(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }
}