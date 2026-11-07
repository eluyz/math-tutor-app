import { test } from "@playwright/test";
import { batchB, batchBOracle, wrongBatchBAnswer } from "../src/qa/batchB";
import { runPinnedAcceptance } from "./helpers/acceptance";

for (const width of [375, 1280]) for (const locale of ["pl", "en"] as const) for (const row of batchB) {
  test(`${row.skill} ${row.family}/${row.level} ${locale} ${width}px`, async ({ page }, info) => {
    await runPinnedAcceptance(page, info, row, locale, width, batchBOracle, wrongBatchBAnswer);
  });
}
