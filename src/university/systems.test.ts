import { it, expect, describe } from "vitest";
import { rational as r } from "../rational";
import { formatRational as f, emptyAnswer } from "../answers";
import { checkAnswer } from "../exercises";
import { uiCopy } from "../locales/ui";
import { systemFamilies, presentSystem } from "./systems";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { a, m, d, q, eq, laplace, auditCalculation } from "./audit";
import type { SystemProblem } from "./schema";
import { polishLearningText } from "../../e2e/helpers/localization";

describe("P1 niezależny audyt układów", () => {
  it.each(systemFamilies)(
    "$id: każdy deklarowany wariant i poziom",
    (family) => {
      for (const level of family.supportedDifficulties) {
        const keys = new Set<string>();
        for (let v = 0; v < 24; v++) {
          const task = makeUniversityTask(family.id, v, level),
            p = task.university;
          if (p.kind !== "system") throw new Error("System expected");
          keys.add(task.contentKey);
          const n = p.rhs.length;
          // Expand the original change of variables independently of originalSystem.
          const matrix = p.coefficients.map((row) =>
            p.coordinates === "sum-difference"
              ? [a(row[0], row[1]), a(row[0], m(q(-1), row[1]))]
              : p.coordinates === "triangular"
                ? [row[0], a(row[0], row[1]), a(row[1], row[2])]
                : [...row],
          );
          const determinant = laplace(matrix);
          if (task.answer.kind === "list") {
            expect(determinant.numerator).not.toBe(0n);
            const values = task.answer.values;
            expect(values).toHaveLength(n);
            for (let i = 0; i < n; i++)
              expect(
                eq(
                  matrix[i].map((c, j) => m(c, values[j])).reduce(a, q(0)),
                  p.rhs[i],
                ),
              ).toBe(true);
            for (let column = 0; column < n; column++) {
              const replaced = matrix.map((row, i) =>
                row.map((c, j) => (j === column ? p.rhs[i] : c)),
              );
              expect(
                eq(values[column], d(laplace(replaced), determinant)),
              ).toBe(true);
            }
          } else {
            if (task.answer.kind !== "choice")
              throw new Error("Classification expected");
            // Nonzero first coefficient fixes rank >= 1; augmented 2×2 minors detect inconsistency.
            const dx = laplace(matrix.map((row, i) => [p.rhs[i], row[1]]));
            const dy = laplace(matrix.map((row, i) => [row[0], p.rhs[i]]));
            expect(task.answer.value).toBe(
              determinant.numerator !== 0n
                ? "system-one"
                : dx.numerator !== 0n || dy.numerator !== 0n
                  ? "system-none"
                  : "system-many",
            );
          }
          for (const locale of ["pl", "en"] as const) {
            const localized = localizeUniversity(task, locale),
              spec = localized.answer;
            const input =
              spec.kind === "list"
                ? { kind: "list" as const, values: spec.values.map(f) }
                : spec.kind === "choice"
                  ? { kind: "choice" as const, value: spec.value }
                  : "";
            expect(
              checkAnswer(localized, input, uiCopy[locale].feedback).kind,
            ).toBe("correct");
            expect(
              checkAnswer(localized, emptyAnswer(spec), uiCopy[locale].feedback)
                .kind,
            ).toBe("invalid");
            const wrong =
              spec.kind === "list"
                ? {
                    kind: "list" as const,
                    values: spec.values.map((val, i) =>
                      i ? f(val) : "999999",
                    ),
                  }
                : {
                    kind: "choice" as const,
                    value:
                      spec.kind === "choice"
                        ? spec.options.find((o) => o.value !== spec.value)!
                            .value
                        : "",
                  };
            expect(
              checkAnswer(localized, wrong, uiCopy[locale].feedback).kind,
            ).toBe("incorrect");
            expect(localized.id).toBe(task.id);
            expect(localized.parameters).toEqual(task.parameters);
            expect(localized.contentKey).toBe(task.contentKey);
            for (const step of localized.solution!) {
              if (step.kind === "working")
                for (const c of step.calculations)
                  expect(auditCalculation(c)).toBe(true);
              if (locale === "en")
                expect(step.action + step.reason).not.toMatch(
                  polishLearningText,
                );
            }
            expect(localized.solution!.at(-1)).toMatchObject({
              kind: "answer",
              answer: localized.answer,
            });
            if (locale === "en")
              expect(
                localized.question +
                  localized.hint +
                  localized.nextHint +
                  localized.explanation,
              ).not.toMatch(polishLearningText);
          }
        }
        expect(keys.size).toBe(24);
      }
    },
  );
  it.each([
    {
      coefficients: [
        [0, 1],
        [1, 0],
      ],
      rhs: [2, -3],
      outcome: "system-one",
    },
    {
      coefficients: [
        [1, 2],
        [2, 4],
      ],
      rhs: [3, 6],
      outcome: "system-many",
    },
    {
      coefficients: [
        [1, 2],
        [2, 4],
      ],
      rhs: [3, 7],
      outcome: "system-none",
    },
    {
      coefficients: [
        [0, 0],
        [0, 0],
      ],
      rhs: [0, 0],
      outcome: "system-many",
    },
    {
      coefficients: [
        [0, 0],
        [0, 0],
      ],
      rhs: [0, 1],
      outcome: "system-none",
    },
  ])(
    "Cramer D=0 i zamiana zerowego elementu głównego: $outcome",
    ({ coefficients, rhs, outcome }) => {
      for (const method of [
        "cramer",
        "classification",
        "elimination",
      ] as const) {
        const problem: SystemProblem = {
          kind: "system",
          coefficients: coefficients.map((row) => row.map((v) => r(v))),
          rhs: rhs.map((v) => r(v)),
          method,
        };
        const presentation = presentSystem(problem, "en");
        if (presentation.answer.kind === "choice")
          expect(presentation.answer.value).toBe(outcome);
        else
          expect(presentation.answer).toEqual({
            kind: "list",
            labels: ["x", "y"],
            values: [r(-3), r(2)],
          });
        for (const step of presentation.solution)
          if (step.kind === "working")
            step.calculations.forEach((c) =>
              expect(auditCalculation(c)).toBe(true),
            );
      }
    },
  );
  it("odrzuca brak poziomu zamiast podmiany; sprawdza granice wariantów", () => {
    for (const variant of [-1, 24, 1.5])
      expect(() =>
        makeUniversityTask(systemFamilies[0].id, variant, "easy"),
      ).toThrow();
    expect(() =>
      makeUniversityTask("system-cramer-three", 0, "easy"),
    ).toThrow();
  });
});
