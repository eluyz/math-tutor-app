import {defineConfig} from "@playwright/test";
import production from "./playwright.batch-b.config";
/** One isolated production server; inherit Chromium and evidence settings. */
export default defineConfig({
 ...production,testMatch:"batchGAcceptance.spec.ts",fullyParallel:true,workers:2,
 outputDir:"test-results/batch-g",
 reporter:[["list"],["json",{outputFile:"test-results/batch-g-results.json"}],["html",{outputFolder:"playwright-report/batch-g",open:"never"}]],
 use:{...production.use,baseURL:"http://127.0.0.1:4773/math-tutor-app/"},
 webServer:{command:"npm run preview -- --host 127.0.0.1 --port 4773 --strictPort",url:"http://127.0.0.1:4773/math-tutor-app/",reuseExistingServer:false,timeout:30_000},
});
