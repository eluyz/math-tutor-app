import { describe, it, expect } from "vitest";
import { assessAnswer, emptyAnswer, type AnswerSpec } from "../answers";
import {
  makeSingleHoleRecovery, singleHoleGeometry, singleHoleRecoveryValue,
  singleHoleRecoveryWitnesses, singleHoleRecoveryOracle,
  singleHoleRecoveryFields, presentSingleHoleRecovery,
} from "./graphSingleHoleRecovery";

const fmt = (n: number) => String(n).replace(/-/g, "−");
const iv = (lo: string, hi: string, left = false, right = false) =>
  (left ? "[" : "(") + lo + "; " + hi + (right ? "]" : ")");

const independentlyExpected = (c: number, t: number, R: number, H: number) => ({
  domain: [iv("−∞", fmt(c)), iv(fmt(c), fmt(R), false, true)].join(" ∪ "),
  range: iv("−∞", fmt(H), false, true),
  increasing: [iv("−∞", fmt(c)), iv(fmt(c), fmt(t), false, true)].join(" ∪ "),
  decreasing: iv(fmt(t), fmt(R), true, true),
  injective: "no",
  parity: "neither",
});

function independentlySelect(spec: AnswerSpec, labelMap: Record<string, string>) {
  if (spec.kind !== "multi-choice") throw Error("Six-field task expected");
  return {
    kind: "multi-choice" as const,
    values: Object.fromEntries(spec.fields.map(field => {
      const found = field.options.filter(option => option.label === labelMap[field.id]);
      expect(found.length, "Exactly one correct semantic option for " + field.id).toBe(1);
      return [field.id, found[0].value];
    })),
  };
}

describe("F05/e-like standalone synthetic single-hole, two-height recovery", () => {
  const variants: string[] = [];
  for (const difficulty of ["hard", "advanced", "expert"] as const) {
    for (let variant = 0; variant < 24; variant++) {
      it(difficulty + "/" + variant + ": exact piecewise math and six independently graded PL/EN fields", () => {
        const p = makeSingleHoleRecovery(variant, difficulty);
        const g = singleHoleGeometry(p), w = singleHoleRecoveryWitnesses(p);
        const {c,A,B,H,t,R,E} = g;
        expect(B).toBeLessThan(A);
        expect(A).toBeLessThan(H);
        expect(B).toBeLessThan(E);
        expect(E).toBeLessThan(H);
        expect(c).toBeLessThan(t);
        expect(t).toBeLessThan(R);
        expect(p.leftSlope).toBeGreaterThan(0);

        // Original private graph coordinates are NEVER used here.
        // Independent evaluation of each genuinely different branch.
        for (const x of [c-25,c-2,c-0.001]) {
          expect(singleHoleRecoveryValue(p,x)).toBeCloseTo(A+p.leftSlope*(x-c),10);
        }
        for (const x of [c+0.001,c+p.upSpan/3,c+2*p.upSpan/3,t]) {
          expect(singleHoleRecoveryValue(p,x)).toBeCloseTo(B+(H-B)*(x-c)/(t-c),10);
        }
        for (const x of [t,t+p.downSpan/2,R]) {
          expect(singleHoleRecoveryValue(p,x)).toBeCloseTo(H-(H-E)*(x-t)/(R-t),10);
        }
        expect(singleHoleRecoveryValue(p,t)).toBe(H);
        expect(singleHoleRecoveryValue(p,R)).toBe(E);
        expect(() => singleHoleRecoveryValue(p,c)).toThrow();
        expect(() => singleHoleRecoveryValue(p,R+0.001)).toThrow();
        expect(() => singleHoleRecoveryValue(p,Infinity)).toThrow();

        // Exactly ONE excluded argument c has TWO distinct one-sided
        // hollow heights A (left) and B (right).
        const eps=1e-7;
        expect(singleHoleRecoveryValue(p,c-eps)).toBeCloseTo(A,5);
        expect(singleHoleRecoveryValue(p,c+eps)).toBeCloseTo(B,5);
        expect(A).not.toEqual(B);

        // The discarded-looking y-heights are both attained for x!=c.
        expect(w.xForB).toBeLessThan(c);
        expect(w.xForA).toBeGreaterThan(c);
        expect(w.xForA).toBeLessThan(t);
        expect(singleHoleRecoveryValue(p,w.xForB)).toBeCloseTo(B,10);
        expect(singleHoleRecoveryValue(p,w.xForA)).toBeCloseTo(A,10);

        // Explicit non-injectivity witness with two distinct valid inputs.
        expect(w.leftX).toBeLessThan(c);
        expect(w.rightX).toBeGreaterThan(c);
        expect(singleHoleRecoveryValue(p,w.leftX)).toBeCloseTo(w.yShared,10);
        expect(singleHoleRecoveryValue(p,w.rightX)).toBeCloseTo(w.yShared,10);

        // Unbounded negative tail, reached finite maximum, no y>H.
        expect(singleHoleRecoveryValue(p,c-1_000_000)).toBeLessThan(-100_000);
        for (const y of [B-100,B-1,(A+B)/2,A,(H+A)/2,H]) {
          if(y<A){
            const x=c+(y-A)/p.leftSlope;
            expect(x).toBeLessThan(c);
            expect(singleHoleRecoveryValue(p,x)).toBeCloseTo(y,10);
          } else {
            const x=c+(t-c)*(y-B)/(H-B);
            expect(x).toBeGreaterThan(c);
            expect(x).toBeLessThanOrEqual(t);
            expect(singleHoleRecoveryValue(p,x)).toBeCloseTo(y,10);
          }
        }
        const expected = independentlyExpected(c,t,R,H);
        expect(singleHoleRecoveryOracle(p)).toEqual(expected);

        // Independent numerical derivative/difference checks on all three
        // open pieces and two closed turning boundaries.
        for (const [x,dir] of [[c-1,1],[c+p.upSpan/2,1],[t+p.downSpan/2,-1]] as const){
          const h=0.001;
          const derivative=singleHoleRecoveryValue(p,x+h)-singleHoleRecoveryValue(p,x-h);
          expect(Math.sign(derivative)).toBe(dir);
        }

        for (const locale of ["pl","en"] as const){
          const view=presentSingleHoleRecovery(p,locale);
          const expectedLabel: Record<string,string> = {
            ...expected,
            injective:locale==="pl"?"Nie":"No",
            parity:locale==="pl"?"Ani parzysta, ani nieparzysta":"Neither",
          };
          const spec=view.answer;
          expect(spec.kind).toBe("multi-choice");
          if(spec.kind!=="multi-choice")throw Error("Expected six-choice answer");
          expect(spec.fields.map(field=>field.id)).toEqual(singleHoleRecoveryFields);
          for(const field of spec.fields){
            expect(new Set(field.options.map(o=>o.label)).size).toBe(field.options.length);
            expect(field.options.some(o=>o.value===field.value)).toBe(true);
          }
          const right=independentlySelect(spec,expectedLabel);
          expect(assessAnswer(spec,right).kind).toBe("correct");
          expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
          for(const field of spec.fields){
            const incomplete={...right.values};
            delete incomplete[field.id];
            expect(assessAnswer(spec,{kind:"multi-choice",values:incomplete}).kind).toBe("invalid");
            const wrong=field.options.find(option=>option.value!==right.values[field.id]);
            expect(wrong).toBeDefined();
            expect(assessAnswer(spec,{kind:"multi-choice",values:{
              ...right.values,[field.id]:wrong!.value,
            }}).kind).toBe("incorrect");
          }
          const steps=view.solution.filter(step=>step.kind==="working");
          expect(steps).toHaveLength(6);
          for(const [i,key] of (["domain","range","increasing","decreasing"] as const).entries()){
            expect(steps[i].action).toContain(expected[key]);
          }
          expect(view.solution.at(-1)?.kind).toBe("answer");
          expect(view.question.length).toBeGreaterThan(70);
          expect(view.hint.length).toBeGreaterThan(20);
          expect(view.nextHint.length).toBeGreaterThan(30);
          expect(view.explanation).toContain(fmt(c));
          if(locale==="en")
            expect([view.question,view.hint,view.nextHint].join(" ")).not.toMatch(/[ąćęłńóśźż]/i);
        }
      });
      const p=makeSingleHoleRecovery(variant,difficulty);
      variants.push(JSON.stringify(p));
    }
  }
  it("all 72 supported synthetic parameter profiles are distinct",()=>{
    expect(variants).toHaveLength(72);
    expect(new Set(variants).size).toBe(72);
  });
  it("rejects negative/overflow variants, unsupported level and degenerate geometry",()=>{
    for(const level of ["hard","advanced","expert"] as const){
      for(const v of [-1,24,0.5]) expect(()=>makeSingleHoleRecovery(v,level)).toThrow();
    }
    expect(()=>makeSingleHoleRecovery(0,"easy")).toThrow();
    const p=makeSingleHoleRecovery(0,"hard");
    expect(()=>singleHoleGeometry({...p,separation:0})).toThrow();
    expect(()=>singleHoleGeometry({...p,rise:0})).toThrow();
    expect(()=>singleHoleGeometry({...p,drop:99})).toThrow();
    expect(()=>singleHoleGeometry({...p,upSpan:0})).toThrow();
    expect(()=>singleHoleGeometry({...p,downSpan:-3})).toThrow();
    expect(()=>singleHoleRecoveryValue(p,Number.NaN)).toThrow();
  });
});
