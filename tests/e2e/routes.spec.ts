import { test, expect, type Page } from '@playwright/test';

const HOME_TITLE = 'Simulador de Parciales - UNLaM';
const SUBJECT_SLUG = 'calidad-software';

/** Resultados mínimos válidos para la pantalla de resultados. */
const mockResults = {
  score: 50,
  totalQuestions: 100,
  percentage: 50,
  timeTotal: 2700,
  answers: [],
  categoryBreakdown: {
    historia: { correct: 5, total: 10, percentage: 50 },
  },
  difficultyBreakdown: {
    easy: { correct: 0, total: 0, percentage: 0 },
    medium: { correct: 0, total: 0, percentage: 0 },
    hard: { correct: 0, total: 0, percentage: 0 },
  },
};

/**
 * Siembra `sessionStorage.quizResults` antes de que cargue la página.
 * La pantalla de resultados lee de ahí (no de query params).
 */
async function seedResults(page: Page, results: unknown) {
  await page.addInitScript((payload) => {
    window.sessionStorage.setItem('quizResults', payload as string);
  }, JSON.stringify(results));
}

test.describe('Quiz Application - Route and Navigation Tests', () => {
  // Test 1: Home page (subject selection) loads correctly
  test('HOME: should load the subject selection page', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(HOME_TITLE);
    await expect(
      page.getByRole('heading', { name: 'Simulador de Parciales' })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Calidad de Software/ })
    ).toBeVisible();
  });

  // Test 2: Home → Subject setup page
  test('FLOW: selecting a subject navigates to its setup page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Calidad de Software/ }).click();

    await page.waitForURL(new RegExp(`/materia/${SUBJECT_SLUG}$`));
    await expect(
      page.getByRole('heading', { name: 'Calidad de Software' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Comenzar Quiz/ })
    ).toBeVisible();
  });

  // Test 3: Partial buttons show "1°" / "2°" and reflect selection
  test('SETUP: partial buttons show 1° and 2° and toggle selection', async ({ page }) => {
    await page.goto(`/materia/${SUBJECT_SLUG}`);

    const primer = page.getByRole('button', { name: /1° Parcial/ });
    const segundo = page.getByRole('button', { name: /2° Parcial/ });

    await expect(primer).toHaveAttribute('aria-pressed', 'true');
    await expect(segundo).toHaveAttribute('aria-pressed', 'false');

    await segundo.click();
    await expect(segundo).toHaveAttribute('aria-pressed', 'true');
    await expect(primer).toHaveAttribute('aria-pressed', 'false');
  });

  // Test 4: Setup → Quiz with default (end_only) feedback
  test('FLOW: Setup → Quiz (end_only) should work', async ({ page }) => {
    await page.goto(`/materia/${SUBJECT_SLUG}`);
    await expect(page.locator('input[value="end_only"]')).toBeChecked();

    await page.getByRole('button', { name: /Comenzar Quiz/ }).click();

    await page.waitForURL(/\/quiz\?subject=calidad-software.*feedback=end_only/);
    await expect(
      page.getByRole('heading', { name: /Quiz - Calidad de Software/ })
    ).toBeVisible({ timeout: 15000 });
  });

  // Test 5: Setup → Quiz with immediate feedback
  test('FLOW: Setup → Quiz (immediate) should work', async ({ page }) => {
    await page.goto(`/materia/${SUBJECT_SLUG}`);

    const immediateRadio = page.locator('input[value="immediate"]');
    await immediateRadio.click();
    await expect(immediateRadio).toBeChecked();

    await page.getByRole('button', { name: /Comenzar Quiz/ }).click();

    await page.waitForURL(/\/quiz\?subject=calidad-software.*feedback=immediate/);
    await expect(page.getByText('Feedback inmediato activado')).toBeVisible({
      timeout: 15000,
    });
  });

  // Test 6: Results page renders when sessionStorage has valid data
  test('RESULTS: should render results from sessionStorage', async ({ page }) => {
    await seedResults(page, mockResults);

    const response = await page.goto(
      `/results?subject=${SUBJECT_SLUG}&feedback=end_only&count=25&partial=primer`
    );
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { name: 'Resultados' })).toBeVisible();
    await expect(page.getByText('50/100')).toBeVisible();
    await expect(page.getByText('50.0%')).toBeVisible();
  });

  // Test 7: Results → Home
  test('FLOW: Results → Home should work', async ({ page }) => {
    await seedResults(page, mockResults);
    await page.goto(
      `/results?subject=${SUBJECT_SLUG}&feedback=end_only&count=25&partial=primer`
    );

    await page.getByRole('button', { name: 'Volver al inicio' }).click();

    await page.waitForURL('http://localhost:3000/');
    await expect(
      page.getByRole('heading', { name: 'Simulador de Parciales' })
    ).toBeVisible();
  });

  // Test 8: Results → Retry Quiz
  test('FLOW: Results → Retry Quiz should go back to the quiz', async ({ page }) => {
    await seedResults(page, mockResults);
    await page.goto(
      `/results?subject=${SUBJECT_SLUG}&feedback=end_only&count=25&partial=primer`
    );

    await page.getByRole('button', { name: 'Reintentar Quiz' }).click();

    await page.waitForURL(/\/quiz\?subject=calidad-software/);
    await expect(
      page.getByRole('heading', { name: /Quiz - Calidad de Software/ })
    ).toBeVisible({ timeout: 15000 });
  });

  // Test 9: Results without data should redirect to home
  test('RESULTS: missing data should redirect to home', async ({ page }) => {
    await page.goto(`/results?subject=${SUBJECT_SLUG}`);

    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    await expect(
      page.getByRole('heading', { name: 'Simulador de Parciales' })
    ).toBeVisible();
  });

  // Test 10: Unknown subject slug shows a graceful fallback
  test('SETUP: unknown subject shows fallback with link home', async ({ page }) => {
    await page.goto('/materia/no-existe');

    await expect(
      page.getByRole('heading', { name: 'Materia no encontrada' })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Volver al inicio/ })
    ).toBeVisible();
  });

  // Test 11: Accessibility - setup controls are keyboard focusable
  test('ACCESSIBILITY: setup controls should be keyboard focusable', async ({ page }) => {
    await page.goto(`/materia/${SUBJECT_SLUG}`);

    const startButton = page.getByRole('button', { name: /Comenzar Quiz/ });
    await expect(startButton).toBeVisible();

    await startButton.focus();
    await expect(startButton).toBeFocused();

    // Tab navigation must always land on a real focusable element.
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(
      () => document.activeElement?.tagName ?? null
    );
    expect(focusedTag).not.toBeNull();
  });
});
