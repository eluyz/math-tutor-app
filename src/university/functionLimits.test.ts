import { it, expect, describe } from "vitest";
import { functionLimitFamilies, pointLimit, removeAt } from "./functionLimits";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import {
  referenceExpand,
  referencePointLimit,
  referencePolynomialLimit,
  referenceRatio,
  referenceShift,
  canonical,
} from "./functions-audit";
import { q, m, d, s, a, eq, auditCalculation } from "./audit";
import { sameLimit } from "./sequences";
import {
  assessAnswer,
  emptyAnswer,
  formatRational as f,
  limitKinds,
} from "../answers";
import type { LimitValue } from "../answers";
import { polishLearningText } from "../../e2e/helpers/localization";
describe("MT-EDU-005 P0: niezależny audyt granic funkcji", () => {
  it.each(functionLimitFamilies)(
    "$id: 24 warianty, każdy deklarowany poziom i oba języki",
    (family) => {
      for (const level of family.supportedDifficulties) {
        const keys = new Set<string>();
        for (let v = 0; v < 24; v++) {
          const task = makeUniversityTask(family.id, v, level),
            p = task.university;
          let expected: LimitValue;
          if (p.kind === "limit-point") {
            const top = referenceExpand(p.numerator);
            expected = referencePointLimit(top, p.denominator, p.at, p.side);
            // Values assigned at a never participate in either limit calculation.
            if (p.definedAt !== undefined && level === "medium" && expected.kind === "finite")
              expect(eq(expected.value, p.definedAt!)).toBe(false);
            const shifted = referenceShift(top, p.at);
            expect(shifted.length).toBeGreaterThan(0);
          } else if (p.kind === "limit-conjugate") {
            // Difference-of-squares identities, using independent raw fractions.
            const t = d(p.k, m(q(2), p.s)),
              remainder = p.mode === "two-roots" ? s(p.b, p.c) : s(p.b, m(t, t)),
              value = p.mode === "second-order" || p.mode === "two-roots" ? d(remainder, m(q(2), p.s)) : t;
            expect(p.s.numerator).toBeGreaterThan(0n);
            expect(eq(m(m(q(2), p.s), t), p.k)).toBe(true);
            expect(eq(a(m(t,t), s(p.b,m(t,t))), p.b)).toBe(true);
            if (p.mode === "two-roots") expect(eq(a(remainder,p.c),p.b)).toBe(true);
            expected = { kind: "finite", value: canonical(value) };
          } else if (p.kind === "limit-infinity") {
            const ratio = referenceRatio(p.expression),
              flip = (values: readonly ReturnType<typeof q>[]) =>
                values.map((c, i) =>
                  p.direction === "negative" ? m(c, q(i % 2 ? -1 : 1)) : c,
                );
            expected = referencePolynomialLimit(flip(ratio.n), flip(ratio.d));
          } else throw new Error("Function limit expected");
          keys.add(task.contentKey);
          for (const locale of ["pl", "en"] as const) {
            const localized = localizeUniversity(task, locale),
              spec = localized.answer;
            if (spec.kind !== "limit") throw new Error();
            expect(sameLimit(spec.value, expected)).toBe(true);
            expect(
              assessAnswer(spec, {
                kind: "limit",
                classification: expected.kind,
                value: expected.kind === "finite" ? f(expected.value) : "",
              }).kind,
            ).toBe("correct");
            expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
            expect(assessAnswer(spec, { kind: "limit", classification: "finite", value: "1/0" }).kind).toBe("invalid");
            if (expected.kind === "finite") expect(assessAnswer(spec, { kind: "limit", classification: "finite", value: f(a(expected.value, q(1))) }).kind).toBe("incorrect");
            for (const classification of limitKinds)
              if (classification !== expected.kind)
                expect(
                  assessAnswer(spec, {
                    kind: "limit",
                    classification,
                    value: "1/3",
                  }).kind,
                ).toBe("incorrect");
            expect(localized.id).toBe(task.id);
            expect(localized.contentKey).toBe(task.contentKey);
            expect(localized.solution!.at(-1)).toMatchObject({ kind: "answer", answer: spec });
            expect(localized.university).toBe(p);
            for (const step of localized.solution!)
              if (step.kind === "working")
                step.calculations.forEach((c) =>
                  expect(auditCalculation(c)).toBe(true),
                );
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
  it("rozróżnia lewy/prawy biegun, parzystą krotność i usuwalne 0/0", () => {
    expect(pointLimit([q(1)], [q(0), q(1)], q(0), "both")).toEqual({
      kind: "does-not-exist",
    });
    expect(pointLimit([q(1)], [q(0), q(1)], q(0), "left")).toEqual({
      kind: "negative-infinity",
    });
    expect(pointLimit([q(1)], [q(0), q(1)], q(0), "right")).toEqual({
      kind: "positive-infinity",
    });
    expect(pointLimit([q(-1)], [q(0), q(0), q(1)], q(0), "both")).toEqual({
      kind: "negative-infinity",
    });
    expect(
      pointLimit([q(-1), q(0), q(1)], [q(-1), q(1)], q(1), "both"),
    ).toEqual({ kind: "finite", value: q(2) });
    expect(pointLimit([q(0)], [q(0), q(1)], q(0), "both")).toEqual({
      kind: "finite",
      value: q(0),
    });
    expect(() => pointLimit([q(1)], [q(0)], q(0), "both")).toThrow();
    expect(removeAt([q(1), q(-2), q(1)], q(1)).order).toBe(2);
  });
});
