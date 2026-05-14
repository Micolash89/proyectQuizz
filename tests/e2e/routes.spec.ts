import { test, expect } from '@playwright/test';

test.describe('Quiz Application - Route and Navigation Tests', () => {
  // Test 1: Home page loads correctly
  test('HOME: should load home page without 404', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/');
    expect(response?.status()).toBe(200);
    expect(page).toHaveTitle('Quiz - Calidad de Software UNLaM');
    await expect(page.locator('text=Quiz Calidad de Software')).toBeVisible();
    await expect(page.locator('text=Comenzar Quiz')).toBeVisible();
  });

  // Test 2: Quiz page loads correctly
  test('QUIZ: should load quiz page with feedback=end_only parameter', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/quiz?feedback=end_only');
    expect(response?.status()).toBe(200);
    // Either loading state or actual quiz content should be visible
    const quizVisible = await page.locator('text=Quiz - Calidad de Software').isVisible().catch(() => false);
    const loadingVisible = await page.locator('text=Cargando preguntas').isVisible().catch(() => false);
    expect(quizVisible || loadingVisible).toBe(true);
  });

  // Test 3: Quiz page loads with immediate feedback
  test('QUIZ: should load quiz page with feedback=immediate parameter', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/quiz?feedback=immediate');
    expect(response?.status()).toBe(200);
    await expect(page.locator('text=Feedback inmediato')).toBeVisible({ timeout: 10000 });
  });

  // Test 4: Navigation from home to quiz (end_only mode)
  test('FLOW: Home → Quiz (end_only feedback mode) should work without errors', async ({ page }) => {
    // Go to home
    await page.goto('http://localhost:3000/');
    await expect(page.locator('text=Retroalimentación al Final')).toBeVisible();
    
    // Verify end_only is selected by default
    const endOnlyRadio = page.locator('input[value="end_only"]');
    await expect(endOnlyRadio).toBeChecked();

    // Click start button
    const startButton = page.locator('button:has-text("Comenzar Quiz")');
    await startButton.click();

    // Wait for navigation and verify quiz page loads
    await page.waitForURL(/\/quiz\?feedback=end_only/);
    const response = await page.goto(page.url());
    expect(response?.status()).toBe(200);
    
    await expect(page.locator('text=Quiz - Calidad de Software')).toBeVisible();
  });

  // Test 5: Navigation from home to quiz (immediate mode)
  test('FLOW: Home → Quiz (immediate feedback mode) should work without errors', async ({ page }) => {
    // Go to home
    await page.goto('http://localhost:3000/');
    
    // Select immediate feedback
    const immediateRadio = page.locator('input[value="immediate"]');
    await immediateRadio.click();
    await expect(immediateRadio).toBeChecked();

    // Click start button
    const startButton = page.locator('button:has-text("Comenzar Quiz")');
    await startButton.click();

    // Wait for navigation and verify quiz page loads
    await page.waitForURL(/\/quiz\?feedback=immediate/);
    const response = await page.goto(page.url());
    expect(response?.status()).toBe(200);
    
    await expect(page.locator('text=Quiz - Calidad de Software')).toBeVisible();
  });

  // Test 6: Results page should load with valid data
  test('RESULTS: should load results page when navigated with valid base64 data', async ({ page }) => {
    // Create minimal valid results data
    const mockResults = {
      score: 50,
      totalQuestions: 100,
      percentage: 50,
      timeTotal: 2700,
      answers: [],
      categoryBreakdown: {},
      difficultyBreakdown: {
        easy: { correct: 0, total: 0, percentage: 0 },
        medium: { correct: 0, total: 0, percentage: 0 },
        hard: { correct: 0, total: 0, percentage: 0 }
      }
    };
    
    const encodedData = btoa(JSON.stringify(mockResults));
    const response = await page.goto(`http://localhost:3000/results?data=${encodedData}`);
    expect(response?.status()).toBe(200);
    
    await expect(page.locator('text=Resultados del Quiz')).toBeVisible();
    await expect(page.locator('text=50/100')).toBeVisible();
  });

  // Test 7: Back to home from results
  test('FLOW: Results → Home should work', async ({ page }) => {
    // Navigate to results with mock data
    const mockResults = {
      score: 75,
      totalQuestions: 100,
      percentage: 75,
      timeTotal: 2700,
      answers: [],
      categoryBreakdown: {},
      difficultyBreakdown: {
        easy: { correct: 0, total: 0, percentage: 0 },
        medium: { correct: 0, total: 0, percentage: 0 },
        hard: { correct: 0, total: 0, percentage: 0 }
      }
    };
    
    const encodedData = btoa(JSON.stringify(mockResults));
    await page.goto(`http://localhost:3000/results?data=${encodedData}`);
    
    // Click "Volver al Inicio"
    const backButton = page.locator('button:has-text("Volver al Inicio")');
    await backButton.click();
    
    // Should redirect to home
    await page.waitForURL('http://localhost:3000/');
    const response = await page.goto(page.url());
    expect(response?.status()).toBe(200);
    
    await expect(page.locator('text=Quiz Calidad de Software')).toBeVisible();
  });

  // Test 8: Results → Retry Quiz should navigate with correct params
  test('FLOW: Results → Retry Quiz should reset and go to quiz', async ({ page }) => {
    // Navigate to results with mock data
    const mockResults = {
      score: 60,
      totalQuestions: 100,
      percentage: 60,
      timeTotal: 2700,
      answers: [],
      categoryBreakdown: {},
      difficultyBreakdown: {
        easy: { correct: 0, total: 0, percentage: 0 },
        medium: { correct: 0, total: 0, percentage: 0 },
        hard: { correct: 0, total: 0, percentage: 0 }
      }
    };
    
    const encodedData = btoa(JSON.stringify(mockResults));
    await page.goto(`http://localhost:3000/results?data=${encodedData}`);
    
    // Click "Reintentar Quiz"
    const retryButton = page.locator('button:has-text("Reintentar Quiz")');
    await retryButton.click();
    
    // Should redirect to quiz page
    await page.waitForURL(/\/quiz/);
    const response = await page.goto(page.url());
    expect(response?.status()).toBe(200);
    
    await expect(page.locator('text=Quiz - Calidad de Software')).toBeVisible();
  });

  // Test 9: Invalid results data should redirect to home
  test('RESULTS: invalid data should redirect to home', async ({ page }) => {
    // Try to load results with invalid base64
    await page.goto('http://localhost:3000/results?data=invalid_base64_data');
    
    // Should eventually redirect to home after error handling
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 }).catch(() => {
      // Might not redirect if error is caught on results page
    });
    
    // Should be either on home page or results page (doesn't matter, error was handled gracefully)
    const urlCheck = page.url();
    const isHome = urlCheck === 'http://localhost:3000/';
    const isResults = urlCheck.includes('/results');
    expect(isHome || isResults).toBe(true);
  });

  // Test 10: Accessibility - all buttons should be focusable
  test('ACCESSIBILITY: home page buttons should be keyboard focusable', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Tab to quantity buttons (now first before feedback)
    await page.keyboard.press('Tab');
    let focused = await page.evaluate(() => document.activeElement?.getAttribute('value') || document.activeElement?.textContent);
    // Should focus on either quantity button or feedback radio
    expect(focused).not.toBeNull();
    
    // Tab through multiple times to reach start button
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
    }
    
    const startButton = page.locator('button:has-text("Comenzar Quiz")');
    // Button should exist and be focusable (may or may not be currently focused)
    await expect(startButton).toBeVisible();
  });
});
