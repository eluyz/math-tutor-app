import { defineConfig } from "@playwright/test";
import production from "./playwright.batch-b.config";

/** Reuse the production runner settings; keep Batch E artifacts isolated. */
export default defineConfig({
  ...production,
  testMatch: "batchEAcceptance.spec.ts",
  outputDir: "test-results/batch-e",
  reporter: [["list"], ["json", { outputFile: "test-results/batch-e-results.json" }], ["html", { outputFolder: "playwright-report/batch-e", open: "never" }]],
  use: { ...production.use, baseURL: "http://127.0.0.1:4573/math-tutor-app/" },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4573 --strictPort",
    url: "http://127.0.0.1:4573/math-tutor-app/",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
