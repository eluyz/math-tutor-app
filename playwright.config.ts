import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  // Keep failures inspectable through the Checks API when log downloads are unavailable.
  reporter: process.env.CI
    ? [['list'], ['github'], ['json', { outputFile: 'test-results/e2e-results.json' }]]
    : 'list',
  // Acceptance batches have separate production-preview configurations.
  testIgnore: ['**/batchBAcceptance.spec.ts', '**/batchCAcceptance.spec.ts', '**/batchDAcceptance.spec.ts', '**/batchEAcceptance.spec.ts', '**/batchFAcceptance.spec.ts', '**/batchGAcceptance.spec.ts'],
  use: {
    baseURL: 'http://127.0.0.1:4173/math-tutor-app/',
    browserName: 'chromium',
    // Use the runner's supported stable Chrome channel and its packaged sandbox setup.
    // An explicit local executable still takes precedence. Never fall back to no-sandbox.
    channel: process.env.CI && !process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? 'chrome' : undefined,
    launchOptions: {
      chromiumSandbox: true,
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
    },
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/math-tutor-app/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
