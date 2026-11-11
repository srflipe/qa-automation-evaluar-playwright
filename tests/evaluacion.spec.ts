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

    // Acceso al área autenticada: listado de evaluaciones del proceso
    await expect(page).toHaveURL(/\/process\//);
    await expect(processPage.notStartedTab).toBeVisible();
    await expect(processPage.finishedTab).toBeVisible();
  });

  test('2. Prueba matricial: Personalidad', async () => {
    test.setTimeout(5 * 60_000);
    const processPage = new ProcessPage(page);
    const personality = new PersonalityTestPage(page);

    await processPage.notStartedTab.click();
    await processPage.personalityTestButton.click();
    await personality.start();
    await personality.answerAllQuestions();

    // Al finalizar, la plataforma vuelve al listado con la siguiente prueba disponible
    await expect(page).toHaveURL(/\/process\//);
    await expect(processPage.teleworkTestButton).toBeVisible();
  });

  test('3. Prueba de selección múltiple: Teletrabajo', async () => {
    test.setTimeout(5 * 60_000);
    const processPage = new ProcessPage(page);
    const telework = new TeleworkTestPage(page);

    await processPage.teleworkTestButton.click();
    await telework.start();
    await telework.answerAllQuestions();

    // Al finalizar, la plataforma vuelve al listado de evaluaciones
    await expect(page).toHaveURL(/\/process\//);
  });

  test('4. Estado final: ambas evaluaciones en "Finalizadas"', async () => {
    const processPage = new ProcessPage(page);
    await processPage.expectTestsFinished(['Personalidad', 'Teletrabajo']);
  });
});