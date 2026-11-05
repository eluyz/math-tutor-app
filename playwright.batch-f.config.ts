import {defineConfig} from "@playwright/test";
import production from "./playwright.batch-b.config";
/** One isolated production server; inherit Chromium and evidence settings. */
export default defineConfig({
 ...production,testMatch:"batchFAcceptance.spec.ts",fullyParallel:true,workers:2,
 outputDir:"test-results/batch-f",
 reporter:[["list"],["json",{outputFile:"test-results/batch-f-results.json"}],["html",{outputFolder:"playwright-report/batch-f",open:"never"}]],
 use:{...production.use,baseURL:"http://127.0.0.1:4673/math-tutor-app/"},
 webServer:{command:"npm run preview -- --host 127.0.0.1 --port 4673 --strictPort",url:"http://127.0.0.1:4673/math-tutor-app/",reuseExistingServer:false,timeout:30_000},
});
