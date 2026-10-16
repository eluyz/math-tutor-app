import { uiCopy } from "./ui";
import { describe, it, expect } from "vitest";
import { allTemplates, difficulties, taskPool } from "../generators";
import { categories, studyCategories, feedback } from "./pl";
import { englishTask, englishAnswer } from "./lessons-en";
import { solutionFor } from "../solutions/model";
import { getAnswerSpec, checkAnswer } from "../exercises";
const tasks = [...categories, ...studyCategories].flatMap(({ id }) =>
  difficulties.flatMap((d) => taskPool(id, d)),
);
const polish =
  /[ąćęłńóśźż]|\b(Oblicz|Rozwiąż|Podaj|Wybierz|Pomnóż|Podziel|Przy|Wiersz|Kolumna|Pierwiastek|Poprawna|Wyznacznik|Macierz|Iloczyn|wynik|wiersz|kolumna|Współczynnik|Wyraz)\b/u;
describe("kompletne angielskie lekcje bez zmiany tożsamości", () => {
  it.each(allTemplates)(
    "$id: każdy poziom i wariant ma treść, kroki i etykiety EN",
    ({ id }) => {
      for (const task of tasks.filter((t) => t.templateId === id)) {
        const en = englishTask(task),
          plSteps = solutionFor(task),
          enSteps = solutionFor(en);
        expect(en.id).toBe(task.id);
        expect(en.contentKey).toBe(task.contentKey);
        expect(en.parameters).toEqual(task.parameters);
        expect(en.difficulty).toBe(task.difficulty);
        expect(getAnswerSpec(en)).toEqual(englishAnswer(getAnswerSpec(task)));
        expect(enSteps.length).toBe(plSteps.length);
        for (const [i, step] of enSteps.entries()) {
          expect(step.action + step.reason).not.toMatch(polish);
          expect(step.action.length).toBeGreaterThan(5);
          expect(step.reason.length).toBeGreaterThan(15);
          const original = plSteps[i];
          if (step.kind === "working" && original.kind === "working")
            expect(step.calculations).toEqual(original.calculations);
        }
        const texts = [
          en.title,
          en.question,
          en.explanation,
          en.hint,
          en.nextHint,
          ...en.errorRules.flatMap((r) => [r.explanation, r.hint]),
          ...(en.step
            ? [en.step.question, en.step.correctHint, en.step.incorrectHint]
            : []),
        ];
        for (const text of texts) {
          expect(text).toBeTruthy();
          expect(text).not.toMatch(polish);
          expect(text).not.toMatch(/undefined|NaN/);
        }
        const wrong = checkAnswer(en, "99999", feedback);
        expect(wrong.kind).not.toBe("correct");
      }
    },
  );
});

it("katalog interfejsu ma zgodne klucze i niepuste angielskie komunikaty", () => {
  function audit(pl: unknown, en: unknown) {
    if (typeof pl === "string") {
      expect(typeof en).toBe("string");
      expect(en).toBeTruthy();
      expect(en).not.toMatch(polish);
      return;
    }
    if (typeof pl === "function") {
      expect(typeof en).toBe("function");
      return;
    }
    if (pl && typeof pl === "object" && en && typeof en === "object") {
      expect(Object.keys(en)).toEqual(Object.keys(pl));
      for (const key of Object.keys(pl))
        audit(
          (pl as Record<string, unknown>)[key],
          (en as Record<string, unknown>)[key],
        );
    }
  }
  audit(uiCopy.pl, uiCopy.en);
});
