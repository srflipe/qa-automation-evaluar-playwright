import { Page, Locator, expect } from '@playwright/test';

export class ProcessPage {
  readonly page: Page;
  readonly personalityTestButton: Locator;
  readonly teleworkTestButton: Locator;
  readonly finishedTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.personalityTestButton = page.getByRole('button', { name: /^Personalidad/ });
    this.teleworkTestButton = page.getByRole('button', { name: /^Teletrabajo/ });
    this.finishedTab = page.getByRole('tab', { name: /^Finalizadas/ }); // ⚠️ confirmar
  }

  /** Vuelve al listado de pruebas (pestaña por defecto: pendientes) */
  async goto() {
    await this.page.goto(`/process/${process.env.PROCESS_ID}`);
  }

  /** Verifica que la prueba aparece en la pestaña "Finalizadas" con estado "Finalizada" */
  async expectTestFinished(testName: string) {
    await this.finishedTab.click();
    const card = this.page.getByRole('button', { name: new RegExp(`^${testName}`) }); // ⚠️ confirmar
    await expect(card).toBeVisible();
    await expect(card).toContainText('Finalizada');
  }
}