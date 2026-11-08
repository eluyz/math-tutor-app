import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, type AnswerSpec } from "../answers";
import {
  evenOpenRangeFields, evenOpenRangeOracle, evenOpenRangeValue,
  makeEvenOpenRange, presentEvenOpenRange,
} from "./graphEvenOpenRange";

const fmt = (n: number) => String(n).replace(/-/g, "−");
const iv = (a: string, b: string, left = false, right = false) =>
  (left ? "[" : "(") + a + "; " + b + (right ? "]" : ")");

function independentlyExpected(h: number, lower: number) {
  const minus = fmt(-h), plus = fmt(h);
  return {
    domain: [iv("−∞", minus), iv(minus, plus), iv(plus, "+∞")].join(" ∪ "),
    range: iv(fmt(lower), "+∞"),
    increasing: [iv("0", plus, true), iv(plus, "+∞")].join(" ∪ "),
    decreasing: [iv("−∞", minus), iv(minus, "0", false, true)].join(" ∪ "),
    injective: "no",
    parity: "even",
  };
}
function answerInput(spec: AnswerSpec, expected: Record<string, string>) {
  if (spec.kind !== "multi-choice") throw Error("Expected six-field grader");
  return {
    kind: "multi-choice" as const,
    values: Object.fromEntries(spec.fields.map(field => {
      const option = field.options.find(o => o.label === expected[field.id]);
      if (!option) throw Error("Missing independent choice for " + field.id);
      return [field.id, option.value];
    })),
  };
}

describe("F05/b-like: standalone even open-range model (NOT source exact)", () => {
  const levels = ["hard", "advanced", "expert"] as const;
  for (const level of levels) {
    const unique = new Set<string>();
    for (let variant = 0; variant < 24; variant++) {
      it(level + ":" + variant + " exact geometry, 6 fields, independent grading PL/EN", () => {
        const p = makeEvenOpenRange(variant, level);
        const { hole: h, floor: b, lift: l, slope: s } = p;
        expect(h).toBeGreaterThanOrEqual(3);
        expect(l).toBeGreaterThan(0);
        expect(s).toBeGreaterThan(0);
        // Independent piecewise identities and symmetry across all three components.
        for (const x of [0, h / 4, h / 2, h * 3 / 4, h + 0.25, h + 3]) {
          const expected = x < h
            ? b + l + 2 * x * x / (h * h)
            : b + s * (x - h);
          expect(evenOpenRangeValue(p, x)).toBeCloseTo(expected, 12);
          expect(evenOpenRangeValue(p, -x)).toBeCloseTo(expected, 12);
          expect(expected).toBeGreaterThan(b);
        }
        // Both excluded x arguments have TWO distinct branch limits.
        expect(() => evenOpenRangeValue(p, h)).toThrow();
        expect(() => evenOpenRangeValue(p, -h)).toThrow();
        expect(b + l + 2).not.toBe(b);
        expect(evenOpenRangeValue(p, h + 1e-6)).toBeGreaterThan(b);
        expect(evenOpenRangeValue(p, h - 1e-6)).toBeGreaterThan(b);
        expect(evenOpenRangeValue(p, -h - 1e-6)).toBeGreaterThan(b);
        expect(evenOpenRangeValue(p, -h + 1e-6)).toBeGreaterThan(b);
        // Every y>b is attained on the right outer branch, even arbitrarily
        // close above b. The missing level b is never attained on any branch.
        for (const heightAbove of [0.0001, 0.5, 3, 100]) {
          const x = h + heightAbove / s;
          expect(evenOpenRangeValue(p, x)).toBeCloseTo(b + heightAbove, 9);
        }
        // The inner branch has derivative 4*x/h^2:
        // negative on (-h,0), zero at 0, positive on (0,h).
        for (const x of [-h / 2, h / 2]) {
          const eps = h / 100;
          const delta = evenOpenRangeValue(p, x + eps) - evenOpenRangeValue(p, x - eps);
          expect(Math.sign(delta)).toBe(Math.sign(x));
        }
        expect(evenOpenRangeValue(p, -h / 2)).toBe(evenOpenRangeValue(p, h / 2));
        const expected = independentlyExpected(h, b);
        expect(evenOpenRangeOracle(p)).toEqual(expected);
        for (const locale of ["pl", "en"] as const) {
          const view = presentEvenOpenRange(p, locale);
          const labels: Record<string, string> = {
            ...expected,
            injective: locale === "pl" ? "Nie" : "No",
            parity: locale === "pl" ? "Parzysta" : "Even",
          };
          const answer = view.answer;
          if (answer.kind !== "multi-choice") throw Error("Missing six fields");
          expect(answer.fields.map(f => f.id)).toEqual(evenOpenRangeFields);
          for (const field of answer.fields) {
            expect(field.options.some(o => o.value === field.value)).toBe(true);
            expect(new Set(field.options.map(o => o.label)).size).toBe(field.options.length);
          }
          const input = answerInput(answer, labels);
          expect(assessAnswer(answer, input)).toEqual({ kind: "correct" });
          expect(assessAnswer(answer, emptyAnswer(answer)).kind).toBe("invalid");
          for (const field of answer.fields) {
            const missing = { ...input.values };
            delete missing[field.id];
            expect(assessAnswer(answer, { kind: "multi-choice", values: missing }).kind)
              .toBe("invalid");
            const wrong = field.options.find(o => o.value !== input.values[field.id]);
            if (!wrong) throw Error("Missing distractor for " + field.id);
            expect(assessAnswer(answer, {
              kind: "multi-choice", values: { ...input.values, [field.id]: wrong.value },
            }).kind).toBe("incorrect");
          }
          const working = view.solution.filter(step => step.kind === "working");
          expect(working).toHaveLength(6);
          expect(working[0].action).toContain(expected.domain);
          expect(working[1].action).toContain(expected.range);
          expect(working[2].action).toContain(expected.increasing);
          expect(working[3].action).toContain(expected.decreasing);
          expect(view.solution.at(-1)?.kind).toBe("answer");
          expect(view.question.length).toBeGreaterThan(60);
          expect(view.hint.length).toBeGreaterThan(35);
          expect(view.nextHint.length).toBeGreaterThan(35);
          if (locale === "en") {
            expect([view.question, view.hint, view.nextHint].join(" "))
              .not.toMatch(/[ąćęłńóśźż]/i);
          }
        }
      });
      const p = makeEvenOpenRange(variant, level);
      const key = [p.hole, p.floor, p.lift, p.slope].join("|");
      expect(unique.has(key), "Duplicate geometry at " + level + ":" + variant).toBe(false);
      unique.add(key);
    }
    it(level + " has 24 distinct synthetic parameter tuples", () => {
      expect(unique.size).toBe(24);
    });
  }
  it("rejects unsupported tasks and invalid input at all holes", () => {
    for (const level of ["hard", "advanced", "expert"] as const) {
      expect(() => makeEvenOpenRange(-1, level)).toThrow();
      expect(() => makeEvenOpenRange(24, level)).toThrow();
      expect(() => makeEvenOpenRange(0.5, level)).toThrow();
    }
    expect(() => makeEvenOpenRange(0, "easy")).toThrow();
    const p = makeEvenOpenRange(0, "hard");
    expect(() => evenOpenRangeValue(p, Infinity)).toThrow();
    expect(() => evenOpenRangeValue({ ...p, slope: 0 }, 0)).toThrow();
    expect(() => evenOpenRangeOracle({ ...p, hole: -2 })).toThrow();
  });
});
