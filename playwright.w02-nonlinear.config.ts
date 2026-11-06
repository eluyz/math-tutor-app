import {defineConfig} from '@playwright/test';
import production from './playwright.batch-b.config';
export default defineConfig({...production,testMatch:'w02-nonlinear-extrema.spec.ts',testIgnore:[],workers:2,outputDir:'test-results/w02-nonlinear',reporter:[['list'],['json',{outputFile:'test-results/w02-nonlinear-browser.json'}]],use:{...production.use,baseURL:'http://127.0.0.1:5379/math-tutor-app/'},webServer:{command:'npm run preview -- --host 127.0.0.1 --port 5379 --strictPort',url:'http://127.0.0.1:5379/math-tutor-app/',reuseExistingServer:false,timeout:30000}});
