import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProcessPage } from '../pages/ProcessPage';
import { PersonalityTestPage } from '../pages/PersonalityTestPage';
import { TeleworkTestPage } from '../pages/TeleworkTestPage';

test.describe.configure({ mode: 'serial' });

test.describe('Flujo de evaluación del candidato', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. Login con credenciales válidas', async () => {
    const loginPage = new LoginPage(page);
    const processPage = new ProcessPage(page);

    await loginPage.goto();
    await expect(loginPage.emailInput).toBeVisible();
    await loginPage.login(process.env.CANDIDATE_EMAIL!);

    // Acceso al área autenticada: listado de pruebas del proceso
    await expect(page).toHaveURL(/\/process\//);
    await expect(processPage.personalityTestButton).toBeVisible();
    await expect(processPage.teleworkTestButton).toBeVisible();
  });

  test('2. Prueba matricial: Personalidad', async () => {
    test.setTimeout(5 * 60_000);
    const processPage = new ProcessPage(page);
    const personality = new PersonalityTestPage(page);

    await processPage.personalityTestButton.click();
    await personality.start();
    await personality.answerAllQuestions();

    // Estado final: aparece en "Finalizadas" con estado "Finalizada"
    await processPage.expectTestFinished('Personalidad');
  });

  test('3. Prueba de selección múltiple: Teletrabajo', async () => {
    test.setTimeout(5 * 60_000);
    const processPage = new ProcessPage(page);
    const telework = new TeleworkTestPage(page);

    await processPage.goto();
    await processPage.teleworkTestButton.click();
    await telework.start();
    await telework.answerAllQuestions();

    // Estado final: aparece en "Finalizadas" con estado "Finalizada"
    await processPage.expectTestFinished('Teletrabajo');
  });
});