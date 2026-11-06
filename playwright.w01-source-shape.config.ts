import {defineConfig} from "@playwright/test";
import production from "./playwright.w01.config";
export default defineConfig({...production,testMatch:"w01-source-shape.spec.ts",outputDir:"test-results/w01-source-shape",reporter:[["list"]]});
