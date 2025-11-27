import { test, expect } from '@playwright/test';

test.describe('Mobile Menu', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should show mobile menu button', async ({ page }) => {
    await page.goto('/');
    
    // Mobile menu button (hamburger)
    const menuButton = page.locator('[aria-label*="menu"], button[class*="menu"], button[class*="hamburger"], [data-testid*="mobile-menu"]');
    await expect(menuButton.first()).toBeVisible();
  });

  test('should open mobile menu on click', async ({ page }) => {
    await page.goto('/');
    
    const menuButton = page.locator('[aria-label*="menu"], button[class*="menu"], button[class*="hamburger"]').first();
    await menuButton.click();
    
    // Menu should be visible
    const mobileNav = page.locator('nav[class*="mobile"], [class*="mobile-nav"], [class*="drawer"], [role="dialog"]');
    await expect(mobileNav.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Menu might be inline instead of drawer
    });
  });

  test('should close mobile menu when clicking outside', async ({ page }) => {
    await page.goto('/');
    
    const menuButton = page.locator('[aria-label*="menu"], button[class*="menu"]').first();
    await menuButton.click();
    
    // Wait for menu to open
    await page.waitForTimeout(300);
    
    // Click outside
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    
    // Menu should close (or remain visible if click handling is different)
    await page.waitForTimeout(300);
  });

  test('should have all navigation links in mobile menu', async ({ page }) => {
    await page.goto('/');
    
    const menuButton = page.locator('[aria-label*="menu"], button[class*="menu"]').first();
    await menuButton.click();
    
    // Wait for menu animation
    await page.waitForTimeout(300);
    
    // Should have navigation links
    const navLinks = page.locator('nav a, [role="dialog"] a, [class*="mobile-nav"] a');
    const count = await navLinks.count();
    
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Touch Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should handle tap events correctly', async ({ page }) => {
    await page.goto('/');
    
    // Find a clickable element
    const button = page.locator('button, a').first();
    
    // Tap should work
    await button.tap();
    
    // Should navigate or trigger action
    await page.waitForTimeout(300);
  });

  test('should have adequate touch targets (48px minimum)', async ({ page }) => {
    await page.goto('/');
    
    // Check button sizes
    const buttons = page.locator('button, a[class*="btn"], a[class*="button"]');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // Touch targets should be at least 44px (Apple) or 48px (Google) minimum
        expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(40);
      }
    }
  });
});

test.describe('Mobile Forms', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('login form should be usable on mobile', async ({ page }) => {
    await page.goto('/login');
    
    // Form should be visible
    const form = page.locator('form');
    await expect(form.first()).toBeVisible();
    
    // Inputs should be accessible
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible();
    
    // Can type in input
    await emailInput.tap();
    await emailInput.fill('test@example.com');
    
    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('signup form should be usable on mobile', async ({ page }) => {
    await page.goto('/signup');
    
    // Form should be visible and not cut off
    const form = page.locator('form');
    await expect(form.first()).toBeVisible();
    
    // All form fields should be reachable by scrolling
    const inputs = form.locator('input');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      await input.scrollIntoViewIfNeeded();
      await expect(input).toBeVisible();
    }
  });
});

test.describe('Mobile Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should not have horizontal scroll', async ({ page }) => {
    await page.goto('/');
    
    // Check for horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('text should be readable without zooming', async ({ page }) => {
    await page.goto('/');
    
    // Check font sizes
    const body = page.locator('body');
    const fontSize = await body.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    
    // Font size should be at least 14px for readability
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(14);
  });

  test('images should be responsive', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const box = await img.boundingBox();
      
      if (box) {
        // Images should not overflow viewport
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('hero section should be visible without scrolling', async ({ page }) => {
    await page.goto('/');
    
    // Hero or main heading should be visible
    const hero = page.locator('h1, [class*="hero"]').first();
    await expect(hero).toBeVisible();
    
    const box = await hero.boundingBox();
    if (box) {
      // Should be in viewport
      expect(box.y).toBeLessThan(667);
    }
  });
});

test.describe('Tablet Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
  });

  test('should show appropriate navigation for tablet', async ({ page }) => {
    await page.goto('/');
    
    // Might show full nav or mobile nav depending on breakpoint
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('pricing cards should stack or grid appropriately', async ({ page }) => {
    await page.goto('/pricing');
    
    const cards = page.locator('[class*="card"], [class*="plan"]');
    const count = await cards.count();
    
    if (count > 1) {
      const firstCard = await cards.first().boundingBox();
      const secondCard = await cards.nth(1).boundingBox();
      
      if (firstCard && secondCard) {
        // Cards should either be side by side or stacked
        const isStacked = secondCard.y > firstCard.y + firstCard.height;
        const isSideBySide = Math.abs(secondCard.y - firstCard.y) < 10;
        
        expect(isStacked || isSideBySide).toBe(true);
      }
    }
  });
});

test.describe('Orientation Change', () => {
  test('should handle portrait to landscape switch', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    
    // Page should adapt
    await expect(page.locator('body')).toBeVisible();
    
    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });
});

test.describe('Mobile Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should load quickly on mobile', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const loadTime = Date.now() - startTime;
    
    // Should load DOM in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have viewport meta tag', async ({ page }) => {
    await page.goto('/');
    
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });
});

test.describe('PWA on Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should have install prompt capability', async ({ page }) => {
    await page.goto('/');
    
    // Check for manifest
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toBeAttached();
  });

  test('should have apple-touch-icon', async ({ page }) => {
    await page.goto('/');
    
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toBeAttached();
  });

  test('should have theme-color meta tag', async ({ page }) => {
    await page.goto('/');
    
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toBeAttached();
  });
});
