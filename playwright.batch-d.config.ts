import { defineConfig } from "@playwright/test";
import production from "./playwright.batch-b.config";

export default defineConfig(production, {
  testMatch: "batchDAcceptance.spec.ts",
  fullyParallel: true,
  workers: 2,
  outputDir: "test-results/batch-d",
  reporter: [["list"], ["json", { outputFile: "test-results/batch-d-results.json" }], ["html", { outputFolder: "playwright-report/batch-d", open: "never" }]],
  use: { baseURL: "http://127.0.0.1:4473/math-tutor-app/" },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4473 --strictPort",
    url: "http://127.0.0.1:4473/math-tutor-app/",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
