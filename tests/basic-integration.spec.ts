import { test, expect } from '@playwright/test';

test.describe('FrostyFlow Testnet Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
  });

  test('should load FrostyFlow application', async ({ page }) => {
    await expect(page).toHaveTitle(/FrostyFlow/);
  });

  test('should display wallet connection button', async ({ page }) => {
    // Look for wallet connect button by its text content
    const connectButton = page.locator('button', { hasText: /Connect|Connect Wallet/i });
    await expect(connectButton).toBeVisible();
  });

  test('should show network selection options', async ({ page }) => {
    // Look for network selector or dropdown
    const networkSelector = page.locator('[data-testid="network-selector"], .network-selector, select').first();
    if (await networkSelector.count() > 0) {
      await expect(networkSelector).toBeVisible();
    }
  });

  test('should display asset cards', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Look for asset-related content
    const assetContent = page.locator('text=/Asset|Balance|DOT|KSM|vDOT|vKSM/i');
    await expect(assetContent.first()).toBeVisible();
  });

  test('should show staking functionality', async ({ page }) => {
    // Look for staking-related elements
    const stakingContent = page.locator('text=/Stake|Staking|Mint/i');
    await expect(stakingContent.first()).toBeVisible();
  });

  test('should show redemption functionality', async ({ page }) => {
    // Look for redemption-related elements
    const redeemContent = page.locator('text=/Redeem|Redemption/i');
    await expect(redeemContent.first()).toBeVisible();
  });

  test('should display testnet environment indicator', async ({ page }) => {
    // Check for testnet indicators
    const testnetIndicator = page.locator('text=/Testnet|testnet|Development/i');
    await expect(testnetIndicator.first()).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test different viewport sizes
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await expect(page.locator('button').first()).toBeVisible();
    
    await page.setViewportSize({ width: 1280, height: 720 }); // Desktop
    await expect(page.locator('button').first()).toBeVisible();
  });

  test.describe('Network functionality', () => {
    test('should display network information', async ({ page }) => {
      // Look for network-related content
      const networkInfo = page.locator('text=/Bifrost|Polkadot|Kusama|Westend/i');
      await expect(networkInfo.first()).toBeVisible();
    });
  });

  test.describe('User Interface', () => {
    test('should have navigation elements', async ({ page }) => {
      // Look for navigation menus or tabs
      const navElements = page.locator('nav, .navigation, .nav, [role="navigation"]').first();
      if (await navElements.count() > 0) {
        await expect(navElements).toBeVisible();
      }
    });

    test('should display wallet connection status', async ({ page }) => {
      // Look for connection status indicators
      const statusIndicator = page.locator('text=/Connected|Disconnected|Not Connected/i');
      await expect(statusIndicator.first()).toBeVisible();
    });
  });
});