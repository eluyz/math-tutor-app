import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  // Acceptance batches have separate production-preview configurations.
  testIgnore: ['**/batchBAcceptance.spec.ts', '**/batchCAcceptance.spec.ts', '**/batchDAcceptance.spec.ts', '**/batchEAcceptance.spec.ts'],
  use: {
    baseURL: 'http://127.0.0.1:4173/math-tutor-app/',
    browserName: 'chromium',
    launchOptions: {
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
