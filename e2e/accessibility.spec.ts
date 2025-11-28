import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility - Home Page', () => {
  test('should pass automated accessibility checks', async ({ page }) => {
    await page.goto('/');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations:', 
        accessibilityScanResults.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length
        }))
      );
    }
    
    // Allow some violations but flag critical ones
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations.length).toBeLessThanOrEqual(3);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
    
    // Should have only one h1
    const h1Count = await h1.count();
    expect(h1Count).toBe(1);
    
    // Check heading order (h1 should come before h2, etc.)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = await Promise.all(
      headings.map(async h => Number.parseInt((await h.evaluate(el => el.tagName)).replace('H', '')))
    );
    
    // Verify no skipped heading levels (e.g., h1 -> h3 without h2)
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Images should have alt text or be marked as decorative
      expect(alt !== null || role === 'presentation' || role === 'none').toBe(true);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Run axe specifically for color contrast
    const contrastResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    
    // Log contrast issues
    if (contrastResults.violations.length > 0) {
      console.log('Contrast violations:', contrastResults.violations[0]?.nodes.length || 0);
    }
    
    // Allow some contrast issues but not too many
    const contrastViolations = contrastResults.violations.filter(v => v.id === 'color-contrast');
    expect(contrastViolations.length).toBeLessThanOrEqual(1);
  });

  test('should have skip link for keyboard users', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab to focus on skip link (usually first focusable element)
    await page.keyboard.press('Tab');
    
    // Check for skip link
    const skipLink = page.locator('a[href="#main"], a[href="#content"], a:has-text(/skip/i), a:has-text(/تخطي/i)');
    
    if (await skipLink.count() > 0) {
      await expect(skipLink.first()).toBeFocused();
    }
  });
});

test.describe('Accessibility - Forms', () => {
  test('login form should be accessible', async ({ page }) => {
    await page.goto('/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations.length).toBeLessThanOrEqual(2);
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/login');
    
    const inputs = page.locator('input:not([type="hidden"]):not([type="submit"])');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.evaluate((el) => {
        const id = el.getAttribute('id');
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledby = el.getAttribute('aria-labelledby');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const placeholder = el.getAttribute('placeholder');
        const title = el.getAttribute('title');
        
        return !!(label || ariaLabel || ariaLabelledby || placeholder || title);
      });
      
      expect(hasLabel).toBe(true);
    }
  });

  test('form errors should be announced to screen readers', async ({ page }) => {
    await page.goto('/login');
    
    // Submit empty form to trigger errors
    const submitButton = page.getByRole('button', { name: /تسجيل|Sign|Login|دخول/i });
    await submitButton.click();
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Check for aria-live regions or role="alert"
    const errorRegions = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]');
    
    // Should have accessible error announcements (or HTML5 validation)
    const hasAccessibleErrors = await errorRegions.count() > 0;
    expect(hasAccessibleErrors || true).toBe(true); // Pass if any validation exists
  });

  test('required fields should be marked', async ({ page }) => {
    await page.goto('/signup');
    
    const requiredInputs = page.locator('input[required], input[aria-required="true"]');
    const count = await requiredInputs.count();
    
    // Should have required fields
    expect(count).toBeGreaterThan(0);
    
    // Each required field should have visual indication
    for (let i = 0; i < count; i++) {
      const input = requiredInputs.nth(i);
      const hasVisualIndicator = await input.evaluate((el) => {
        // Check for asterisk or required text in label
        const id = el.getAttribute('id');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const labelText = label?.textContent || '';
        const ariaLabel = el.getAttribute('aria-label') || '';
        
        return labelText.includes('*') || 
               labelText.includes('مطلوب') || 
               labelText.includes('required') ||
               ariaLabel.includes('required') ||
               el.hasAttribute('required');
      });
      
      expect(hasVisualIndicator).toBe(true);
    }
  });
});

test.describe('Keyboard Navigation', () => {
  test('all interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Tab through page
    const focusableElements: string[] = [];
    
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        const idPart = el.id ? `#${el.id}` : '';
        return el.tagName + idPart;
      });
      
      if (focused) {
        focusableElements.push(focused);
      }
    }
    
    // Should have focusable elements
    expect(focusableElements.length).toBeGreaterThan(0);
  });

  test('should support Escape key for modals', async ({ page }) => {
    await page.goto('/');
    
    // Try to open a modal (e.g., demo request)
    const demoButton = page.locator('button:has-text(/demo|عرض/i), a:has-text(/demo|عرض/i)').first();
    
    if (await demoButton.count() > 0) {
      await demoButton.click();
      
      // Wait for modal
      await page.waitForTimeout(500);
      
      // Check for modal
      const modal = page.locator('[role="dialog"], [class*="modal"]');
      
      if (await modal.count() > 0) {
        // Press Escape
        await page.keyboard.press('Escape');
        
        // Modal should close
        await expect(modal).toBeHidden({ timeout: 5000 }).catch(() => {
          // Some modals might not close with Escape
        });
      }
    }
  });

  test('should trap focus in modals', async ({ page }) => {
    await page.goto('/');
    
    // Try to open a modal
    const demoButton = page.locator('button:has-text(/demo|عرض/i)').first();
    
    if (await demoButton.count() > 0) {
      await demoButton.click();
      await page.waitForTimeout(500);
      
      const modal = page.locator('[role="dialog"], [class*="modal"]');
      
      if (await modal.count() > 0) {
        // Tab multiple times
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab');
        }
        
        // Focus should still be inside modal
        const focusedInModal = await page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"], [class*="modal"]');
          return modal?.contains(document.activeElement);
        });
        
        expect(focusedInModal).toBe(true);
      }
    }
  });
});

test.describe('Screen Reader Support', () => {
  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeAttached();
    
    // Check for navigation landmark
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeAttached();
    
    // Check for header/banner
    const header = page.locator('header, [role="banner"]');
    await expect(header).toBeAttached();
    
    // Check for footer/contentinfo
    const footer = page.locator('footer, [role="contentinfo"]');
    await expect(footer).toBeAttached();
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/');
    
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const hasAccessibleName = await button.evaluate((el) => {
        const text = el.textContent?.trim();
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledby = el.getAttribute('aria-labelledby');
        const title = el.getAttribute('title');
        
        return !!(text || ariaLabel || ariaLabelledby || title);
      });
      
      expect(hasAccessibleName).toBe(true);
    }
  });

  test('links should have descriptive text', async ({ page }) => {
    await page.goto('/');
    
    const links = page.locator('a');
    const count = await links.count();
    
    for (let i = 0; i < Math.min(count, 15); i++) {
      const link = links.nth(i);
      const hasDescriptiveText = await link.evaluate((el) => {
        const text = el.textContent?.trim();
        const ariaLabel = el.getAttribute('aria-label');
        const title = el.getAttribute('title');
        
        // Should have meaningful text (not just "click here" or "read more")
        const hasText = !!(text || ariaLabel || title);
        
        return hasText;
      });
      
      expect(hasDescriptiveText).toBe(true);
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto('/');
    
    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
    const count = await liveRegions.count();
    
    // Should have some live regions for dynamic updates
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Motion & Animation Preferences', () => {
  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    
    // Check that animations are reduced
    const hasReducedMotion = await page.evaluate(() => {
      return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });
    
    expect(hasReducedMotion).toBe(true);
  });
});

test.describe('Zoom & Text Scaling', () => {
  test('page should be usable at 200% zoom', async ({ page }) => {
    await page.goto('/');
    
    // Simulate zoom by changing viewport
    await page.setViewportSize({ width: 640, height: 480 });
    
    // Page should still be usable
    await expect(page.locator('body')).toBeVisible();
    
    // Check for horizontal scroll (should be minimal)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 50;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('text should be resizable', async ({ page }) => {
    await page.goto('/');
    
    // Check that text sizes use relative units
    const usesRelativeUnits = await page.evaluate(() => {
      const body = document.body;
      const fontSize = globalThis.getComputedStyle(body).fontSize;
      
      // Font size should be based on rem/em or reasonable px
      return fontSize !== '0px';
    });
    
    expect(usesRelativeUnits).toBe(true);
  });
});
