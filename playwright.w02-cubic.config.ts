import {defineConfig} from "@playwright/test";
import production from "./playwright.w01.config";
export default defineConfig({...production,testMatch:"w02-cubic-extrema.spec.ts",outputDir:"test-results/w02-cubic",reporter:[["list"]]});
