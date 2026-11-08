import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import { taskPool } from "../generators";
import { eq, q } from "./audit";
import { localizeUniversity, makeUniversityTask } from "./catalog";
import { createRadicalDeterminant, createMixedRadicalDeterminant, radicalDeterminant, radicalDeterminantFamilies, radicalProduct, formatRadical } from "./radicalDeterminants";
import type { RadicalCoefficient, RadicalDeterminantProblem } from "./schema";

type Pair = readonly [number, number];
const pairMultiply = (x: Pair, y: Pair, d: number): Pair =>
  [x[0] * y[0] + d * x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
/** Independent pair-coefficient ring (does not call the new production evaluator). */
function reference(p: RadicalDeterminantProblem): Pair {
  const [[a, b], [c, d]] = p.matrix;
  const cv = (v: RadicalCoefficient): Pair => [v.whole, v.root];
  const ad = pairMultiply(cv(a), cv(d), p.radicand), bc = pairMultiply(cv(b), cv(c), p.radicand);
  return [ad[0] - bc[0], ad[1] - bc[1]];
}
describe("MT-EDU-032: exact radical 2×2 determinants", () => {
  it("validates boundaries and keeps old rational determinant APIs isolated", async () => {
    expect(radicalDeterminantFamilies).toHaveLength(2);
    for (const bad of [-1, 24, 1.2, NaN, Infinity])
      expect(() => createRadicalDeterminant(bad, "hard")).toThrow();
    expect(() => createRadicalDeterminant(0, "easy")).toThrow();
    const p = createRadicalDeterminant(1, "expert");
    expect(() => radicalDeterminant({...p, radicand: 11 as 2})).toThrow();
    expect(() => radicalDeterminant({...p, matrix: [[p.matrix[0][0]]] as unknown as RadicalDeterminantProblem["matrix"]})).toThrow();
    expect(() => radicalDeterminant({...p, matrix: [[{ whole: 0.5, root: 1 },p.matrix[0][1]],p.matrix[1]]})).toThrow();
    expect(formatRadical({whole: -2, root: -1}, 3)).toBe("−2 − √3");
    expect(formatRadical({whole: 0, root: 1}, 7)).toBe("√7");
    expect(formatRadical({whole: 5, root: 0}, 2)).toBe("5");
    expect(radicalProduct({whole: 1, root: 1}, {whole: 1, root: -1}, 2)).toEqual({whole:-1,root:0});
  });

  it("all 72 tasks have distinct exact matrices, rational results and independently verified PL/EN feedback", () => {
    const family = radicalDeterminantFamilies[0];
    expect(family.supportedDifficulties).toEqual(["hard","advanced","expert"]);
    const keys = new Set<string>(), values = new Set<number>();
    let nontrivial = 0, negatives = 0, zeros = 0, radicalCells = 0;
    for (const level of family.supportedDifficulties) {
      const pool = taskPool("determinants", level).filter(task => task.templateId === family.id);
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(task => task.contentKey)).size).toBe(24);
      for (let variant = 0; variant < 24; variant++) {
        const task = makeUniversityTask(family.id, variant, level);
        if(task.university.kind !== "determinant-radical-two") throw Error("Not radical determinant");
        const p = task.university, [whole,root] = reference(p);
        expect(root).toBe(0);
        expect(radicalDeterminant(p)).toEqual({whole,root:0});
        expect([2,3,5,7]).toContain(p.radicand);
        radicalCells += p.matrix.flat().filter(v => v.root !== 0).length;
        const ad = pairMultiply([p.matrix[0][0].whole,p.matrix[0][0].root],
          [p.matrix[1][1].whole,p.matrix[1][1].root],p.radicand);
        const bc = pairMultiply([p.matrix[0][1].whole,p.matrix[0][1].root],
          [p.matrix[1][0].whole,p.matrix[1][0].root],p.radicand);
        expect(ad[1]).toBe(bc[1]);
        nontrivial += ad[1] !== 0 ? 1 : 0;
        negatives += whole < 0 ? 1 : 0;
        zeros += whole === 0 ? 1 : 0;
        values.add(whole);
        keys.add(task.contentKey);
        for (const locale of ["pl","en"] as const) {
          const view = localizeUniversity(task,locale);
          expect(view.question).toContain(locale==="pl"?"pierwiastkami":"radical");
          expect(view.answer.kind).toBe("scalar");
          if(view.answer.kind!=="scalar") throw Error("Expected scalar");
          expect(eq(view.answer.value, q(whole))).toBe(true);
          expect(assessAnswer(view.answer,String(whole)).kind).toBe("correct");
          expect(assessAnswer(view.answer,String(whole+1)).kind).toBe("incorrect");
          expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
          expect(assessAnswer(view.answer,"1/0").kind).toBe("invalid");
          const working=view.solution!.filter(x=>x.kind==="working");
          expect(working).toHaveLength(4);
          expect(working[1].action).toContain("a₁₁a₂₂");
          expect(working[2].action).toContain("a₁₂a₂₁");
          expect(view.explanation).toContain("√d");
          expect(working[3].action).toContain("det(A)");
          expect(working[3].action).toContain(String(whole).replace("-","−"));
          expect(working.every(x=>x.reason.length>35)).toBe(true);
          if(locale==="en")
            expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
        }
      }
    }
    expect(keys.size).toBe(72);
    expect(values.size).toBeGreaterThan(15);
    expect(nontrivial).toBeGreaterThanOrEqual(30);
    expect(radicalCells).toBeGreaterThan(100);
    expect(negatives).toBeGreaterThan(0);
    expect(zeros).toBeGreaterThan(0);
  });
});

describe("M06: two distinct radical types per determinant (bounded source form)", () => {
  /** Independent exact ring check, not derived from production radicalProduct. */
  const oracle = (p: RadicalDeterminantProblem) => {
    const [[a, b], [c, d]] = p.matrix;
    const root = (x: RadicalCoefficient) => x.radicand ?? p.radicand;
    const multiply = (x: RadicalCoefficient, y: RadicalCoefficient) => {
      expect(root(x)).toBe(root(y));
      return [x.whole * y.whole + root(x) * x.root * y.root,
        x.whole * y.root + x.root * y.whole] as const;
    };
    const ad = multiply(a, d), bc = multiply(b, c);
    expect(root(a)).not.toBe(root(b));
    expect(ad[1]).toBe(0);
    expect(bc[1]).toBe(0);
    return ad[0] - bc[0];
  };
  it("rejects invalid inputs instead of silently merging unrelated radicals", () => {
    for (const bad of [-1, 24, 1.5, NaN, Infinity])
      expect(() => createMixedRadicalDeterminant(bad, "hard")).toThrow();
    expect(() => createMixedRadicalDeterminant(0, "easy")).toThrow();
    const p = createMixedRadicalDeterminant(2, "hard");
    const invalidRoot = { ...p, matrix: [
      [{ ...p.matrix[0][0], radicand: 11 }, p.matrix[0][1]], p.matrix[1],
    ] } as unknown as RadicalDeterminantProblem;
    expect(() => radicalDeterminant(invalidRoot)).toThrow();
    const wrongPair = { ...p, matrix: [
      [p.matrix[0][0], p.matrix[0][1]],
      [p.matrix[1][0], { ...p.matrix[1][1], radicand: p.matrix[0][1].radicand }],
    ] } as RadicalDeterminantProblem;
    expect(() => radicalDeterminant(wrongPair)).toThrow();
    const notRational = { ...p, matrix: [
      [{ ...p.matrix[0][0], whole: 1, root: 1 }, { ...p.matrix[0][1], whole: 1, root: 1 }],
      [{ ...p.matrix[1][0], whole: 1, root: 0 }, { ...p.matrix[1][1], whole: 1, root: 0 }],
    ] } as RadicalDeterminantProblem;
    expect(() => radicalDeterminant(notRational)).toThrow();
  });
  it("all 72 variants: independent arithmetic, bilingual steps, grading and distinct keys", () => {
    const family = radicalDeterminantFamilies.find(f => f.id === "determinant-radical-mixed-two");
    if (!family) throw Error("Missing M06 mixed-radical family");
    expect(family.supportedDifficulties).toEqual(["hard", "advanced", "expert"]);
    const seen = new Set<string>(), answers = new Set<number>();
    let zeros = 0, negatives = 0, positives = 0;
    for (const level of family.supportedDifficulties) {
      const pool = taskPool("determinants", level).filter(x => x.templateId === family.id);
      expect(pool).toHaveLength(24);
      for (let v = 0; v < 24; v++) {
        const p = createMixedRadicalDeterminant(v, level), expected = oracle(p);
        expect(radicalDeterminant(p)).toEqual({ whole: expected, root: 0 });
        const task = makeUniversityTask(family.id, v, level);
        expect(task.university).toEqual(p);
        seen.add(task.contentKey);
        answers.add(expected);
        if (expected === 0) zeros++;
        if (expected < 0) negatives++;
        if (expected > 0) positives++;
        for (const locale of ["pl", "en"] as const) {
          const view = localizeUniversity(task, locale);
          expect(view.answer.kind).toBe("scalar");
          if (view.answer.kind !== "scalar") throw Error("Expected scalar");
          expect(eq(view.answer.value, q(expected))).toBe(true);
          expect(assessAnswer(view.answer, String(expected)).kind).toBe("correct");
          expect(assessAnswer(view.answer, String(expected + 1)).kind).toBe("incorrect");
          expect(assessAnswer(view.answer, "1/0").kind).toBe("invalid");
          expect(assessAnswer(view.answer, emptyAnswer(view.answer)).kind).toBe("invalid");
          expect(view.solution!.filter(step => step.kind === "working")).toHaveLength(4);
          for (const cell of [p.matrix[0][0], p.matrix[0][1]])
            expect(view.solution!.some(step => step.action.includes("√" + cell.radicand))).toBe(true);
          expect(view.question).toContain(locale === "pl" ? "dwoma różnymi pierwiastkami" : "two distinct radicals");
          expect(view.hint.length).toBeGreaterThan(20);
          expect(view.nextHint.length).toBeGreaterThan(20);
          if (locale === "en") expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
        }
      }
    }
    expect(seen.size).toBe(72);
    expect(answers.size).toBeGreaterThan(25);
    expect(zeros).toBeGreaterThan(0);
    expect(negatives).toBeGreaterThan(0);
    expect(positives).toBeGreaterThan(0);
  });
});
