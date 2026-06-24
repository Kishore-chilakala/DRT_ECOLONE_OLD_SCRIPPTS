import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for React app E2E testing
 * with front-end rendering time measurement.
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directory where test files are located
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Single worker for sequential rendering measurements (avoids noise from parallelism)
  workers: 1,

  // Reporter: HTML report + console line reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  // Global test settings
  use: {
    // Target Chromium (Chrome-compatible)
    ...devices['Desktop Chrome'],

    // Run headed or headless via HEADLESS env var (default: headless)
    // Set HEADLESS=false to run with a visible browser window
    headless: process.env.HEADLESS !== 'false',

    // Base URL — change this to your React app's dev server URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Collect trace on first retry for debugging
    trace: 'on-first-retry',

    // Always capture screenshots on failure
    screenshot: 'only-on-failure',

    // Capture video on failure
    video: 'on-first-retry',

    // Viewport matching typical desktop
    viewport: { width: 1280, height: 720 },

    // Browser launch options
    launchOptions: {
      // Use the system Chrome / Chromium
      channel: 'chromium',
      args: [
        '--enable-precise-memory-info',       // More precise JS heap info
        '--no-sandbox',
        '--disable-web-security',             // Allows cross-origin perf API access if needed
      ],
    },
  },

  // Test timeout (120 seconds per test — full E2E flow on remote QA environment)
  timeout: 120_000,

  // Expect timeout for assertions — trip summary API on QA can be slow
  expect: {
    timeout: 30_000,
  },

  // Output directory for test artifacts
  outputDir: 'test-results/',

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.HEADLESS !== 'false',
        launchOptions: {
          channel: 'chromium',
        },
      },
    },
  ],
});
