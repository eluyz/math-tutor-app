import {defineConfig} from '@playwright/test';
import production from './playwright.batch-b.config';
export default defineConfig({...production,testMatch:'w02-batch2.spec.ts',testIgnore:[],workers:2,outputDir:'test-results/w02-batch2',reporter:[['list'],['json',{outputFile:'test-results/w02-batch2-browser.json'}]],use:{...production.use,baseURL:'http://127.0.0.1:5279/math-tutor-app/'},webServer:{command:'npm run preview -- --host 127.0.0.1 --port 5279 --strictPort',url:'http://127.0.0.1:5279/math-tutor-app/',reuseExistingServer:false,timeout:30000}});
