const { test, expect } = require('@playwright/test');

test.describe('Wallet Connection Debugging Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load application and show wallet connection button', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check if the wallet connection button is visible
    const walletButton = page.locator('button:has-text("连接钱包")');
    await expect(walletButton).toBeVisible();

    // Take a screenshot for verification
    await page.screenshot({ path: 'wallet-button-visible.png' });
  });

  test('should open wallet connection modal and detect wallets', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Click on the wallet connection button
    const walletButton = page.locator('button:has-text("连接钱包")');
    await walletButton.click();

    // Wait for the modal to appear
    await page.waitForSelector('text=选择钱包', { timeout: 10000 });

    // Check for wallet options
    const polkadotWallet = page.locator('text=Polkadot.js');
    const metamaskWallet = page.locator('text=MetaMask');
    const talismanWallet = page.locator('text=Talisman');

    // Take a screenshot of the modal
    await page.screenshot({ path: 'wallet-modal.png' });

    // Check that at least one wallet option is visible
    const walletOptions = [polkadotWallet, metamaskWallet, talismanWallet];
    let foundWallet = false;

    for (const wallet of walletOptions) {
      if (await wallet.isVisible()) {
        foundWallet = true;
        console.log(`Found wallet: ${await wallet.textContent()}`);
        break;
      }
    }

    expect(foundWallet).toBe(true);
  });

  test('should show wallet detection status in console logs', async ({ page }) => {
    // Set up console log monitoring
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
      console.log('Console:', msg.text());
    });

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Click on the wallet connection button
    const walletButton = page.locator('button:has-text("连接钱包")');
    await walletButton.click();

    // Wait for the modal to appear
    await page.waitForSelector('text=选择钱包', { timeout: 10000 });

    // Wait a bit for wallet detection to complete
    await page.waitForTimeout(3000);

    // Check for wallet detection logs
    const detectionLogs = consoleMessages.filter(msg =>
      msg.includes('Starting wallet detection') ||
      msg.includes('Final wallet detection') ||
      msg.includes('detected')
    );

    console.log('Wallet detection logs:', detectionLogs);

    // We should have at least some detection logs
    expect(detectionLogs.length).toBeGreaterThan(0);
  });

  test('should handle Polkadot.js wallet connection attempt', async ({ page }) => {
    // Set up console log monitoring
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
      console.log('Console:', msg.text());
    });

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Click on the wallet connection button
    const walletButton = page.locator('button:has-text("连接钱包")');
    await walletButton.click();

    // Wait for the modal to appear
    await page.waitForSelector('text=选择钱包', { timeout: 10000 });

    // Try to find Polkadot.js wallet option
    const polkadotWallet = page.locator('text=Polkadot.js');

    if (await polkadotWallet.isVisible()) {
      console.log('Polkadot.js wallet found, attempting connection...');
      await polkadotWallet.click();

      // Wait for connection attempt
      await page.waitForTimeout(5000);

      // Check for connection logs
      const connectionLogs = consoleMessages.filter(msg =>
        msg.includes('Attempting to connect to polkadot wallet') ||
        msg.includes('Accounts result') ||
        msg.includes('Available accounts')
      );

      console.log('Connection logs:', connectionLogs);

      // Take a screenshot after connection attempt
      await page.screenshot({ path: 'wallet-connection-attempt.png' });

      // Check if either success or error message appeared
      const hasConnectionResult = connectionLogs.length > 0 ||
        await page.locator('text=Connected to').isVisible() ||
        await page.locator('text=No accounts found').isVisible();

      expect(hasConnectionResult).toBe(true);
    } else {
      console.log('Polkadot.js wallet not available, skipping connection test');
      test.skip();
    }
  });
});