import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  // Batch B has a separate production-preview configuration and CI step.
  testIgnore: '**/batchBAcceptance.spec.ts',
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
