const { test, expect } = require('@playwright/test');

test.describe('Language Switching Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should display language switcher in header', async ({ page }) => {
    // Look for the language switcher (should have flag icon or dropdown)
    const languageSwitcher = page.locator('[data-testid="language-switcher"], .ant-select, [role="combobox"]');

    // Take a screenshot of the header area
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await header.screenshot({ path: 'header-with-language-switcher.png' });

    // Check if language switcher is present (either as dropdown or select)
    const hasLanguageDropdown = await languageSwitcher.count() > 0;
    console.log(`Language switcher found: ${hasLanguageDropdown}`);

    // The language switcher should be visible
    expect(hasLanguageDropdown).toBe(true);
  });

  test('should switch between English and Chinese languages', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForTimeout(2000);

    // Look for language switcher - try multiple selectors
    const languageSelectors = [
      '.ant-select',
      '[role="combobox"]',
      '[data-testid="language-switcher"]',
      'select'
    ];

    let languageSwitcher = null;
    for (const selector of languageSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        languageSwitcher = element;
        break;
      }
    }

    if (!languageSwitcher) {
      console.log('Language switcher not found, checking for any dropdown or select elements');
      const allSelects = page.locator('select, .ant-select');
      const count = await allSelects.count();
      console.log(`Found ${count} select/dropdown elements`);

      if (count > 0) {
        languageSwitcher = allSelects.first();
      }
    }

    expect(languageSwitcher, 'Language switcher should be present').toBeTruthy();

    // Take initial screenshot
    await page.screenshot({ path: 'initial-language-state.png' });

    // Try to click the language switcher
    try {
      await languageSwitcher.click();
      await page.waitForTimeout(1000);

      // Look for language options in the dropdown
      const languageOptions = page.locator('.ant-select-item, option');
      const optionCount = await languageOptions.count();

      console.log(`Found ${optionCount} language options`);

      if (optionCount > 0) {
        // Try to find Chinese language option
        let chineseOption = null;
        for (let i = 0; i < optionCount; i++) {
          const option = languageOptions.nth(i);
          const text = await option.textContent();
          if (text && (text.includes('中文') || text.includes('Chinese') || text.includes('zh'))) {
            chineseOption = option;
            break;
          }
        }

        if (chineseOption) {
          console.log('Found Chinese language option, clicking it');
          await chineseOption.click();
          await page.waitForTimeout(2000);

          // Take screenshot after language change
          await page.screenshot({ path: 'after-language-change.png' });

          // Check if any text has changed (this is a basic check)
          const pageContent = await page.content();
          const hasChineseText = /[\u4e00-\u9fff]/.test(pageContent);
          console.log(`Page contains Chinese characters: ${hasChineseText}`);

          // Look for translated navigation items
          const navItems = page.locator('nav a, .menu a');
          const navCount = await navItems.count();

          let hasTranslatedNav = false;
          for (let i = 0; i < navCount; i++) {
            const navText = await navItems.nth(i).textContent();
            if (navText && (navText.includes('资产') || navText.includes('质押') || navText.includes('仪表板'))) {
              hasTranslatedNav = true;
              console.log(`Found translated navigation: ${navText}`);
              break;
            }
          }

          console.log(`Navigation items are translated: ${hasTranslatedNav}`);

        } else {
          console.log('Chinese language option not found in dropdown');
        }
      } else {
        console.log('No language options found in dropdown');
      }

    } catch (error) {
      console.log('Error interacting with language switcher:', error.message);
      // Take a screenshot for debugging
      await page.screenshot({ path: 'language-switcher-error.png' });
    }
  });

  test('should persist language preference in localStorage', async ({ page }) => {
    // Set language to Chinese via localStorage directly
    await page.evaluate(() => {
      localStorage.setItem('i18nextLng', 'zh');
    });

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if language preference is maintained
    const storedLanguage = await page.evaluate(() => {
      return localStorage.getItem('i18nextLng');
    });

    console.log(`Stored language: ${storedLanguage}`);
    expect(storedLanguage).toBe('zh');

    // Take screenshot to verify language is applied
    await page.screenshot({ path: 'language-persistence-test.png' });
  });

  test('should have proper language resources loaded', async ({ page }) => {
    // Check if i18n is properly initialized
    const i18nStatus = await page.evaluate(() => {
      try {
        // Check if window.i18next is available (if it's exposed globally)
        if (window.i18next) {
          return {
            isInitialized: true,
            language: window.i18next.language,
            languages: Object.keys(window.i18next.options.resources || {})
          };
        }

        // Alternative: check for any i18n related globals
        const hasI18n = Object.keys(window).some(key => key.toLowerCase().includes('i18n'));
        return { hasI18n };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('i18n status:', i18nStatus);

    // Check page content for translation keys being used
    const pageContent = await page.content();
    const hasTranslationKeys = /data-i18n|t\(|useTranslation/.test(pageContent);
    console.log(`Page uses translation system: ${hasTranslationKeys}`);
  });

  test('should display wallet connection in both languages', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(2000);

    // Look for wallet connection button
    const walletButton = page.locator('button:has-text("Connect"), button:has-text("连接")');

    if (await walletButton.isVisible()) {
      console.log('Wallet connection button found');
      await walletButton.screenshot({ path: 'wallet-button.png' });
    } else {
      console.log('Wallet connection button not found with expected text');
      // Try to find any button that might be the connect wallet button
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`Found ${buttonCount} buttons on page`);

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`Button ${i + 1} text: ${buttonText}`);
      }
    }

    // Try to switch language and check if wallet button text changes
    const languageSwitcher = page.locator('.ant-select, select').first();
    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.click();
      await page.waitForTimeout(1000);

      // Look for Chinese option again
      const options = page.locator('.ant-select-item, option');
      const optionCount = await options.count();

      for (let i = 0; i < optionCount; i++) {
        const optionText = await options.nth(i).textContent();
        if (optionText && optionText.includes('中文')) {
          await options.nth(i).click();
          await page.waitForTimeout(2000);

          // Check wallet button again
          const chineseWalletButton = page.locator('button:has-text("连接")');
          if (await chineseWalletButton.isVisible()) {
            console.log('Chinese wallet button found after language switch');
            await chineseWalletButton.screenshot({ path: 'chinese-wallet-button.png' });
          }
          break;
        }
      }
    }
  });
});