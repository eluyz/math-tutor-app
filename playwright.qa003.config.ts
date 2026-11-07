import {defineConfig} from '@playwright/test';
import production from './playwright.batch-b.config';
/** Explicit QA-003 production audit; not extra automatic regression coverage. */
export default defineConfig({...production,testMatch:'qa003Multivariable.audit.ts',testIgnore:[],workers:2,outputDir:'test-results/qa003-multivariable',reporter:[['list'],['json',{outputFile:'test-results/qa003-multivariable-browser.json'}]],use:{...production.use,baseURL:'http://127.0.0.1:5479/math-tutor-app/'},webServer:{command:'npm run preview -- --host 127.0.0.1 --port 5479 --strictPort',url:'http://127.0.0.1:5479/math-tutor-app/',reuseExistingServer:false,timeout:30000}});
