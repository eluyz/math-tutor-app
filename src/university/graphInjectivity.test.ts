import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import { taskPool } from "../generators";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import {
  graphInjectivityFamilies, makeGraphInjectivity, isInjectiveGraph,
  duplicateHorizontalLevel, type GraphInjectivityProblem,
} from "./graphInjectivity";

/** Independent line/segment intersection oracle; never calls the production predicate. */
function intersections(g: GraphInjectivityProblem, y: number): number[] {
  const found: number[] = [];
  for (let i = 0; i < 2; i++) {
    const a = g.nodes[i], b = g.nodes[i + 1];
    if (a.y === b.y) {
      if (a.y === y) {
        found.push(a.x + (b.x - a.x) / 4, a.x + 3 * (b.x - a.x) / 4);
      }
      continue;
    }
    if (y < Math.min(a.y, b.y) || y > Math.max(a.y, b.y)) continue;
    const x = a.x + (y - a.y) * (b.x - a.x) / (b.y - a.y);
    if (i === 0 && x === g.nodes[0].x && !g.leftClosed) continue;
    if (i === 1 && x === g.nodes[2].x && !g.rightClosed) continue;
    found.push(x);
  }
  return [...new Set(found.map(x => x.toFixed(8)))].map(Number);
}

describe("F05 horizontal-line injectivity method, source-form bounded", () => {
  it("rejects invalid variants and degenerate graph geometry", () => {
    expect(graphInjectivityFamilies).toHaveLength(1);
    for (const v of [-1, 24, 1.25, NaN, Infinity])
      expect(() => makeGraphInjectivity(v, "hard")).toThrow();
    expect(() => makeGraphInjectivity(0, "expert")).toThrow();
    const ok = makeGraphInjectivity(0, "easy");
    expect(() => isInjectiveGraph({ ...ok,
      nodes: [{x:0,y:0},{x:0,y:1},{x:2,y:2}] })).toThrow();
  });

  it("tests all 72 shapes with horizontal-intersection oracle, bilingual feedback and solutions", () => {
    const unique = new Set<string>();
    let yes = 0, no = 0, flat = 0, turn = 0, open = 0;
    for (const level of ["easy", "medium", "hard"] as const) {
      const pool = taskPool("functions", level)
        .filter(task => task.templateId === "function-graph-injectivity");
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(task => task.contentKey)).size).toBe(24);
      for (let variant = 0; variant < 24; variant++) {
        const task = makeUniversityTask("function-graph-injectivity", variant, level);
        if (task.university.kind !== "function-graph-injectivity") throw Error("Unexpected kind");
        const g = task.university, [a,b,c] = g.nodes;
        unique.add(task.contentKey);
        expect(a.x).toBeLessThan(b.x);
        expect(b.x).toBeLessThan(c.x);
        expect(g.nodes.every(n => Number.isSafeInteger(n.y) && Math.abs(n.y) <= 4)).toBe(true);
        const slopes = [b.y-a.y,c.y-b.y];
        const expected = slopes[0] * slopes[1] > 0; // independent of production implementation
        expect(isInjectiveGraph(g)).toBe(expected);
        const witness = duplicateHorizontalLevel(g);
        if (expected) {
          yes++;
          expect(witness).toBeNull();
          for (let t = -20; t <= 20; t++)
            expect(intersections(g,t/4).length).toBeLessThanOrEqual(1);
        } else {
          no++;
          if (slopes.includes(0)) flat++; else turn++;
          expect(witness).not.toBeNull();
          if (witness !== null) {
            const y = Number(witness.numerator) / Number(witness.denominator);
            expect(intersections(g, y).length,
              "Two distinct x on the horizontal witness, even when endpoints are open").toBeGreaterThanOrEqual(2);
          }
        }
        if (!g.leftClosed || !g.rightClosed) open++;
        for (const locale of ["pl", "en"] as const) {
          const view = localizeUniversity(task,locale);
          expect(view.answer.kind).toBe("choice");
          if (view.answer.kind !== "choice") throw Error("No choice answer");
          expect(view.answer.options).toHaveLength(2);
          expect(new Set(view.answer.options.map(o=>o.label)).size).toBe(2);
          expect(view.answer.value).toBe(expected ? "injective" : "not-injective");
          expect(assessAnswer(view.answer,{kind:"choice",value:view.answer.value}).kind).toBe("correct");
          expect(assessAnswer(view.answer,{kind:"choice",value:expected?"not-injective":"injective"}).kind).toBe("incorrect");
          expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
          expect(assessAnswer(view.answer,{kind:"choice",value:"missing"}).kind).toBe("invalid");
          expect(view.solution?.length).toBeGreaterThanOrEqual(4);
          expect(view.question).toContain(locale === "pl" ? "różnowartościowa" : "one-to-one");
          expect(view.explanation).toContain(locale === "pl" ? "prostej" : "horizontal");
          if (locale === "en") expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
        }
      }
    }
    expect(unique.size).toBe(72);
    expect(yes).toBeGreaterThan(15);
    expect(no).toBeGreaterThan(35);
    expect(flat).toBeGreaterThan(12);
    expect(turn).toBeGreaterThan(12);
    expect(open).toBeGreaterThan(20);
  }, 60_000);
});