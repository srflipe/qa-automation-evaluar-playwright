import { Page, Locator, expect } from '@playwright/test';

export class PersonalityTestPage {
  readonly page: Page;
  readonly startButton: Locator;
  readonly continueButton: Locator;
  readonly nextButton: Locator;
  readonly finishButton: Locator;
  readonly matrixOptions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startButton = page.getByRole('button', { name: 'Iniciar' });
    this.continueButton = page.getByRole('button', { name: 'Continuar' });
    this.nextButton = page.getByRole('button', { name: 'Siguiente' });
    this.finishButton = page.getByRole('button', { name: 'Finalizar' });
    // Solo opciones de escritorio: cada fila tiene una copia oculta para móvil (id terminado en "-mobile")
    this.matrixOptions = page.locator('[role="radio"][id*="-SC_ORD_"]:not([id$="-mobile"])');
  }

  async start() {
    await this.startButton.click();
    await this.continueButton.click();
  }

  /** Responde la pregunta visible con el patrón diagonal. Devuelve el id de la pregunta (ej: SER15_Q1). */
  async answerCurrentQuestion(): Promise<string> {
    await expect(this.matrixOptions.first()).toBeVisible();
    const ids = await this.matrixOptions.evaluateAll(els => els.map(e => e.id));

    // "SER15_Q1_SQ2-SC_ORD_3" → fila "SER15_Q1_SQ2", columna 3
    const rows = new Map<string, string[]>();
    for (const id of ids) {
      const [rowKey] = id.split('-SC_ORD_');
      rows.set(rowKey, [...(rows.get(rowKey) ?? []), id]);
    }

    const byTrailingNumber = (a: string, b: string) =>
      Number(a.match(/(\d+)$/)![1]) - Number(b.match(/(\d+)$/)![1]);
    const rowKeys = [...rows.keys()].sort(byTrailingNumber);

    // Mismo patrón en todas las preguntas: fila 1 → columna 1, fila 2 → columna 2...
    for (const [index, rowKey] of rowKeys.entries()) {
      const columns = rows.get(rowKey)!.sort(byTrailingNumber);
      const option = this.page.locator(`[id="${columns[index]}"]`);
      await option.click();
      await expect(option).toBeChecked(); // valida la selección
    }

    return rowKeys[0].split('_SQ')[0];
  }

  /** Responde preguntas hasta que aparece "Finalizar"; luego finaliza y vuelve al listado. */
  async answerAllQuestions(maxQuestions = 8) {
    for (let i = 0; i < maxQuestions; i++) {
      const questionId = await this.answerCurrentQuestion();

      await expect(this.nextButton.or(this.finishButton).first()).toBeVisible();
      if (await this.finishButton.isVisible()) {
        await this.finishButton.click();
        await this.continueButton.click();
        return;
      }

      await this.nextButton.click();
      // Espera a que cargue la siguiente pregunta (sin esperas fijas)
      await expect(this.matrixOptions.first()).not.toHaveId(new RegExp(`^${questionId}_`));
    }
    throw new Error(`La prueba no finalizó tras ${maxQuestions} preguntas`);
  }
}