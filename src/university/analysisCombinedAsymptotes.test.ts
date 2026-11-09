import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import { makeCombinedAsymptote, combinedAsymptoteResult, combinedAsymptoteFamilies, presentCombinedAsymptote } from "./analysisCombinedAsymptotes";
import type { Rational } from "../rational";

const val = (q: Rational) => Number(q.numerator) / Number(q.denominator);
const evalFormula = (p: ReturnType<typeof makeCombinedAsymptote>, x: number): number => {
  if (p.mode === "quadratic-over-linear" || p.mode === "removable-hole") {
    const pole=val(p.pole), a=val(p.slope), b=val(p.intercept), remainder=val(p.remainder);
    const numerator=a*x*x+(b-a*pole)*x+(remainder-b*pole);
    return numerator/(x-pole);
  }
  if (p.mode === "equal-degree") return (val(p.a)*x*x+val(p.b)*x+val(p.c))/(x*x+val(p.positiveShift));
  if (p.mode === "linear-over-linear") {
    const s=val(p.denominatorSlope),d=val(p.denominatorOffset),q=val(p.quotient);
    return (s*q*x+q*d+val(p.remainder))/(s*x+d);
  }
  if (p.mode === "cubic-over-positive-quadratic") {
    const s=val(p.slope),h=val(p.positiveShift);
    return (s*x*x*x+(s*h+val(p.remainderSlope))*x+val(p.remainderOffset))/(x*x+h);
  }
  return val(p.slope)*x+val(p.remainder)/x;
};

describe("G07 combined rational asymptotes — 24 synthetic source-shape candidates", () => {
  it("has a hard-only standalone family without touching catalog registration", () => {
    expect(combinedAsymptoteFamilies).toHaveLength(1);
    expect(combinedAsymptoteFamilies[0].id).toBe("analysis-asymptotes-combined-rational");
    expect(combinedAsymptoteFamilies[0].supportedDifficulties).toEqual(["hard"]);
    for (const n of [-1, 24, 3.5, NaN]) expect(() => makeCombinedAsymptote(n)).toThrow();
  });
  it("independently checks decomposition, every asymptote, no-pole and hole cases", () => {
    const kinds = new Set<string>();
    const seen = new Set<string>();
    let poles=0,holes=0,horizontal=0,oblique=0;
    for (let v=0;v<24;v++) {
      const p=makeCombinedAsymptote(v), a=combinedAsymptoteResult(p);
      kinds.add(p.mode);
      seen.add(JSON.stringify(p,(_,z)=>typeof z==="bigint"?z.toString():z));
      const slope=val(a.slope), intercept=val(a.intercept);
      for (const x of [-1e7,1e7]) {
        expect(Math.abs(evalFormula(p,x)-(slope*x+intercept))).toBeLessThan(0.05);
      }
      if (slope===0) horizontal++; else oblique++;
      if (a.vertical!==null) {
        poles++;
        const center=val(a.vertical);
        expect(Math.abs(evalFormula(p,center-1e-6))).toBeGreaterThan(1000);
        expect(Math.abs(evalFormula(p,center+1e-6))).toBeGreaterThan(1000);
      } else if(a.excluded!==null) {
        holes++;
        const center=val(a.excluded);
        expect(Math.abs(evalFormula(p,center-1e-5))).toBeLessThan(1000);
        expect(Math.abs(evalFormula(p,center+1e-5))).toBeLessThan(1000);
      }
      for (const lang of ["pl","en"] as const) {
        const shown=presentCombinedAsymptote(p,lang),spec=shown.answer;
        expect(shown.question).toContain("f(x)=");
        expect(shown.hint.length).toBeGreaterThan(15);
        expect(shown.nextHint.length).toBeGreaterThan(15);
        expect(shown.solution.length).toBeGreaterThanOrEqual(5);
        expect(shown.solution.at(-1)?.kind).toBe("answer");
        expect(spec.kind).toBe("multi-choice");
        if (spec.kind!=="multi-choice") throw Error("Expected two separate graded fields");
        expect(spec.fields.map(f=>f.id)).toEqual(["vertical","linear"]);
        for(const field of spec.fields){
          expect(field.options.some(o=>o.value===field.value)).toBe(true);
          expect(new Set(field.options.map(o=>o.value)).size).toBe(field.options.length);
        }
        const correct={kind:"multi-choice" as const,values:Object.fromEntries(spec.fields.map(f=>[f.id,f.value]))};
        expect(assessAnswer(spec,correct).kind).toBe("correct");
        expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
        const changed={...correct,values:{...correct.values,linear:"line:none"}};
        expect(assessAnswer(spec,changed).kind).toBe("incorrect");
        expect(assessAnswer(spec,{...correct,values:{...correct.values,vertical:"bad"}}).kind).toBe("invalid");
        expect(shown.explanation).toContain("x→±∞");
        if(lang==="en") expect(shown.explanation).not.toMatch(/Wyznacz|Mianownik|Najpierw ustalamy/);
      }
    }
    expect(seen.size).toBe(24);
    expect(kinds).toEqual(new Set(["quadratic-over-linear","removable-hole","equal-degree","linear-over-linear","cubic-over-positive-quadratic","linear-plus-reciprocal"]));
    expect(poles).toBe(14);
    expect(holes).toBe(2);
    expect(horizontal).toBe(8);
    expect(oblique).toBe(16);
  });
});
