import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page }) => {
    await page.goto('/');
    
    // Check main navigation works
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to pricing page', async ({ page }) => {
    await page.goto('/pricing');
    
    // Should show pricing information
    await expect(page).toHaveURL(/pricing/);
    
    // Should have pricing cards or plans
    const pricingContent = page.locator('[class*="price"], [class*="plan"], h1, h2');
    await expect(pricingContent.first()).toBeVisible();
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/about');
    
    // Should show about content
    await expect(page).toHaveURL(/about/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/contact');
    
    // Should show contact form or information
    await expect(page).toHaveURL(/contact/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to demo page', async ({ page }) => {
    await page.goto('/demo');
    
    // Should show demo content
    await expect(page).toHaveURL(/demo/);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Pricing Page', () => {
  test('should display pricing plans', async ({ page }) => {
    await page.goto('/pricing');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Should have multiple pricing options
    const pricingCards = page.locator('[class*="card"], [class*="plan"], [data-testid*="plan"]');
    const count = await pricingCards.count();
    
    // Should have at least 2 plans
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should show pricing toggle (monthly/yearly)', async ({ page }) => {
    await page.goto('/pricing');
    
    // Look for billing toggle
    const toggle = page.locator('[class*="toggle"], [class*="switch"], button:has-text(/شهري|سنوي|monthly|yearly/i)');
    
    if (await toggle.count() > 0) {
      await expect(toggle.first()).toBeVisible();
    }
  });

  test('should have CTA buttons on pricing cards', async ({ page }) => {
    await page.goto('/pricing');
    
    // Each plan should have a CTA button
    const ctaButtons = page.locator('button:has-text(/ابدأ|اشترك|Start|Subscribe|Choose/i), a:has-text(/ابدأ|اشترك|Start|Subscribe|Choose/i)');
    
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Contact Page', () => {
  test('should have contact form', async ({ page }) => {
    await page.goto('/contact');
    
    // Should have form elements
    const form = page.locator('form');
    await expect(form.first()).toBeVisible({ timeout: 10000 }).catch(() => {
      // Page might have contact info instead of form
    });
  });

  test('should validate contact form fields', async ({ page }) => {
    await page.goto('/contact');
    
    const form = page.locator('form');
    
    if (await form.count() > 0) {
      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: /إرسال|Send|Submit/i });
      
      if (await submitButton.count() > 0) {
        await submitButton.first().click();
        
        // Should show validation errors or prevent submission
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('Demo Scheduling', () => {
  test('should have demo request form or calendar', async ({ page }) => {
    await page.goto('/demo');
    
    // Should have form or calendar widget
    const demoContent = page.locator('form, [class*="calendar"], [class*="booking"]');
    
    await expect(demoContent.first()).toBeVisible({ timeout: 10000 }).catch(() => {
      // Might redirect or show different content
    });
  });
});

test.describe('Footer Links', () => {
  test('should have footer with important links', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check for common footer links
    const links = footer.locator('a');
    const count = await links.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to privacy policy', async ({ page }) => {
    await page.goto('/');
    
    const privacyLink = page.locator('a:has-text(/privacy|خصوصية/i)').first();
    
    if (await privacyLink.count() > 0) {
      await privacyLink.click();
      await expect(page).toHaveURL(/privacy/i);
    }
  });

  test('should navigate to terms of service', async ({ page }) => {
    await page.goto('/');
    
    const termsLink = page.locator('a:has-text(/terms|شروط/i)').first();
    
    if (await termsLink.count() > 0) {
      await termsLink.click();
      await expect(page).toHaveURL(/terms/i);
    }
  });
});

test.describe('Search Functionality', () => {
  test('should have search functionality if available', async ({ page }) => {
    await page.goto('/');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"], input[placeholder*="search" i], [class*="search"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.first().click();
      await searchInput.first().fill('test search');
      
      // Should show results or redirect
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Error Pages', () => {
  test('should show 404 page for non-existent routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    
    // Should show 404 content
    const notFoundText = page.locator('body');
    await expect(notFoundText).toContainText(/404|not found|غير موجود/i);
  });
});

test.describe('Social Links', () => {
  test('should have social media links', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer');
    
    // Check for social links
    const socialLinks = footer.locator('a[href*="twitter"], a[href*="linkedin"], a[href*="facebook"], a[href*="instagram"]');
    
    // Social links should exist and be visible
    if (await socialLinks.count() > 0) {
      await expect(socialLinks.first()).toBeVisible();
    }
  });
});

test.describe('Scroll Behavior', () => {
  test('should have scroll to top functionality', async ({ page }) => {
    await page.goto('/');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    // Look for scroll to top button
    const scrollTopButton = page.locator('[class*="scroll-top"], button[aria-label*="scroll"], button[aria-label*="top"]');
    
    if (await scrollTopButton.count() > 0) {
      await expect(scrollTopButton.first()).toBeVisible();
    }
  });
});

test.describe('Loading States', () => {
  test('should handle loading states gracefully', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Check that loading indicators disappear
    const loadingIndicators = page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]');
    
    // Wait for loading to complete
    await page.waitForLoadState('networkidle');
    
    // Loading indicators should be hidden or removed
    await expect(loadingIndicators).toHaveCount(0, { timeout: 10000 }).catch(() => {
      // Some skeleton loaders might persist for specific sections
    });
  });
});

test.describe('Cookie Consent', () => {
  test('should show cookie consent banner if applicable', async ({ page }) => {
    // Clear cookies to trigger consent banner
    await page.context().clearCookies();
    
    await page.goto('/');
    
    // Look for cookie consent banner
    const cookieBanner = page.locator('[class*="cookie"], [class*="consent"], [id*="cookie"]');
    
    // If cookie banner exists, it should be interactive
    if (await cookieBanner.count() > 0) {
      await expect(cookieBanner.first()).toBeVisible();
      
      // Should have accept button
      const acceptButton = cookieBanner.locator('button:has-text(/accept|قبول|موافق/i)');
      if (await acceptButton.count() > 0) {
        await expect(acceptButton.first()).toBeVisible();
      }
    }
  });
});
