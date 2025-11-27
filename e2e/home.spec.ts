import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/رابِط|Rabit/);
  });

  test('should display logo', async ({ page }) => {
    await page.goto('/');

    // The logo renders twice (header + hero), so target the header instance only
    const logo = page.locator('header img[alt*="Rabit"], header img[alt*="راب"]').first();
    await expect(logo).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation menu
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');
    
    // Basic accessibility check
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang');
  });
});

test.describe('Customer Experience Enhancements', () => {
  test('allows controlling the guided mini tour', async ({ page }) => {
    await page.goto('/');

    const guidedSection = page.getByTestId('guided-demo-section');
    await guidedSection.scrollIntoViewIfNeeded();
    await expect(guidedSection).toBeVisible();

    const stage = guidedSection.getByTestId('guided-demo-stage');
    const toggle = guidedSection.getByTestId('guided-demo-toggle');
    const automationChapter = guidedSection.getByTestId('guided-demo-chapter-automation-cards');

    await automationChapter.click();
    await expect(stage).toHaveAttribute('data-active-chapter-id', 'automation-cards');

    await toggle.click();
    const initialChapter = await stage.getAttribute('data-active-chapter-id');
    await expect.poll(async () => stage.getAttribute('data-active-chapter-id'), {
      message: 'Guided tour should advance automatically while playing',
      timeout: 8000,
    }).not.toBe(initialChapter);
  });

  test('renders the live CX metrics dashboard', async ({ page }) => {
    await page.goto('/');

    const metricsSection = page.getByTestId('live-metrics-section');
    await metricsSection.scrollIntoViewIfNeeded();
    await expect(metricsSection).toBeVisible();

    const cards = metricsSection.getByTestId('live-metric-card');
    await expect(cards).toHaveCount(4);
    await expect(cards.first()).toContainText(/مباشر الآن|Live now/);

    const summaryOutput = metricsSection.locator('output[aria-live="polite"]');
    await expect(summaryOutput).toContainText(/ملخص المؤشرات الحية|Live metrics summary/);
  });
});

test.describe('PWA Features', () => {
  test('should register service worker', async ({ page }) => {
    await page.goto('/');
    
    // Wait for service worker registration
    const sw = await page.evaluate(() => {
      return navigator.serviceWorker.ready.then(() => true);
    });
    
    expect(sw).toBe(true);
  });

  test('should have manifest', async ({ page }) => {
    await page.goto('/');
    
    // Check for manifest link
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toBeAttached();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Page should still be accessible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load in reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
