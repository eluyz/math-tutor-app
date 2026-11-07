import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

/** Test the production bundle; build it first with npm run build. */
export default defineConfig(base, {
  testMatch: "batchBAcceptance.spec.ts",
  testIgnore: [],
  workers: 2,
  outputDir: "test-results/batch-b",
  reporter: [["list"], ["json", { outputFile: "test-results/batch-b-results.json" }], ["html", { outputFolder: "playwright-report/batch-b", open: "never" }]],
  use: { baseURL: "http://127.0.0.1:4273/math-tutor-app/", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4273 --strictPort",
    url: "http://127.0.0.1:4273/math-tutor-app/",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
