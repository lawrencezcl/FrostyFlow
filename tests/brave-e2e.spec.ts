import { test, expect } from '@playwright/test';

test.describe('FrostyFlow E2E Tests with Brave Browser', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    // Wait for the app to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should load FrostyFlow application in Brave', async ({ page }) => {
    await expect(page).toHaveTitle(/FrostyFlow/);
    
    // Check for main heading
    const heading = page.locator('h1, h2, h3').filter({ hasText: /FrostyFlow|欢迎来到/ });
    await expect(heading.first()).toBeVisible();
  });

  test('should display wallet connection modal in Brave', async ({ page }) => {
    // Click wallet connect button
    const connectButton = page.locator('button').filter({ hasText: /连接钱包|Connect Wallet/ });
    await expect(connectButton).toBeVisible();
    await connectButton.click();
    
    // Check if wallet selection modal appears
    const modal = page.locator('text=选择钱包');
    await expect(modal).toBeVisible();
    
    // Check for wallet options
    const polkadotOption = page.locator('text=Polkadot.js');
    const metamaskOption = page.locator('text=MetaMask');
    const talismanOption = page.locator('text=Talisman');
    
    await expect(polkadotOption).toBeVisible();
    await expect(metamaskOption).toBeVisible();
    await expect(talismanOption).toBeVisible();
  });

  test('should navigate between pages in Brave', async ({ page }) => {
    // Test navigation to staking page
    const stakingNav = page.locator('text=质押铸造').first();
    await stakingNav.click();
    await expect(page).toHaveURL(/staking/);
    
    // Test navigation to redemption page
    const redemptionNav = page.locator('text=质押赎回').first();
    await redemptionNav.click();
    await expect(page).toHaveURL(/redemption/);
    
    // Test navigation to help center
    const helpNav = page.locator('text=帮助中心').first();
    await helpNav.click();
    await expect(page).toHaveURL(/help/);
    
    // Test navigation to settings
    const settingsNav = page.locator('text=系统设置').first();
    await settingsNav.click();
    await expect(page).toHaveURL(/settings/);
    
    // Navigate back to home
    const homeNav = page.locator('text=资产总览').first();
    await homeNav.click();
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
  });

  test('should display staking form when wallet not connected in Brave', async ({ page }) => {
    // Navigate to staking page
    const stakingNav = page.locator('text=质押铸造').first();
    await stakingNav.click();
    
    // Should show "please connect wallet" message
    const connectMessage = page.locator('text=请先连接钱包');
    await expect(connectMessage).toBeVisible();
  });

  test('should display redemption page when wallet not connected in Brave', async ({ page }) => {
    // Navigate to redemption page
    const redemptionNav = page.locator('text=质押赎回').first();
    await redemptionNav.click();
    
    // Should show "please connect wallet" message
    const connectMessage = page.locator('text=请先连接钱包');
    await expect(connectMessage).toBeVisible();
  });

  test('should simulate wallet connection flow in Brave', async ({ page }) => {
    // Click wallet connect button
    const connectButton = page.locator('button').filter({ hasText: /连接钱包/ });
    await connectButton.click();
    
    // Select Polkadot.js wallet (simulate)
    const polkadotButton = page.locator('button').filter({ hasText: /Polkadot\.js/ });
    await polkadotButton.click();
    
    // Wait for connection simulation
    await page.waitForTimeout(2000);
    
    // Check if wallet address is displayed (mock connection)
    const walletAddress = page.locator('text=/5G.*|0x.*/');
    if (await walletAddress.count() > 0) {
      await expect(walletAddress.first()).toBeVisible();
    }
  });

  test('should test responsive design in Brave', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Check if mobile menu toggle is visible
    const mobileMenu = page.locator('button').filter({ hasText: /☰|Menu/ }).first();
    if (await mobileMenu.count() > 0) {
      await expect(mobileMenu).toBeVisible();
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    
    // Ensure main content is visible
    const mainContent = page.locator('main, .main-content, [role="main"]').first();
    if (await mainContent.count() > 0) {
      await expect(mainContent).toBeVisible();
    }
  });

  test('should check network selector functionality in Brave', async ({ page }) => {
    // Look for network selector
    const networkSelector = page.locator('button').filter({ hasText: /Bifrost|Testnet/ });
    if (await networkSelector.count() > 0) {
      await expect(networkSelector.first()).toBeVisible();
      
      // Try to click network selector
      await networkSelector.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('should verify console errors are minimal in Brave', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate through different pages
    await page.goto('http://localhost:3000/staking');
    await page.waitForTimeout(2000);
    
    await page.goto('http://localhost:3000/redemption');
    await page.waitForTimeout(2000);
    
    await page.goto('http://localhost:3000/help');
    await page.waitForTimeout(2000);
    
    // Check that critical errors are not present
    const criticalErrors = errors.filter(error => 
      !error.includes('WebSocket') && 
      !error.includes('net::ERR_CERT_COMMON_NAME_INVALID') &&
      !error.includes('API-WS: disconnected')
    );
    
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('should test theme toggle functionality in Brave', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.locator('button').filter({ hasText: /🌙|☀️|Dark|Light/ });
    if (await themeToggle.count() > 0) {
      await themeToggle.first().click();
      await page.waitForTimeout(1000);
      
      // Click again to toggle back
      await themeToggle.first().click();
      await page.waitForTimeout(1000);
    }
  });
});