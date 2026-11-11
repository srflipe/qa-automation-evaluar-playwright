import { Page, Locator, expect } from '@playwright/test';

export class TeleworkTestPage {
  readonly page: Page;
  readonly startButton: Locator;
  readonly continueButton: Locator;
  readonly nextButton: Locator;
  readonly finishButton: Locator;
  readonly options: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startButton = page.getByRole('button', { name: 'Iniciar' });
    this.continueButton = page.getByRole('button', { name: 'Continuar' });
    this.nextButton = page.getByRole('button', { name: 'Siguiente' });
    this.finishButton = page.getByRole('button', { name: 'Finalizar' });
    this.options = page.getByRole('radiogroup').getByRole('radio');
  }

  async start() {
    await this.startButton.click();
    await this.continueButton.click();
  }

  /** Marca la primera opción de la pregunta visible y valida la selección. Devuelve su id (ej: TEL11_Q1_A1). */
  async answerCurrentQuestion(): Promise<string> {
    const option = this.options.first();
    await expect(option).toBeVisible();
    const optionId = (await option.getAttribute('id'))!;

    await option.click();
    await expect(this.page.locator(`[id="${optionId}"]`)).toBeChecked(); // valida la selección
    return optionId;
  }

  /** Responde preguntas hasta que aparece "Finalizar"; luego finaliza y vuelve al listado. */
  async answerAllQuestions(maxQuestions = 11) {
    for (let i = 0; i < maxQuestions; i++) {
      const answeredId = await this.answerCurrentQuestion();

      await expect(this.nextButton.or(this.finishButton).first()).toBeVisible();
      if (await this.finishButton.isVisible()) {
        await this.finishButton.click();
        await this.continueButton.click();
        return;
      }

      await this.nextButton.click();
      // Espera a que cargue la siguiente pregunta (sin esperas fijas)
      await expect(this.options.first()).not.toHaveId(answeredId);
    }
    throw new Error(`La prueba no finalizó tras ${maxQuestions} preguntas`);
  }
}