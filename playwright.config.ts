import { defineConfig, devices } from '@playwright/test';

/**
 * Where the tests run:
 *
 *  - By default (no PREVIEW_URL) the tests are fully self-contained: Playwright
 *    starts a local static server (tools/serve.js) serving this repo's files,
 *    so `npx playwright test` runs green against the current branch content
 *    with no deployed URL required.
 *
 *  - To test a deployed site instead, set PREVIEW_URL and the local server is
 *    skipped:
 *      PowerShell:  $env:PREVIEW_URL="https://<host>"; npx playwright test
 *      bash:        PREVIEW_URL="https://<host>" npx playwright test
 *
 * Note: TL-Landing has no Vercel project (it deploys to www.tipperlink.com via
 * the CNAME / GitHub Pages), so there is no auto-generated Vercel preview URL.
 */
const PORT = 8123;
const previewURL = process.env.PREVIEW_URL;
const baseURL = previewURL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: 'line',
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
  },
  // Only spin up the local server when not targeting a remote PREVIEW_URL.
  webServer: previewURL
    ? undefined
    : {
        command: `node ./tools/serve.js . ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    // Satisfies the "page loads on mobile viewport" requirement. Pixel 5 is a
    // Chromium-based mobile device, so no extra browser engine is required.
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});
