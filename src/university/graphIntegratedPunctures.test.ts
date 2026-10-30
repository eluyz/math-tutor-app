import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import { taskPool } from "../generators";
import { localizeUniversity, makeUniversityTask } from "./catalog";
import {
  integratedPunctureOracle, makeIntegratedPunctures, punctureHasHeight,
  type IntegratedPuncturesProblem,
} from "./graphIntegratedPunctures";

const fmt = (x: number) => String(x).replace(/-/g, "−");
const label = (lo: number, hi: number, left: boolean, right: boolean) =>
  (left ? "[" : "(") + fmt(lo) + "; " + fmt(hi) + (right ? "]" : ")");
const join = (segments: string[]) => segments.join(" ∪ ") || "∅";

/** Independent graph-as-a-set evaluation of membership at sampled x and y,
 * never calling the production interval union functions.
 */
function atX(p: IntegratedPuncturesProblem, x: number): number | null {
  const ns = p.nodes;
  if (x < ns[0].x || x > ns[4].x) return null;
  for (let i = 0; i < ns.length; i++)
    if (x === ns[i].x) return p.included[i] ? ns[i].y : null;
  for (let i = 0; i < 4; i++) if (x > ns[i].x && x < ns[i + 1].x)
    return ns[i].y + (x - ns[i].x) * (ns[i + 1].y - ns[i].y) /
      (ns[i + 1].x - ns[i].x);
  return null;
}
function sourceHasY(p: IntegratedPuncturesProblem, y: number) {
  for (let i = 0; i < 4; i++) {
    const a = p.nodes[i], b = p.nodes[i + 1];
    if (y < Math.min(a.y, b.y) || y > Math.max(a.y, b.y)) continue;
    if (y === a.y && !p.included[i] || y === b.y && !p.included[i + 1]) continue;
    return true;
  }
  return false;
}
function belongs(expression: string, x: number): boolean {
  if (expression === "∅") return false;
  return expression.split(" ∪ ").some(part => {
    const m = /^([[(])([−-]?\d+); ([−-]?\d+)([)\]])$/.exec(part);
    if (!m) throw Error("Unexpected interval " + part);
    const a = Number(m[2].replace("−", "-")), b = Number(m[3].replace("−", "-"));
    return (x > a || x === a && m[1] === "[") && (x < b || x === b && m[4] === "]");
  });
}
function independentParity(p: IntegratedPuncturesProblem) {
  const n = p.nodes, s = p.included;
  if (s[0] !== s[4] || s[1] !== s[3]) return "neither";
  if (n[0].y === n[4].y && n[1].y === n[3].y) return "even";
  return n[0].y === -n[4].y && n[1].y === -n[3].y && n[2].y === 0 ? "odd" : "neither";
}
function independentInjective(p: IntegratedPuncturesProblem) {
  const heights = [...new Set(p.nodes.map(n => n.y))].sort((a, b) => a - b);
  const levels = [...heights, ...heights.slice(1).map((v, i) => (v + heights[i + 1]) / 2)];
  for (const y of levels) {
    const xs: number[] = [];
    for (let i = 0; i < 4; i++) {
      const a = p.nodes[i], b = p.nodes[i + 1];
      if (y < Math.min(a.y, b.y) || y > Math.max(a.y, b.y)) continue;
      const x = a.x + (y - a.y) * (b.x - a.x) / (b.y - a.y);
      if (atX(p, x) === null) continue;
      if (!xs.some(v => Math.abs(v - x) < 1e-8)) xs.push(x);
    }
    if (xs.length >= 2) return false;
  }
  return true;
}

describe("F05 P0J integrated five-knot punctures", () => {
  it("rejects invalid geometry and unsupported variants", () => {
    for (const variant of [-1, 24, NaN, Infinity, 1.5])
      expect(() => makeIntegratedPunctures(variant, "hard")).toThrow();
    expect(() => makeIntegratedPunctures(0, "easy")).toThrow();
    const p = makeIntegratedPunctures(1, "hard");
    expect(() => integratedPunctureOracle({ ...p, nodes: [p.nodes[0], p.nodes[0], p.nodes[2], p.nodes[3], p.nodes[4]] })).toThrow();
    expect(() => integratedPunctureOracle({ ...p, included: [true, true, true, true, true] })).toThrow();
  });

  it("distinguishes restored and truly missing heights at holes", () => {
    for (const mode of [0, 1, 2, 3]) {
      const p = makeIntegratedPunctures(mode, "hard");
      const excluded = p.nodes.filter((n, i) => !p.included[i]);
      expect(excluded.length).toBeGreaterThan(0);
      for (const n of excluded) {
        expect(punctureHasHeight(p, n.y)).toBe(true);
        expect(sourceHasY(p, n.y)).toBe(true);
      }
    }
    for (const mode of [4, 5]) {
      const p = makeIntegratedPunctures(mode, "hard");
      for (const n of p.nodes.filter((n, i) => !p.included[i])) {
        expect(punctureHasHeight(p, n.y)).toBe(false);
        expect(sourceHasY(p, n.y)).toBe(false);
      }
    }
  });

  it("checks all 72 new tasks' six answers, levels, PL/EN copy and assessment", () => {
    const signatures = new Set<string>(), tally = { even: 0, odd: 0, neither: 0, yes: 0, no: 0 };
    for (const level of ["hard", "advanced", "expert"] as const) {
      const pool = taskPool("functions", level).filter(t => t.templateId === "function-integrated-punctures");
      expect(pool).toHaveLength(24);
      for (let v = 0; v < 24; v++) {
        const task = makeUniversityTask("function-integrated-punctures", v, level);
        if (task.university.kind !== "function-integrated-punctures") throw Error("Wrong task family");
        const p = task.university, o = integratedPunctureOracle(p);
        signatures.add(JSON.stringify(p));
        expect(p.nodes[0].x).toBe(-p.nodes[4].x);
        expect(p.nodes[1].x).toBe(-p.nodes[3].x);
        expect(o.parity).toBe(independentParity(p));
        expect(o.injective).toBe(independentInjective(p) ? "yes" : "no");
        tally[o.parity as "even" | "odd" | "neither"]++;
        tally[o.injective as "yes" | "no"]++;
        // Independent x-domain membership at every knot and between knots.
        for (let i = 0; i < p.nodes.length; i++)
          expect(belongs(o.domain, p.nodes[i].x)).toBe(p.included[i]);
        for (let i = 0; i < 4; i++) {
          const x = (p.nodes[i].x + p.nodes[i + 1].x) / 2;
          const rising = p.nodes[i + 1].y > p.nodes[i].y;
          expect(belongs(o.domain, x)).toBe(true);
          expect(belongs(o.increasing, x)).toBe(rising);
          expect(belongs(o.decreasing, x)).toBe(!rising);
        }
        // Value membership across each integer knot and each quarter-level.
        for (let y = -3; y <= 3; y += 0.25)
          expect(belongs(o.range, y), level + ":" + v + " y=" + y).toBe(sourceHasY(p, y));
        const removed = p.nodes.filter((n, i) => !p.included[i]);
        expect(removed.length).toBeGreaterThan(0);
        for (const n of removed) expect(punctureHasHeight(p, n.y)).toBe(sourceHasY(p, n.y));

        for (const locale of ["pl", "en"] as const) {
          const view = localizeUniversity(task, locale), spec = view.answer;
          if (spec.kind !== "multi-choice") throw Error("Expected 6 independent fields");
          expect(spec.fields.map(f => f.id)).toEqual(["domain", "range", "increasing", "decreasing", "injective", "parity"]);
          for (const f of spec.fields) {
            const right = f.options.find(opt => opt.value === f.value);
            expect(right).toBeDefined();
            expect(new Set(f.options.map(opt => opt.label)).size).toBe(f.options.length);
            if (f.id !== "injective" && f.id !== "parity") expect(right!.label).toBe(o[f.id]);
            expect(f.options.length).toBeGreaterThanOrEqual(2);
          }
          const correct = { kind: "multi-choice" as const,
            values: Object.fromEntries(spec.fields.map(f => [f.id, f.value])) };
          expect(assessAnswer(spec, correct).kind).toBe("correct");
          expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
          for (const f of spec.fields) {
            const wrong = f.options.find(opt => opt.value !== f.value)!;
            expect(assessAnswer(spec, { ...correct, values: { ...correct.values, [f.id]: wrong.value } }).kind).toBe("incorrect");
            expect(assessAnswer(spec, { ...correct, values: { ...correct.values, [f.id]: "" } }).kind).toBe("invalid");
          }
          expect(view.solution).toHaveLength(7);
          expect(view.question.toLowerCase()).toContain(locale === "pl" ? "sześć" : "six");
          expect(view.explanation).toContain(locale === "pl" ? "Dziedzina" : "Domain");
          if (locale === "en") expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
        }
      }
    }
    expect(signatures.size).toBe(72);
    for (const value of Object.values(tally)) expect(value).toBeGreaterThan(0);
  }, 60000);
});
