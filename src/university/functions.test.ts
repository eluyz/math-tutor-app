import { describe, expect, it } from "vitest";
import { functionFamilies, presentFunction } from "./functions";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import {
  canonical,
  cmp,
  convolution,
  directComposition,
  directValue,
  referenceExpand,
  referenceRoots,
  referenceSum,
  selectedSetContains,
} from "./functions-audit";
import { q, a, m, s, d, neg, eq, auditCalculation } from "./audit";
import { isFunctionProblem, type FunctionProblem } from "./schema";
import type { Rational } from "../rational";
import { rational as r } from "../rational";
import {
  assessAnswer,
  emptyAnswer,
  formatRational as f,
  type AnswerInput,
  type AnswerSpec,
} from "../answers";
import { polishLearningText } from "../../e2e/helpers/localization";
import { exactSquareRoot, polynomialRoots } from "./polynomial";
import {
  allReals,
  excludePoints,
  intersection,
  leftRay,
  normalize,
  rightRay,
  setKey,
  setText,
} from "./realSets";

function correctInput(spec: AnswerSpec): AnswerInput {
  if (spec.kind === "scalar") return f(spec.value);
  if (spec.kind === "choice") return { kind: "choice", value: spec.value };
  if (spec.kind === "roots")
    return {
      kind: "roots",
      classification:
        spec.values.length === 2
          ? "two"
          : spec.values.length
            ? "double"
            : "none",
      values: spec.values.map(f),
    };
  if (spec.kind === "list") return { kind: "list", values: spec.values.map(f) };
  throw new Error("Unexpected answer kind");
}
function independentDomain(
  p: Extract<FunctionProblem, { kind: "function-domain" }>,
  x: Rational,
): boolean {
  const first = s(x, p.p),
    second = s(x, p.q),
    third = s(x, p.r);
  switch (p.mode) {
    case "all":
      return true;
    case "one-pole":
      return !eq(first, q(0));
    case "two-poles":
      return !eq(m(first, second), q(0));
    case "root-ray":
      return cmp(m(p.sign, first), q(0)) >= 0;
    case "root-over-linear":
      return cmp(m(first, second), q(0)) >= 0 && !eq(third, q(0));
    case "root-over-two":
      return cmp(m(p.sign, first), q(0)) >= 0 && !eq(m(second, third), q(0));
    case "root-ratio":
      return (
        cmp(m(first, second), q(0)) >= 0 && cmp(m(p.sign, third), q(0)) > 0
      );
  }
}
function audit(p: FunctionProblem, spec: AnswerSpec) {
  const same = (x: Rational, y: Rational) => expect(eq(x, y)).toBe(true);
  if (p.kind === "function-value") {
    if (spec.kind !== "scalar") throw new Error("Scalar expected");
    const evaluate = (at: Rational) => {
      const input = p.inner ? directValue(p.inner, at) : at,
        denominator = directValue(p.denominator, input);
      expect(denominator.numerator).not.toBe(0n);
      return d(directValue(p.numerator, input), denominator);
    };
    same(
      spec.value,
      p.difference ? s(evaluate(p.at), evaluate(neg(p.at))) : evaluate(p.at),
    );
  } else if (p.kind === "function-domain") {
    if (spec.kind !== "choice") throw new Error("Set expected");
    // Each factor changes sign only at p/q/r. Endpoints plus one representative
    // of EVERY open cell exhaust all possibilities; no numerical guessing.
    const boundaries = [p.p, p.q, p.r].sort(cmp),
      points = [
        ...boundaries,
        s(boundaries[0], q(1)),
        a(boundaries.at(-1)!, q(1)),
      ];
    for (let i = 1; i < boundaries.length; i++)
      points.push(d(a(boundaries[i - 1], boundaries[i]), q(2)));
    for (const x of points)
      expect(selectedSetContains(spec.value, x)).toBe(independentDomain(p, x));
  } else if (p.kind === "function-zeros") {
    if (spec.kind !== "roots") throw new Error("Zeros expected");
    const numerator = referenceExpand(p.formula),
      roots = referenceRoots(numerator).filter(
        (x) => !eq(directValue(p.denominator, x), q(0)),
      );
    expect(spec.context).toBe("zeros");
    expect(spec.values).toHaveLength(roots.length);
    for (const x of spec.values) {
      expect(roots.some((v) => eq(v, x))).toBe(true);
      same(directValue(numerator, x), q(0));
      expect(directValue(p.denominator, x).numerator).not.toBe(0n);
    }
  } else if (p.kind === "function-linear") {
    if (spec.kind !== "list") throw new Error("Coefficients expected");
    const [slope, intercept] = spec.values,
      [x1, y1, x2, y2] = p.points,
      target = [intercept, slope];
    expect(eq(x1, x2)).toBe(false);
    const actual = p.known
      ? p.relation === "sum"
        ? referenceSum(target, p.known)
        : directComposition(target, p.known)
      : target;
    same(directValue(actual, x1), y1);
    same(directValue(actual, x2), y2);
    // Secant slope provides an independent uniqueness condition too.
    same(actual[1], d(s(y2, y1), s(x2, x1)));
  } else if (p.kind === "function-monotonicity") {
    if (spec.kind !== "choice") throw new Error("Monotonicity expected");
    const coefficients = referenceExpand(p.formula),
      slope = coefficients[1] ?? q(0);
    expect(coefficients.slice(2).every((v) => eq(v, q(0)))).toBe(true);
    expect(spec.value).toBe(
      cmp(slope, q(0)) > 0
        ? "function-increasing"
        : cmp(slope, q(0)) < 0
          ? "function-decreasing"
          : "function-constant",
    );
  } else if (p.kind === "function-shape") {
    const [c, b, leading] = referenceExpand(p.formula),
      h = d(neg(b), m(q(2), leading)),
      k = a(a(m(leading, m(h, h)), m(b, h)), c);
    // Independent completion of the square verifies all coefficients.
    same(neg(m(q(2), m(leading, h))), b);
    same(a(m(leading, m(h, h)), k), c);
    if (spec.kind === "list") {
      same(spec.values[0], h);
      same(spec.values[1], k);
    } else if (spec.kind === "choice") {
      expect(selectedSetContains(spec.value, k)).toBe(true);
      expect(selectedSetContains(spec.value, a(k, q(1)))).toBe(
        cmp(leading, q(0)) > 0,
      );
      expect(selectedSetContains(spec.value, s(k, q(1)))).toBe(
        cmp(leading, q(0)) < 0,
      );
      expect(JSON.parse(spec.value.slice(4))).toHaveLength(1);
    } else throw new Error("Vertex or range expected");
  } else {
    if (spec.kind !== "list")
      throw new Error("Polynomial coefficients expected");
    const composed = directComposition(p.outer, p.inner),
      expected = p.commutator
        ? referenceSum(composed, directComposition(p.inner, p.outer), true)
        : composed;
    const actual = [...spec.values].reverse();
    expect(actual).toHaveLength(expected.length);
    actual.forEach((x, i) => same(x, expected[i]));
    // Degree <=4: five distinct exact evaluations additionally determine the polynomial.
    for (const x of [q(-2), q(-1), q(0), q(1), q(3, 2)])
      same(
        directValue(actual, x),
        p.commutator
          ? s(
              directValue(p.outer, directValue(p.inner, x)),
              directValue(p.inner, directValue(p.outer, x)),
            )
          : directValue(p.outer, directValue(p.inner, x)),
      );
  }
}
describe("P2: niezależny audyt wszystkich funkcji i poziomów", () => {
  it.each(functionFamilies)(
    "$id: 24 prawdziwe warianty każdej deklarowanej pary",
    (family) => {
      for (const level of family.supportedDifficulties) {
        const keys = new Set<string>();
        for (let v = 0; v < 24; v++) {
          const task = makeUniversityTask(family.id, v, level),
            problem = task.university;
          if (!isFunctionProblem(problem)) throw new Error("Function expected");
          keys.add(task.contentKey);
          audit(problem, task.answer);
          for (const locale of ["pl", "en"] as const) {
            const localized = localizeUniversity(task, locale),
              spec = localized.answer,
              input = correctInput(spec);
            expect(localized.id).toBe(task.id);
            expect(localized.contentKey).toBe(task.contentKey);
            expect(localized.university).toBe(task.university);
            expect(assessAnswer(spec, input).kind).toBe("correct");
            expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
            const wrong: AnswerInput =
              spec.kind === "scalar"
                ? "999999999"
                : spec.kind === "choice"
                  ? {
                      kind: "choice",
                      value: spec.options.find((o) => o.value !== spec.value)!
                        .value,
                    }
                  : spec.kind === "roots"
                    ? {
                        kind: "roots",
                        classification: spec.values.length ? "none" : "double",
                        values: spec.values.length ? [] : ["999999999"],
                      }
                    : {
                        kind: "list",
                        values:
                          spec.kind === "list"
                            ? spec.values.map(() => "999999999")
                            : [],
                      };
            expect(assessAnswer(spec, wrong).kind).toBe("incorrect");
            if (spec.kind === "roots" && spec.values.length)
              expect(
                assessAnswer(spec, {
                  ...(input as Exclude<AnswerInput, string>),
                  kind: "roots",
                  classification: spec.values.length === 2 ? "two" : "double",
                  values: spec.values.map((_, i) => (i ? "1" : "1/0")),
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
          }
        }
        expect(keys.size, `${family.id}/${level}`).toBe(24);
      }
    },
  );
  it("zachowuje dziurę po skróceniu, także dla podwójnego pierwiastka", () => {
    for (const coefficients of [
      [r(0), r(0), r(1)],
      [r(0), r(-2), r(1)],
    ]) {
      const p: FunctionProblem = {
        kind: "function-zeros",
        formula: { kind: "polynomial", coefficients },
        denominator: [r(0), r(1)],
      };
      const spec = presentFunction(p, "en").answer;
      if (spec.kind !== "roots") throw new Error();
      expect(spec.values.map(f)).toEqual(
        coefficients[1].numerator === 0n ? [] : ["2"],
      );
    }
  });
  it("odrzuca podstawienie w biegun i niewymierny pierwiastek zamiast zaokrąglać", () => {
    expect(() =>
      presentFunction(
        {
          kind: "function-value",
          numerator: [r(1)],
          denominator: [r(0), r(1)],
          at: r(0),
        },
        "en",
      ),
    ).toThrow();
    expect(() => exactSquareRoot(r(2))).toThrow();
    expect(() => polynomialRoots([r(0)])).toThrow();
    expect(exactSquareRoot(r(49, 81))).toEqual(r(7, 9));
    expect(canonical(q(-2, -4))).toEqual(q(1, 2));
    expect(convolution([q(1), q(2)], [q(3), q(4)]).map(canonical)).toEqual([
      q(3),
      q(10),
      q(8),
    ]);
  });
});
describe("dokładne zbiory rzeczywiste: końce, przecięcia, dziury", () => {
  it("łączy stykające przedziały wyłącznie gdy nie ma dziury", () => {
    expect(setText([...leftRay(r(0), false), ...rightRay(r(0), false)])).toBe(
      "(−∞; 0) ∪ (0; +∞)",
    );
    expect(
      normalize([...leftRay(r(0), true), ...rightRay(r(0), false)]),
    ).toEqual(allReals);
    expect(
      setText(intersection(leftRay(r(0), true), rightRay(r(0), true))),
    ).toBe("{0}");
    expect(
      setText(intersection(leftRay(r(0), false), rightRay(r(0), true))),
    ).toBe("∅");
    expect(
      setText(excludePoints(rightRay(r(0), true), [r(0), r(2), r(2)])),
    ).toBe("(0; 2) ∪ (2; +∞)");
    expect(setKey(intersection(allReals, allReals))).toBe(setKey(allReals));
  });
});
