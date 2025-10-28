import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts', '!**/unit/**', '!**/integration/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'brave',
      use: { 
        ...devices['Desktop Chrome'],
        executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
        headless: false,
        viewport: { width: 1280, height: 720 },
        args: [
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-blink-features=AutomationControlled',
          '--no-first-run',
          '--no-default-browser-check'
        ]
      },
    },
    {
      name: 'chromium-fallback',
      use: { 
        ...devices['Desktop Chrome'],
        headless: false,
        viewport: { width: 1280, height: 720 }
      },
    },
  ],

  webServer: {
    command: 'REACT_APP_ENVIRONMENT=testnet npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});