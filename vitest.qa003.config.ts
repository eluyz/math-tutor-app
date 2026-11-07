import {defineConfig} from 'vitest/config';
/** Explicit audit invocation only; not an automatic historical coverage increment. */
export default defineConfig({test:{include:['src/qa/qa003Multivariable.audit.ts'],maxWorkers:1,reporters:['default','json'],outputFile:'test-results/qa003-multivariable-vitest.json'}});
