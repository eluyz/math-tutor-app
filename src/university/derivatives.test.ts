import { describe, it, expect } from "vitest";
import {
  derivativeFamilies,
  derivativeCoefficients,
  positivePolynomialSet,
  presentDerivative,
} from "./derivatives";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import {
  referenceExpand,
  referenceShift,
  referenceRoots,
  referenceSum,
  directValue,
  cmp,
  selectedSetContains,
} from "./functions-audit";
import { q, a, d, m, s, eq, auditCalculation } from "./audit";
import {
  formatRational as f,
  assessAnswer,
  emptyAnswer,
  type AnswerInput,
} from "../answers";
import type { Rational } from "../rational";
import { polishLearningText } from "../../e2e/helpers/localization";
import { shownPolynomial } from "../../e2e/helpers/functions";
import type { PolynomialFormula } from "./polynomial";
const shiftSlope = (p: readonly Rational[], at: Rational) =>
  referenceShift(p, at)[1] ?? q(0);
// Check each displayed intermediate derivative against an independently
// expanded polynomial, not just the final answer or arithmetic metadata.
function intermediateDerivatives(p: PolynomialFormula): Rational[][] {
  const original = referenceExpand(p),
    own = original.slice(1).map((c, i) => m(c, q(i + 1)));
  while (own.length > 1 && own.at(-1)!.numerator === 0n) own.pop();
  if (!own.length) own.push(q(0));
  const children =
    p.kind === "composition"
      ? [
          ...intermediateDerivatives({
            kind: "polynomial",
            coefficients: p.outer,
          }),
          ...intermediateDerivatives({
            kind: "polynomial",
            coefficients: p.inner,
          }),
        ]
      : p.kind === "sum" || p.kind === "difference" || p.kind === "product"
        ? [
            ...intermediateDerivatives(p.left),
            ...intermediateDerivatives(p.right),
          ]
        : [];
  return [...children, own];
}
describe("MT-EDU-005 P1: niezależny audyt pochodnych z definicji wielomianowej", () => {
  it.each(derivativeFamilies)(
    "$id: każdy poziom, 24 warianty i oba języki",
    (family) => {
      for (const level of family.supportedDifficulties) {
        const keys = new Set<string>();
        for (let v = 0; v < 24; v++) {
          const task = makeUniversityTask(family.id, v, level),
            p = task.university,
            spec = task.answer;
          if (
            p.kind !== "derivative" &&
            p.kind !== "derivative-analysis" &&
            p.kind !== "derivative-economics" &&
            p.kind !== "derivative-rational" &&
            p.kind !== "derivative-maximum"
          )
            throw new Error("Derivative expected");
          keys.add(task.contentKey);
          if (p.kind === "derivative-rational") {
            const n = referenceExpand(p.numerator),
              denominator = directValue(p.denominator, p.at),
              expected = d(
                s(
                  m(shiftSlope(n, p.at), denominator),
                  m(directValue(n, p.at), shiftSlope(p.denominator, p.at)),
                ),
                m(denominator, denominator),
              );
            expect(denominator.numerator).not.toBe(0n);
            if (spec.kind !== "scalar") throw new Error();
            expect(eq(spec.value, expected)).toBe(true);
          } else if (p.kind === "derivative-maximum") {
            const original = referenceExpand(p.profit),
              [c, b, A] = original;
            if (spec.kind !== "list") throw new Error();
            const [optimum, height] = spec.values,
              critical = d(s(q(0), b), m(q(2), A)),
              expected =
                cmp(critical, q(0)) < 0
                  ? q(0)
                  : cmp(critical, p.cap) > 0
                    ? p.cap
                    : critical;
            expect(cmp(A, q(0))).toBe(-1);
            expect(eq(optimum, expected)).toBe(true);
            expect(eq(height, directValue(original, optimum))).toBe(true);
            // Exact concavity certificate: P(q)=A(q-q0)^2+P(q0).
            expect(eq(a(m(q(2), m(A, critical)), b), q(0))).toBe(true);
            expect(
              eq(
                a(m(A, m(critical, critical)), directValue(original, critical)),
                c,
              ),
            ).toBe(true);
            for (const endpoint of [q(0), p.cap])
              expect(
                cmp(height, directValue(original, endpoint)),
              ).toBeGreaterThanOrEqual(0);
            if (p.cost && p.revenue) {
              const cost = referenceExpand(p.cost),
                revenue = referenceExpand(p.revenue),
                difference = referenceSum(revenue, cost, true);
              expect(difference.every((v, i) => eq(v, original[i]))).toBe(true);
              expect(cost.every((v) => cmp(v, q(0)) >= 0)).toBe(true);
              expect(cmp(shiftSlope(revenue, q(0)), q(0))).toBeGreaterThan(0);
              expect(
                cmp(d(directValue(revenue, p.cap), p.cap), q(0)),
              ).toBeGreaterThan(0);
            }
          } else if (p.kind === "derivative-economics") {
            const cost = referenceExpand(p.cost),
              revenue = referenceExpand(p.revenue),
              target =
                p.target === "cost"
                  ? cost
                  : p.target === "revenue"
                    ? revenue
                    : referenceSum(revenue, cost, true);
            expect(p.at.numerator > 0n).toBe(true);
            expect(cost.every((c) => cmp(c, q(0)) >= 0)).toBe(true);
            expect(
              cmp(d(directValue(revenue, p.at), p.at), q(0)),
            ).toBeGreaterThan(0);
            if (spec.kind !== "scalar") throw new Error();
            expect(eq(spec.value, shiftSlope(target, p.at))).toBe(true);
          } else {
            const original = referenceExpand(p.formula);
            if (p.kind === "derivative-analysis") {
              const derivative = original
                  .slice(1)
                  .map((c, i) => m(c, q(i + 1))),
                roots = referenceRoots(derivative).sort(cmp);
              if (spec.kind === "list") {
                expect(spec.values).toHaveLength(roots.length * 2);
                roots.forEach((root, i) => {
                  expect(eq(spec.values[i * 2], root)).toBe(true);
                  expect(
                    eq(spec.values[i * 2 + 1], directValue(original, root)),
                  ).toBe(true);
                  expect(shiftSlope(original, root).numerator).toBe(0n);
                  const curvature = referenceShift(original, root)[2];
                  if (curvature.numerator === 0n) {
                    expect(roots).toHaveLength(1);
                    expect(derivative).toHaveLength(3);
                    // Repeated derivative root: exact coefficient identity,
                    // same sign on both sides, no extremum.
                    expect(
                      eq(derivative[0], m(derivative[2], m(root, root))),
                    ).toBe(true);
                    expect(
                      eq(derivative[1], m(q(-2), m(derivative[2], root))),
                    ).toBe(true);
                  }
                });
              } else if (spec.kind === "choice") {
                if (p.target === "classification") {
                  const types = roots.map((root) => {
                    const shifted = referenceShift(original, root),
                      curvature = shifted[2] ?? q(0);
                    return cmp(curvature, q(0)) > 0
                      ? "min"
                      : cmp(curvature, q(0)) < 0
                        ? "max"
                        : "none";
                  });
                  expect(spec.value).toBe(`ext:${types.join("-")}`);
                } else {
                  const points = [
                    ...roots,
                    s(roots[0], q(1)),
                    a(roots.at(-1)!, q(1)),
                  ];
                  for (let j = 1; j < roots.length; j++)
                    points.push(d(a(roots[j - 1], roots[j]), q(2)));
                  for (const at of points)
                    expect(selectedSetContains(spec.value, at)).toBe(
                      p.target === "negative"
                        ? cmp(shiftSlope(original, at), q(0)) < 0
                        : cmp(shiftSlope(original, at), q(0)) > 0,
                    );
                }
              } else throw new Error();
            } else if (p.target === "formula") {
              if (spec.kind !== "list") throw new Error();
              const derivative = [...spec.values].reverse();
              const reference = original.slice(1).map((c, i) => m(c, q(i + 1)));
              while (reference.length > 1 && reference.at(-1)!.numerator === 0n)
                reference.pop();
              if (!reference.length) reference.push(q(0));
              expect(derivative).toHaveLength(reference.length);
              derivative.forEach((c, i) =>
                expect(eq(c, reference[i])).toBe(true),
              );
              // Supplemental checks use the exact coefficient of h in f(x+h).
              for (const at of [q(-2), q(-1), q(0), q(1), q(3, 2)])
                expect(
                  eq(directValue(derivative, at), shiftSlope(original, at)),
                ).toBe(true);
            } else if (p.target === "point") {
              if (spec.kind !== "scalar") throw new Error();
              expect(eq(spec.value, shiftSlope(original, p.at))).toBe(true);
            } else {
              if (spec.kind !== "list") throw new Error();
              const [slope, intercept] = spec.values;
              expect(eq(slope, shiftSlope(original, p.at))).toBe(true);
              expect(
                eq(a(m(slope, p.at), intercept), directValue(original, p.at)),
              ).toBe(true);
              const difference = referenceSum(
                  original,
                  [intercept, slope],
                  true,
                ),
                shifted = referenceShift(difference, p.at);
              expect(shifted[0].numerator).toBe(0n);
              expect((shifted[1] ?? q(0)).numerator).toBe(0n);
            }
          }
          for (const locale of ["pl", "en"] as const) {
            const localized = localizeUniversity(task, locale),
              spec = localized.answer;
            const reference =
              p.kind === "derivative-maximum"
                ? []
                : p.kind === "derivative-rational"
                  ? [
                      ...intermediateDerivatives(p.numerator),
                      ...intermediateDerivatives({
                        kind: "polynomial",
                        coefficients: p.denominator,
                      }),
                    ]
                  : p.kind === "derivative-economics"
                    ? intermediateDerivatives(
                        p.target === "cost"
                          ? p.cost
                          : p.target === "revenue"
                            ? p.revenue
                            : {
                                kind: "difference",
                                left: p.revenue,
                                right: p.cost,
                              },
                      )
                    : intermediateDerivatives(p.formula);
            const shown = localized
              .solution!.filter(
                (step) =>
                  step.kind === "working" &&
                  /^[a-zA-Z]′\(x\) =/.test(step.action) &&
                  !/[⇒⇔]/.test(step.action),
              )
              .map((step) => shownPolynomial(step.action.split(" = ").at(-1)!));
            expect(shown).toHaveLength(reference.length);
            shown.forEach((poly, i) => {
              const wanted = reference[i];
              expect(poly).toHaveLength(wanted.length);
              poly.forEach((c, j) => expect(eq(c, wanted[j])).toBe(true));
            });
            const correct: AnswerInput =
              spec.kind === "scalar"
                ? f(spec.value)
                : spec.kind === "list"
                  ? { kind: "list", values: spec.values.map(f) }
                  : spec.kind === "choice"
                    ? { kind: "choice", value: spec.value }
                    : "";
            const wrong: AnswerInput =
              spec.kind === "scalar"
                ? "999999999999"
                : spec.kind === "list"
                  ? {
                      kind: "list",
                      values: spec.values.map(() => "999999999999"),
                    }
                  : spec.kind === "choice"
                    ? {
                        kind: "choice",
                        value: spec.options.find((o) => o.value !== spec.value)!
                          .value,
                      }
                    : "";
            expect(assessAnswer(spec, correct).kind).toBe("correct");
            expect(assessAnswer(spec, wrong).kind).toBe("incorrect");
            expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
            if (spec.kind === "scalar")
              expect(assessAnswer(spec, "1/0").kind).toBe("invalid");
            if (spec.kind === "list")
              expect(
                assessAnswer(spec, {
                  kind: "list",
                  values: spec.values.map((v, i) => (i ? f(v) : "1/0")),
                }).kind,
              ).toBe("invalid");
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
            expect(localized.id).toBe(task.id);
            expect(localized.contentKey).toBe(task.contentKey);
            expect(localized.solution!.at(-1)).toMatchObject({
              kind: "answer",
              answer: spec,
            });
            expect(localized.university).toBe(p);
          }
        }
        expect(keys.size).toBe(24);
      }
    },
  );
  it("stała ma pochodną zero, a znak kwadratu i podwójne zero nie dają fałszywego wzrostu", () => {
    expect(derivativeCoefficients([q(5)])).toEqual([q(0)]);
    expect(positivePolynomialSet([q(0)])).toEqual([]);
    expect(positivePolynomialSet([q(-1), q(0), q(-1)])).toEqual([]);
    const positive = positivePolynomialSet([q(0), q(0), q(1)]);
    expect(positive).toHaveLength(2);
    expect(positive[0].upperClosed).toBe(false);
    expect(positive[1].lowerClosed).toBe(false);
    expect(() =>
      presentDerivative(
        {
          kind: "derivative-rational",
          numerator: { kind: "polynomial", coefficients: [q(1)] },
          denominator: [q(0), q(1)],
          at: q(0),
        },
        "pl",
      ),
    ).toThrow(/domain/);
  });
});
