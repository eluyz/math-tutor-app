import { describe, expect, it } from "vitest";
import { rational as r, addRational } from "../rational";
import { emptyAnswer, formatRational as format } from "../answers";
import { checkAnswer } from "../exercises";
import { englishTask } from "../locales/lessons-en";
import { feedback } from "../locales/pl";
import { displayedMatrixNextHint } from "./matrixHintDisplay";
import { matrixTemplates } from "./matrixLessons";
import { makeEducationInstance, VARIANTS_PER_LEVEL } from "./types";

describe("M01: visible addition/subtraction hints, no historical task mutation", () => {
  const addition = matrixTemplates.find(template => template.id === "matrix-add");
  const subtraction = matrixTemplates.find(template => template.id === "matrix-subtract");

  it("checks 72 addition variants, PL/EN hints and all grading outcomes", () => {
    expect(addition).toBeDefined();
    for (const level of ["easy", "medium", "hard"] as const) {
      for (let variant = 0; variant < VARIANTS_PER_LEVEL; variant++) {
        const task = makeEducationInstance(addition!, variant, level);
        expect(task.question).toContain("A + B");
        expect(task.hint).toContain("odpowiadających");

        // The legacy payload is intentionally immutable (snapshot regression).
        expect(task.nextHint).toContain("Przy odejmowaniu ujemnego elementu");
        const shown = displayedMatrixNextHint(task, "pl");
        expect(shown).toContain("Przy dodawaniu liczby ujemnej");
        expect(shown).toContain("a + (−b) = a − b");
        expect(shown).not.toContain("Przy odejmowaniu ujemnego elementu");
        expect(task.explanation).toContain(" + ");

        expect(task.answer.kind).toBe("matrix");
        if (task.answer.kind !== "matrix") throw Error("M01 addition answer must be a matrix");
        const correct = task.answer.values.map(row => row.map(format));
        const wrong = correct.map(row => [...row]);
        wrong[0][0] = format(addRational(task.answer.values[0][0], r(1)));
        expect(checkAnswer(task, { kind: "matrix", values: correct }, feedback).kind).toBe("correct");
        expect(checkAnswer(task, { kind: "matrix", values: wrong }, feedback).kind).toBe("incorrect");
        expect(checkAnswer(task, emptyAnswer(task.answer), feedback).kind).toBe("invalid");

        const en = englishTask(task);
        expect(en.question).toContain("Calculate A + B");
        expect(en.hint).toContain("matching sizes");
        expect(displayedMatrixNextHint(en, "en")).toBe(en.nextHint);
        expect(en.nextHint).toContain("matching positions");
      }
    }
  });

  it("keeps all subtraction hints and non-PL hints unchanged", () => {
    expect(subtraction).toBeDefined();
    for (const level of ["easy", "medium", "hard"] as const) {
      for (const variant of [0, 1, 7, 23]) {
        const task = makeEducationInstance(subtraction!, variant, level);
        expect(task.question).toContain("A − B");
        expect(task.nextHint).toContain("Przy odejmowaniu ujemnego elementu");
        expect(displayedMatrixNextHint(task, "pl")).toBe(task.nextHint);
        const en = englishTask(task);
        expect(en.question).toContain("Calculate A − B");
        expect(displayedMatrixNextHint(en, "en")).toBe(en.nextHint);
        expect(en.nextHint).toContain("Subtracting a negative entry");
      }
    }
  });
});
