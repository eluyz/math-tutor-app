import { defineConfig } from "@playwright/test";
import production from "./playwright.batch-b.config";

/** Reuse the production runner settings; keep Batch C artifacts isolated. */
export default defineConfig(production, {
  testMatch: "batchCAcceptance.spec.ts",
  outputDir: "test-results/batch-c",
  reporter: [["list"], ["json", { outputFile: "test-results/batch-c-results.json" }], ["html", { outputFolder: "playwright-report/batch-c", open: "never" }]],
  use: { baseURL: "http://127.0.0.1:4373/math-tutor-app/" },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4373 --strictPort",
    url: "http://127.0.0.1:4373/math-tutor-app/",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
