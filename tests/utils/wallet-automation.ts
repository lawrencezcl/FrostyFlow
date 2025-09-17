import { chromium, Browser, Page } from 'playwright';
import path from 'path';

export class WalletAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize() {
    this.browser = await chromium.launch({
      headless: false,
      args: [
        '--disable-extensions-except=./extensions/polkadot-js-extension',
        '--load-extension=./extensions/polkadot-js-extension',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });

    this.page = await context.newPage();
  }

  async navigateToApp() {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.goto('http://localhost:3000');
    await this.page.waitForSelector('[data-testid="wallet-connect-button"]');
  }

  async installPolkadotExtension() {
    if (!this.page) throw new Error('Page not initialized');
    
    // Navigate to extension store
    await this.page.goto('chrome://extensions/');
    
    // Enable developer mode
    const developerMode = await this.page.$('input[type="checkbox"]');
    if (developerMode) {
      await developerMode.click();
    }
    
    // Load unpacked extension
    const loadUnpacked = await this.page.$('text=Load unpacked');
    if (loadUnpacked) {
      await loadUnpacked.click();
      // This would require manual intervention for file selection
    }
  }

  async connectWallet() {
    if (!this.page) throw new Error('Page not initialized');
    
    // Click wallet connect button
    await this.page.click('[data-testid="wallet-connect-button"]');
    
    // Wait for extension popup (this is simplified)
    await this.page.waitForTimeout(2000);
    
    // Switch to extension context (simplified approach)
    const pages = this.page.context().pages();
    const extensionPage = pages.find(p => p.url().includes('extension'));
    
    if (extensionPage) {
      await extensionPage.bringToFront();
      
      // Accept connection in extension
      await extensionPage.click('text=Accept');
      await extensionPage.click('text=Connect');
    }
  }

  async switchToTestnet(network: 'bifrost' | 'polkadot' | 'kusama') {
    if (!this.page) throw new Error('Page not initialized');
    
    // Navigate to network selection
    await this.page.click('[data-testid="network-selector"]');
    
    // Select test network
    await this.page.click(`[data-testid="network-${network}"]`);
    
    // Wait for network switch
    await this.page.waitForSelector(`[data-testid="network-indicator-${network}"]`);
  }

  async getAccountBalance(): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');
    
    const balanceElement = await this.page.waitForSelector('[data-testid="account-balance"]');
    return await balanceElement.textContent() || '0';
  }

  async stakeAssets(asset: string, amount: number) {
    if (!this.page) throw new Error('Page not initialized');
    
    // Navigate to staking page
    await this.page.click('[data-testid="staking-tab"]');
    
    // Select asset
    await this.page.click(`[data-testid="asset-${asset}"]`);
    
    // Enter amount
    const amountInput = await this.page.waitForSelector('[data-testid="stake-amount"]');
    await amountInput.fill(amount.toString());
    
    // Select gas mode
    await this.page.click('[data-testid="gas-mode-normal"]');
    
    // Confirm stake
    await this.page.click('[data-testid="confirm-stake"]');
    
    // Wait for transaction
    await this.page.waitForSelector('[data-testid="transaction-success"]');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export const walletAutomation = new WalletAutomation();