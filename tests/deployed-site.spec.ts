import { test, expect } from '@playwright/test';

const DEPLOYED_URL = 'https://frostyflow-ep6ejgsi4-lawrencezcls-projects.vercel.app';

test.describe('FrostyFlow Deployed Site Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(DEPLOYED_URL);
  });

  test('should load the main page successfully', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if the page title contains FrostyFlow
    await expect(page).toHaveTitle(/FrostyFlow/);

    // Check if main container is visible
    await expect(page.locator('body')).toBeVisible();

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/deployed-site-homepage.png' });
  });

  test('should display language switcher', async ({ page }) => {
    // Wait for language switcher to be available
    await page.waitForSelector('[data-testid="language-switcher"], .language-switcher', { timeout: 10000 });

    // Check if language switcher is visible
    const languageSwitcher = page.locator('[data-testid="language-switcher"], .language-switcher').first();
    await expect(languageSwitcher).toBeVisible();

    // Take screenshot of language switcher
    await languageSwitcher.screenshot({ path: 'test-results/language-switcher.png' });
  });

  test('should switch between languages', async ({ page }) => {
    // Wait for initial content to load
    await page.waitForLoadState('networkidle');

    // Find and click language switcher
    const languageSwitcher = page.locator('[data-testid="language-switcher"], .language-switcher, .ant-dropdown-trigger').first();
    await expect(languageSwitcher).toBeVisible({ timeout: 15000 });

    // Click to open dropdown
    await languageSwitcher.click();
    await page.waitForTimeout(1000);

    // Try to find Chinese language option
    const chineseOption = page.locator('text="中文", text="China", [role="menuitem"], [data-value="zh"]').first();
    if (await chineseOption.isVisible()) {
      await chineseOption.click();
      await page.waitForTimeout(2000);

      // Take screenshot after language switch
      await page.screenshot({ path: 'test-results/chinese-language.png' });
    }

    // Click language switcher again
    await languageSwitcher.click();
    await page.waitForTimeout(1000);

    // Try to find English language option
    const englishOption = page.locator('text="English", text="🇺🇸", [role="menuitem"], [data-value="en"]').first();
    if (await englishOption.isVisible()) {
      await englishOption.click();
      await page.waitForTimeout(2000);

      // Take screenshot after switching back to English
      await page.screenshot({ path: 'test-results/english-language.png' });
    }
  });

  test('should display wallet connection component', async ({ page }) => {
    // Wait for wallet connect component to load
    await page.waitForSelector('[data-testid="wallet-connect"], .wallet-connect, .ant-card', { timeout: 15000 });

    // Look for wallet connection buttons
    const walletButtons = page.locator('button:has-text("Connect"), button:has-text("钱包"), button:has-text("Wallet")');
    const walletButtonCount = await walletButtons.count();

    expect(walletButtonCount).toBeGreaterThan(0);

    // Take screenshot of wallet component
    await page.screenshot({ path: 'test-results/wallet-component.png' });
  });

  test('should have responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/desktop-view.png' });

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/tablet-view.png' });

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/mobile-view.png' });
  });

  test('should load key UI components', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for common UI components
    const components = [
      '.ant-layout',
      '.ant-menu',
      '.ant-card',
      '.ant-btn',
      '[data-testid="layout"]'
    ];

    for (const selector of components) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible();
      }
    }

    // Take overall screenshot
    await page.screenshot({ path: 'test-results/ui-components.png' });
  });

  test('should have no console errors', async ({ page }) => {
    const logs: string[] = [];

    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Wait for any async operations

    // Check for errors
    expect(logs.filter(log =>
      !log.includes('Warning') &&
      !log.includes('DevTools') &&
      !log.includes('React DevTools')
    )).toHaveLength(0);
  });

  test('should handle navigation correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for navigation elements
    const navElements = page.locator('.ant-menu-item, a, button[role="menuitem"]');
    const navCount = await navElements.count();

    if (navCount > 0) {
      // Try clicking on the first few navigation items
      const maxItemsToTest = Math.min(3, navCount);

      for (let i = 0; i < maxItemsToTest; i++) {
        const navItem = navElements.nth(i);

        if (await navItem.isVisible()) {
          await navItem.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `test-results/navigation-${i}.png` });
        }
      }
    }
  });

  test('should load external resources properly', async ({ page }) => {
    const responses: any[] = [];

    // Track network responses
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        ok: response.ok()
      });
    });

    await page.waitForLoadState('networkidle');

    // Check that critical resources loaded successfully
    const failedResources = responses.filter(r => !r.ok && r.status !== 0);

    // Allow some failed resources (non-critical ones)
    const criticalFailures = failedResources.filter(r =>
      r.url.includes('vercel.app') ||
      r.url.includes('localhost') ||
      r.url.includes('.js') ||
      r.url.includes('.css')
    );

    expect(criticalFailures.length).toBeLessThan(3);
  });

  test('should have proper meta tags and SEO', async ({ page }) => {
    // Check for important meta tags
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Check for meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(0);
    }

    // Check for viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});

test.describe('FrostyFlow Performance Tests', () => {

  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(DEPLOYED_URL);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 30 seconds
    expect(loadTime).toBeLessThan(30000);

    console.log(`Page loaded in ${loadTime}ms`);
  });

  test('should be accessible', async ({ page }) => {
    await page.goto(DEPLOYED_URL);
    await page.waitForLoadState('networkidle');

    // Basic accessibility checks
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        // Check if button has accessible name
        const buttonText = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        expect(buttonText || ariaLabel).toBeTruthy();
      }
    }
  });
});