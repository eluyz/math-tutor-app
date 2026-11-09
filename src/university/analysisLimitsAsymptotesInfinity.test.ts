import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import { eulerInfinityExponent, eulerInfinityFamilies, makeEulerInfinity, presentEulerInfinity } from "./analysisLimitsAsymptotesInfinity";
import type { Rational } from "../rational";

const number = (z: Rational) => Number(z.numerator) / Number(z.denominator);

/** Independent logarithmic limit of the *displayed* rational base, no production exponent helper. */
function numericalLog(p: ReturnType<typeof makeEulerInfinity>, x: number) {
  if (p.mode === "reciprocal") {
    const increment = number(p.a) * (p.pi ? Math.PI : 1) / x;
    return number(p.exponent) * x * Math.log1p(increment);
  }
  const increment = (number(p.numeratorShift) - number(p.denominatorShift)) /
    (number(p.leading) * x + number(p.denominatorShift));
  return (number(p.exponent) * x + number(p.exponentOffset)) * Math.log1p(increment);
}

describe("G06 infinity-form Euler limits — standalone candidate, not catalog-registered", () => {
  it("exposes one separate family without replacing the x→0 archived family", () => {
    expect(eulerInfinityFamilies).toHaveLength(1);
    expect(eulerInfinityFamilies[0].id).toBe("analysis-euler-function-infinity");
    expect(eulerInfinityFamilies[0].category).toBe("function-limits");
    expect(eulerInfinityFamilies[0].supportedDifficulties).toEqual(["hard"]);
    expect(() => makeEulerInfinity(-1)).toThrow();
    expect(() => makeEulerInfinity(24)).toThrow();
    expect(() => makeEulerInfinity(0.5)).toThrow();
  });

  it("checks all 24 synthetic variants independently, including π, negative exponents, 1 and PL/EN grading", () => {
    const classes = new Set<string>();
    const distinct = new Set<string>();
    for (let variant = 0; variant < 24; variant++) {
      const p = makeEulerInfinity(variant);
      const result = eulerInfinityExponent(p);
      const actualExponent = number(result.coefficient) * (result.pi ? Math.PI : 1);
      const logAtLargeX = numericalLog(p, 1e7);
      expect(logAtLargeX).toBeCloseTo(actualExponent, 4);
      if (p.mode === "ratio") {
        expect(p.leading.numerator).toBeGreaterThan(0n);
        const independent = number(p.exponent) *
          (number(p.numeratorShift) - number(p.denominatorShift)) / number(p.leading);
        expect(number(result.coefficient)).toBeCloseTo(independent, 12);
      } else {
        expect(number(result.coefficient)).toBeCloseTo(number(p.a) * number(p.exponent), 12);
      }
      const cls = result.coefficient.numerator === 0n ? "one" : result.pi ? "pi" : "rational";
      classes.add(cls);
      distinct.add(JSON.stringify(p, (_, value) => typeof value === "bigint" ? value.toString() : value));
      for (const locale of ["pl", "en"] as const) {
        const lesson = presentEulerInfinity(p, locale);
        const spec = lesson.answer;
        expect(lesson.question).toContain("x→+∞");
        expect(lesson.hint.length).toBeGreaterThan(12);
        expect(lesson.nextHint.length).toBeGreaterThan(12);
        expect(lesson.solution.length).toBeGreaterThanOrEqual(4);
        expect(lesson.explanation).toContain("B(x)");
        expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
        if (cls === "one") {
          expect(spec.kind).toBe("scalar");
          expect(assessAnswer(spec, "1").kind).toBe("correct");
          expect(assessAnswer(spec, "2").kind).toBe("incorrect");
          expect(lesson.explanation).not.toContain("ln(1+u(x))/u(x)");
        } else {
          expect(spec.kind).toBe("choice");
          if (spec.kind !== "choice") throw Error("Expected symbolic choices");
          expect(spec.value).toBe(`exp:${result.coefficient.numerator}/${result.coefficient.denominator}${result.pi ? ":pi" : ""}`);
          expect(spec.options.length).toBeGreaterThan(2);
          expect(assessAnswer(spec, { kind: "choice", value: spec.value }).kind).toBe("correct");
          expect(assessAnswer(spec, { kind: "choice", value: spec.options.find(item => item.value !== spec.value)!.value }).kind).toBe("incorrect");
          expect(assessAnswer(spec, { kind: "choice", value: "other" }).kind).toBe("invalid");
          if (result.pi) expect(lesson.question).toContain("π");
        }
        if (locale === "en") expect(lesson.explanation).not.toMatch(/Dla dostatecznie|Wyprowadzamy|Zachowujemy wynik/);
        for (const step of lesson.solution) {
          expect(step.action.length).toBeGreaterThan(1);
          expect(step.reason.length).toBeGreaterThan(6);
        }
      }
    }
    expect(distinct.size).toBe(24);
    expect(classes).toEqual(new Set(["one", "pi", "rational"]));
  });
});