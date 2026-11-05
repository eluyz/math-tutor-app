import { test } from "@playwright/test";
import { batchD, batchDOracle, wrongBatchDAnswer } from "../src/qa/batchD";
import { runPinnedAcceptance } from "./helpers/acceptance";

for (const width of [375, 1280]) for (const locale of ["pl", "en"] as const) for (const row of batchD) {
  test(`${row.block} ${row.skill} ${row.family}/${row.level} ${locale} ${width}px`, async ({ page }, info) => {
    await runPinnedAcceptance(page, info, row, locale, width, batchDOracle, wrongBatchDAnswer);
  });
}
