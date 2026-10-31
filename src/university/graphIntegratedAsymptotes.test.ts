import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import { taskPool } from "../generators";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import {
  integratedAsymptoteOracle, integratedAsymptoteAnswer,
  integratedAsymptoteValue, integratedPoles, makeIntegratedAsymptote,
  type IntegratedAsymptoteProblem,
} from "./graphIntegratedAsymptotes";

const fmt = (n: number) => String(n).replace(/-/g, "−");
function inIntervals(s: string, x: number): boolean {
  if (s === "∅") return false;
  return s.split(" ∪ ").some(part => {
    const m = /^([[(])([−-]?\d+); ([−-]?\d+)([)\]])$/.exec(part);
    if (!m) throw Error("Malformed interval " + part);
    const l = Number(m[2].replace("−", "-")), r = Number(m[3].replace("−", "-"));
    return (x > l || x === l && m[1] === "[") &&
      (x < r || x === r && m[4] === "]");
  });
}
/** Distinct numerical/geometry-level oracle, rather than using production
 * string concatenation to decide truth.  The central curve is strictly
 * monotone: check the sign with finite differences at three x positions.
 */
function graphAtX(p: IntegratedAsymptoteProblem, x: number): number | null {
  const [a, b] = integratedPoles(p);
  if (x === a || x === b) return null; // poles stay excluded, even at hollow exterior endpoints
  for (const [u, v] of [p.left, p.right]) if (x >= u.x && x <= v.x)
    return u.y + (v.y - u.y) * (x - u.x) / (v.x - u.x);
  return x > a && x < b ? integratedAsymptoteValue(p, x) : null;
}
function numericalSlope(p: IntegratedAsymptoteProblem, x: number, dx: number) {
  const lo = graphAtX(p, x - dx), hi = graphAtX(p, x + dx);
  if (lo === null || hi === null) throw Error("Derivative at missing x");
  return Math.sign(hi - lo);
}
function findMiddleAtY(p: IntegratedAsymptoteProblem, y: number): number {
  const [a, b] = integratedPoles(p);
  let lo = a + 1e-7, hi = b - 1e-7;
  const ascending = integratedAsymptoteValue(p, lo) < integratedAsymptoteValue(p, hi);
  for (let i = 0; i < 90; i++) {
    const mid = (lo + hi) / 2, f = integratedAsymptoteValue(p, mid);
    if ((f < y) === ascending) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
function independentlyOdd(p: IntegratedAsymptoteProblem): boolean {
  const [a, b] = integratedPoles(p);
  if (a !== -b || p.left[0].x !== -p.right[1].x ||
    p.left[1].x !== -p.right[0].x) return false;
  for (const [l, r] of [[p.left[0], p.right[1]], [p.left[1], p.right[0]]] as const)
    if (l.y !== -r.y) return false;
  return Math.abs(integratedAsymptoteValue(p, -0.5) +
    integratedAsymptoteValue(p, 0.5)) < 1e-8;
}

describe("F05 two poles, sloping exterior segments, all six graded fields", () => {
  it("rejects unsupported levels, geometry and excluded poles", () => {
    for (const v of [-1, 24, NaN, Infinity, 1.5])
      expect(() => makeIntegratedAsymptote(v, "hard")).toThrow();
    expect(() => makeIntegratedAsymptote(0, "easy")).toThrow();
    const p = makeIntegratedAsymptote(0, "hard"), [a, b] = integratedPoles(p);
    expect(() => integratedAsymptoteValue(p, a)).toThrow();
    expect(() => integratedAsymptoteValue(p, b)).toThrow();
    expect(() => integratedAsymptoteOracle({ ...p, radius: 0 })).toThrow();
    expect(() => integratedAsymptoteOracle({ ...p, left: [p.left[1], p.left[0]] })).toThrow();
  });
  it("72 exact geometric variants, six fields, independent numerical membership and PL/EN grading", () => {
    const keys = new Set<string>();
    let odd = 0, neither = 0, middleUp = 0, middleDown = 0;
    for (const difficulty of ["hard", "advanced", "expert"] as const) {
      const pool = taskPool("functions", difficulty)
        .filter(t => t.templateId === "function-integrated-asymptotes");
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(t => t.contentKey)).size).toBe(24);
      for (let v = 0; v < 24; v++) {
        const task = makeUniversityTask("function-integrated-asymptotes", v, difficulty);
        if (task.university.kind !== "function-integrated-asymptotes") throw Error("Wrong family");
        const p = task.university, o = integratedAsymptoteOracle(p);
        keys.add(task.contentKey);
        const [a, b] = integratedPoles(p);
        const [l0, l1] = p.left, [r0, r1] = p.right;
        expect(l0.x).toBeLessThan(l1.x);
        expect(l1.x).toBeLessThanOrEqual(a);
        expect(a).toBeLessThan(b);
        expect(b).toBeLessThanOrEqual(r0.x);
        const touchesPoles = v % 6 === 0;
        expect(l1.x === a).toBe(touchesPoles);
        expect(r0.x === b).toBe(touchesPoles);
        expect(r0.x).toBeLessThan(r1.x);
        expect(l0.y).not.toBe(l1.y);
        expect(r0.y).not.toBe(r1.y);
        for (const x of [l0.x, (l0.x + l1.x)/2, p.center,
          r1.x, (r0.x + r1.x)/2, ...(!touchesPoles ? [l1.x, r0.x] : [])]) {
          expect(graphAtX(p, x)).not.toBeNull();
          expect(inIntervals(o.domain, x)).toBe(true);
        }
        for (const x of [a, b, ...(touchesPoles ? [] : [(a+l1.x)/2, (b+r0.x)/2]), l0.x-1, r1.x+1]) {
          expect(graphAtX(p, x)).toBeNull();
          expect(inIntervals(o.domain, x)).toBe(false);
        }
        expect(o.domain.includes(fmt(touchesPoles ? a : l1.x) + (touchesPoles ? ")" : "]"))).toBe(true);
        expect(o.domain.includes((touchesPoles ? "(" : "[") + fmt(touchesPoles ? b : r0.x))).toBe(true);
        const sides = [
          [(l0.x+l1.x)/2, 0.01],
          [p.center, 0.01],
          [(r0.x+r1.x)/2, 0.01],
        ] as const;
        for (const [x, dx] of sides) {
          const slope = numericalSlope(p, x, dx);
          expect(slope).not.toBe(0);
          expect(inIntervals(o.increasing, x)).toBe(slope > 0);
          expect(inIntervals(o.decreasing, x)).toBe(slope < 0);
        }
        const eps = p.radius / 100000;
        const yA = integratedAsymptoteValue(p, a + eps);
        const yB = integratedAsymptoteValue(p, b - eps);
        expect(Math.abs(yA)).toBeGreaterThan(100);
        expect(Math.abs(yB)).toBeGreaterThan(100);
        expect(Math.sign(yA)).toBe(-Math.sign(yB));
        expect(o.range).toBe("ℝ");
        expect(o.injective).toBe("no");
        // A y-height reached on a finite outer segment is also reached in the
        // central interval: explicit independent witness for non-injectivity.
        const yy = l1.y, middleX = findMiddleAtY(p, yy);
        expect(middleX).toBeGreaterThan(a);
        expect(middleX).toBeLessThan(b);
        expect(Math.abs(integratedAsymptoteValue(p, middleX)-yy)).toBeLessThan(1e-7);
        const isOdd = independentlyOdd(p);
        expect(o.parity).toBe(isOdd ? "odd" : "neither");
        if (isOdd) odd++; else neither++;
        if (numericalSlope(p, p.center, 0.01) > 0) middleUp++; else middleDown++;
        for (const locale of ["pl", "en"] as const) {
          const view = localizeUniversity(task, locale), spec = view.answer;
          if (spec.kind !== "multi-choice") throw Error("Missing six fields");
          expect(spec.fields.map(f => f.id)).toEqual([
            "domain", "range", "increasing", "decreasing", "injective", "parity"]);
          const expected = integratedAsymptoteAnswer(p, locale);
          expect(spec).toEqual(expected);
          for (const field of spec.fields) {
            expect(field.options.some(opt => opt.value === field.value)).toBe(true);
            expect(field.options.length).toBeGreaterThanOrEqual(2);
            expect(new Set(field.options.map(opt => opt.label)).size).toBe(field.options.length);
            if (["domain", "range", "increasing", "decreasing"].includes(field.id))
              expect(field.options.find(q => q.value === field.value)?.label).toBe(o[field.id as "domain"|"range"|"increasing"|"decreasing"]);
          }
          const complete = { kind: "multi-choice" as const,
            values: Object.fromEntries(spec.fields.map(field => [field.id, field.value])) };
          expect(assessAnswer(spec, complete).kind).toBe("correct");
          expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
          for (const field of spec.fields) {
            const wrong = field.options.find(opt => opt.value !== field.value)!;
            expect(assessAnswer(spec, { ...complete,
              values: { ...complete.values, [field.id]: wrong.value } }).kind).toBe("incorrect");
          }
          expect(assessAnswer(spec, { ...complete,
            values: { ...complete.values, domain: "invalid" } }).kind).toBe("invalid");
          expect(view.solution).toHaveLength(7);
          expect(view.question).toContain(locale === "pl" ? "sześć" : "six");
          expect(view.explanation).toContain(o.range);
          if (locale === "en") expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
        }
      }
    }
    expect(keys.size).toBe(72);
    expect(odd).toBeGreaterThan(0);
    expect(neither).toBeGreaterThan(0);
    expect(middleUp).toBeGreaterThan(0);
    expect(middleDown).toBeGreaterThan(0);
    expect(fmt(-2)).toBe("−2");
  }, 60000);
});
