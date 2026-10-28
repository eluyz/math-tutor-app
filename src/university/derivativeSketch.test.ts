import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational } from "../answers";
import { taskPool } from "../generators";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { derivativeSketchFamilies, makeDerivativeSketch, sketchGeometry } from "./derivativeSketch";

describe("MT-SYLLABUS-D09: guided paper sketch from derivative sign charts", () => {
  it("rejects invalid variants and malformed geometry", () => {
    expect(derivativeSketchFamilies).toHaveLength(1);
    for (const v of [-1, 24, 1.5, NaN, Infinity])
      expect(() => makeDerivativeSketch(v, "hard")).toThrow();
    expect(() => makeDerivativeSketch(0, "easy")).toThrow();
    const p = makeDerivativeSketch(0, "hard");
    expect(() => sketchGeometry({ ...p, radius: 0 })).toThrow();
    expect(() => sketchGeometry({ ...p, orientation: 0 as 1 })).toThrow();
  });

  it("has 72 distinct exact study cases with independently checked derivatives", () => {
    const ids = new Set<string>();
    let inverted = 0;
    for (const level of ["hard", "advanced", "expert"] as const) {
      const pool = taskPool("derivatives", level)
        .filter(task => task.templateId === "derivative-sign-sketch");
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(task => task.contentKey)).size).toBe(24);
      for (let v = 0; v < 24; v++) {
        const task = makeUniversityTask("derivative-sign-sketch", v, level);
        if (task.university.kind !== "derivative-sign-sketch") throw Error("Wrong university problem");
        const p = task.university, g = sketchGeometry(p);
        const a = p.pole, s = p.radius, y = p.verticalShift, e = p.orientation;
        ids.add(task.contentKey); inverted += e < 0 ? 1 : 0;
        expect(g.leftX).toBe(a - s); expect(g.rightX).toBe(a + s);
        const f = (t: number) => e * (t + s * s / t) + y;
        const df = (t: number) => e * (1 - s * s / (t * t));
        const ddf = (t: number) => 2 * e * s * s / (t * t * t);
        expect(f(-s)).toBe(g.leftY); expect(f(s)).toBe(g.rightY);
        expect(Math.abs(df(-s))).toBe(0); expect(Math.abs(df(s))).toBe(0);
        for (const [t, first, second] of [
          [-2*s,e,-e],[-s/2,-e,-e],[s/2,-e,e],[2*s,e,e]
        ]) {
          expect(Math.sign(df(t))).toBe(first);
          expect(Math.sign(ddf(t))).toBe(second);
        }
        expect(g.leftKind).toBe(e === 1 ? "maximum" : "minimum");
        expect(g.rightKind).toBe(e === 1 ? "minimum" : "maximum");
        expect(g.obliqueIntercept).toBe(y-e*a);
        for (const locale of ["pl", "en"] as const) {
          const view = localizeUniversity(task, locale);
          if (view.answer.kind !== "list") throw Error("Expected four coordinates");
          expect(view.answer.labels).toEqual(["x₁","y₁","x₂","y₂"]);
          expect(view.answer.values.map(formatRational)).toEqual(
            [g.leftX,g.leftY,g.rightX,g.rightY].map(n=>String(n).replace(/-/g,"−")));
          const correct = { kind: "list" as const, values: [g.leftX,g.leftY,g.rightX,g.rightY].map(String) };
          expect(assessAnswer(view.answer, correct).kind).toBe("correct");
          expect(assessAnswer(view.answer,{kind:"list",values:[String(g.leftX+1),...correct.values.slice(1)]}).kind).toBe("incorrect");
          expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
          expect(assessAnswer(view.answer,{kind:"list",values:["1/0",...correct.values.slice(1)]}).kind).toBe("invalid");
          expect(view.question).toContain(locale==="pl"?"kartce":"on paper");
          expect(view.question).toContain(locale==="pl"?"samodzielnie":"yourself");
          expect(view.solution!.filter(s=>s.kind==="working")).toHaveLength(7);
          expect(view.explanation).toContain("f″");
          expect(view.explanation).toContain("x=");
          if(locale==="en")expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
        }
      }
    }
    expect(ids.size).toBe(72);
    expect(inverted).toBe(24);
  });
});