import {defineConfig} from "@playwright/test";
import production from "./playwright.w01.config";
export default defineConfig({...production,testMatch:"w01-rational.spec.ts",outputDir:"test-results/w01-rational",reporter:[["list"]]});
