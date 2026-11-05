import {defineConfig} from '@playwright/test';
import production from './playwright.batch-b.config';
/** Explicit production runner for the pinned F05-d witness and existing renderer regressions. */
export default defineConfig({...production,testMatch:['f05-d-profile.spec.ts','graph-integrated-asymptotes.spec.ts'],testIgnore:[],workers:2,outputDir:'test-results/f05-d',reporter:[['list'],['json',{outputFile:'test-results/f05-d-results.json'}]],use:{...production.use,baseURL:'http://127.0.0.1:5073/math-tutor-app/'},webServer:{command:'npm run preview -- --host 127.0.0.1 --port 5073 --strictPort',url:'http://127.0.0.1:5073/math-tutor-app/',reuseExistingServer:false,timeout:30000}});
