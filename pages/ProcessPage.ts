import { Page, Locator, expect } from '@playwright/test';

export class ProcessPage {
  readonly page: Page;
  readonly personalityTestButton: Locator;
  readonly teleworkTestButton: Locator;
  readonly notStartedTab: Locator;
  readonly finishedTab: Locator;
  readonly finishedPanel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.personalityTestButton = page.getByRole('button', { name: /^Personalidad/ });
    this.teleworkTestButton = page.getByRole('button', { name: /^Teletrabajo/ });
    this.notStartedTab = page.getByRole('tab', { name: 'Sin iniciar' });
    this.finishedTab = page.getByRole('tab', { name: 'Finalizadas' });
    this.finishedPanel = page.getByRole('tabpanel', { name: 'Finalizadas' });
  }

  /** Abre la pestaña "Finalizadas" y verifica que cada prueba aparece con estado "Finalizada" */
  async expectTestsFinished(testNames: string[]) {
    await this.finishedTab.click();
    await expect(this.finishedTab).toHaveAttribute('aria-selected', 'true');

    for (const testName of testNames) {
      await expect(this.finishedPanel.getByText(testName, { exact: true })).toBeVisible();
    }
    // Un estado "Finalizada" por cada prueba
    await expect(this.finishedPanel.getByText('Finalizada', { exact: true })).toHaveCount(testNames.length);
  }
}