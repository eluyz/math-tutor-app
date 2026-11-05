import { test } from "@playwright/test";
import { batchC, batchCOracle } from "../src/qa/batchC";
import { wrongAcceptanceAnswer } from "../src/qa/acceptance";
import { runPinnedAcceptance } from "./helpers/acceptance";

for (const width of [375, 1280]) for (const locale of ["pl", "en"] as const) for (const row of batchC) {
  test(`${row.skill} ${row.family}/${row.level} ${locale} ${width}px`, async ({ page }, info) => {
    await runPinnedAcceptance(page, info, row, locale, width, batchCOracle, wrongAcceptanceAnswer);
  });
}
