import { describe, it, expect } from "vitest";
import {
  sequenceFamilies,
  presentSequence,
  polynomialRatioLimit,
  sameLimit,
} from "./sequences";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { q, a, s, m, d, neg, eq, auditCalculation } from "./audit";
import {
  canonical,
  cmp,
  referenceRatio,
  referencePolynomialLimit,
} from "./functions-audit";
import type { Rational } from "../rational";
import type { GeometricTerm, SequenceProblem } from "./schema";
import {
  assessAnswer,
  emptyAnswer,
  formatRational as f,
  limitKinds,
  type LimitValue,
} from "../answers";
import { polishLearningText } from "../../e2e/helpers/localization";

// Reference uses coefficient convolution and positive ORIGINAL bases, not the
// production polynomial collector, squared-base map, or limit implementation.
const absolute = (x: Rational) => (x.numerator < 0n ? neg(x) : x);
function leading(terms: readonly GeometricTerm[], odd: boolean) {
  const bases: Rational[] = [];
  for (const term of terms) {
    const base = absolute(term.base);
    if (base.numerator && !bases.some((v) => eq(v, base))) bases.push(base);
  }
  for (const base of bases.sort((x, y) => -cmp(x, y))) {
    const coefficient = terms
      .filter((t) => eq(absolute(t.base), base))
      .map((t) => (odd ? m(t.coefficient, t.base) : t.coefficient))
      .reduce(a, q(0));
    if (coefficient.numerator) return { base, coefficient };
  }
  return null;
}
export function referenceGeometric(
  terms: readonly GeometricTerm[],
  denominator?: readonly GeometricTerm[],
): LimitValue {
  const limits = [false, true].map<LimitValue>((odd) => {
    const n = leading(terms, odd),
      den = denominator
        ? leading(denominator, odd)
        : { base: q(1), coefficient: q(1) };
    if (!den) throw new Error("Undefined reference quotient");
    if (!n || cmp(n.base, den.base) < 0)
      return { kind: "finite", value: q(0) } as LimitValue;
    const coefficient = canonical(d(n.coefficient, den.coefficient));
    return eq(n.base, den.base)
      ? { kind: "finite", value: coefficient }
      : ({
          kind:
            coefficient.numerator > 0n
              ? "positive-infinity"
              : "negative-infinity",
        } as LimitValue);
  });
  const [even, odd] = limits;
  return even.kind === odd.kind &&
    (even.kind !== "finite" ||
      (odd.kind === "finite" && eq(even.value, odd.value)))
    ? even
    : { kind: "does-not-exist" };
}
function referenceConjugate(
  p: Extract<SequenceProblem, { kind: "sequence-conjugate" }>,
): LimitValue {
  const { a: coefficient, b, k } = p;
  // Exact completing-square remainder proves radicand and conjugate positivity.
  const remainder = s(b, d(m(coefficient, coefficient), m(q(4), m(k, k))));
  expect(cmp(remainder, q(0))).toBeGreaterThan(0);
  return {
    kind: "finite",
    value: canonical(
      p.mode === "second-order"
        ? d(s(m(q(4), b), m(coefficient, coefficient)), q(8))
        : p.mode === "multiply"
          ? d(b, q(2))
          : d(coefficient, m(q(2), k)),
    ),
  };
}
describe("P3: analityczny niezależny audyt każdej instancji", () => {
  it.each(sequenceFamilies)(
    "$id: wszystkie deklarowane poziomy, warianty i języki",
    (family) => {
      for (const level of family.supportedDifficulties) {
        const keys = new Set<string>();
        for (let v = 0; v < 24; v++) {
          const task = makeUniversityTask(family.id, v, level),
            p = task.university;
          let expected: LimitValue;
          if (p.kind === "sequence-rational") {
            const ratio = referenceRatio(p.expression);
            expected = referencePolynomialLimit(ratio.n, ratio.d);
            // Every generated denominator has positive coefficients (or products
            // thereof), proving positivity on n>=1, rather than sampling terms.
            expect(ratio.d.every((c) => cmp(c, q(0)) >= 0)).toBe(true);
            expect(ratio.d.some((c) => cmp(c, q(0)) > 0)).toBe(true);
          } else if (p.kind === "sequence-geometric")
            expected = referenceGeometric(p.terms, p.denominator);
          else if (p.kind === "sequence-conjugate")
            expected = referenceConjugate(p);
          else throw new Error("Sequence expected");
          keys.add(task.contentKey);
          for (const locale of ["pl", "en"] as const) {
            const localized = localizeUniversity(task, locale),
              spec = localized.answer;
            if (spec.kind !== "limit") throw new Error("Typed limit expected");
            expect(sameLimit(spec.value, expected)).toBe(true);
            const correct = {
              kind: "limit" as const,
              classification: expected.kind,
              value: expected.kind === "finite" ? f(expected.value) : "",
            };
            expect(assessAnswer(spec, correct).kind).toBe("correct");
            expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
            for (const classification of limitKinds) {
              if (classification === expected.kind) continue;
              const input = {
                kind: "limit" as const,
                classification,
                value: classification === "finite" ? "1/3" : "",
              };
              expect(assessAnswer(spec, input).kind).toBe("incorrect");
            }
            if (expected.kind === "finite")
              expect(
                assessAnswer(spec, {
                  ...correct,
                  value: f(canonical(a(expected.value, q(1)))),
                }).kind,
              ).toBe("incorrect");
            expect(localized.id).toBe(task.id);
            expect(localized.university).toBe(p);
            expect(localized.parameters).toEqual(task.parameters);
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
  it.each([
    { bases: [[-1, 1]], expected: "does-not-exist" },
    { bases: [[-2, 1]], expected: "does-not-exist" },
    { bases: [[-1, 0]], expected: "finite" },
    { bases: [[0, 3]], expected: "finite" },
    {
      bases: [
        [-2, 1],
        [2, 1],
      ],
      expected: "does-not-exist",
    },
    {
      bases: [
        [-2, 1],
        [2, 2],
      ],
      expected: "positive-infinity",
    },
    {
      bases: [
        [-2, 1],
        [2, -2],
      ],
      expected: "negative-infinity",
    },
    {
      bases: [
        [-2, 1],
        [-2, -1],
        [1, 3],
      ],
      expected: "finite",
    },
  ])("geometryczny: $bases → $expected", ({ bases, expected }) => {
    const terms = bases.map(([base, c]) => ({
        base: q(base),
        coefficient: q(c),
      })),
      spec = presentSequence(
        { kind: "sequence-geometric", terms },
        "en",
      ).answer;
    if (spec.kind !== "limit") throw new Error();
    expect(spec.value.kind).toBe(expected);
    if (spec.value.kind === "finite")
      expect(eq(spec.value.value, q(bases.at(-1)![0] === 1 ? 3 : 0))).toBe(
        true,
      );
  });
  it("iloraz oscylacyjny ma granicę tylko przy zgodnych granicach podciągów", () => {
    const terms = [
      { base: q(2), coefficient: q(3) },
      { base: q(-2), coefficient: q(1) },
      { base: q(1), coefficient: q(1) },
    ];
    const p: SequenceProblem = {
      kind: "sequence-geometric",
      terms: terms.map((t) => ({
        ...t,
        coefficient: m(t.coefficient, q(-2, 3)),
      })),
      denominator: terms,
    };
    const spec = presentSequence(p, "en").answer;
    if (spec.kind !== "limit" || spec.value.kind !== "finite")
      throw new Error();
    expect(eq(spec.value.value, q(-2, 3))).toBe(true);
  });
  it("stopnie liczy po redukcji; odrzuca zerowy wielomian mianownika", () => {
    expect(polynomialRatioLimit([q(0), q(0)], [q(1), q(0)])).toEqual({
      kind: "finite",
      value: rationalZero(),
    });
    expect(polynomialRatioLimit([q(1), q(-1)], [q(-2)])).toEqual({
      kind: "positive-infinity",
    });
    expect(() => polynomialRatioLimit([q(1)], [q(0)])).toThrow();
  });
});
function rationalZero() {
  return { numerator: 0n, denominator: 1n };
}
