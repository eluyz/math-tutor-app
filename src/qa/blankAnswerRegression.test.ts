import { expect, it } from "vitest";
import { emptyAnswer } from "../answers";
import { checkAnswer, getAnswerSpec } from "../exercises";
import { difficulties, taskPool } from "../generators";
import { localizeTask } from "../locales/catalog";
import { uiCopy } from "../locales/ui";

// Exercise the real generated answer shapes implicated in browser failures.
// A passing grader check does not replace the corresponding UI reset checks.
for (const category of ["function-limits", "derivatives", "systems", "matrices"] as const) {
  it(`${category}: untouched answers remain invalid in PL and EN`, () => {
    let checked = 0;
    for (const level of difficulties) {
      for (const task of taskPool(category, level)) {
        const blank = emptyAnswer(getAnswerSpec(task));
        for (const locale of ["pl", "en"] as const) {
          expect(checkAnswer(localizeTask(task, locale), blank, uiCopy[locale].feedback).kind,
            `${task.id} (${locale})`).toBe("invalid");
        }
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
}
