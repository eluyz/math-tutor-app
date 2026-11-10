import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import {
  makeAsymptoticJump, asymptoticJumpValue, asymptoticJumpOracle,
  asymptoticJumpFields, presentAsymptoticJump, checkAsymptoticJump,
} from "./graphAsymptoticJump";

const fmt=(n:number)=>String(n).replace(/-/g,"−");
const iv=(a:string,b:string,ca=false,cb=false)=>
  (ca?"[":"(")+a+"; "+b+(cb?"]":")");

describe("F05/f injective two-curved-tail synthetic asymptote profiles",()=>{
  const shapes=new Set<string>();
  for(const level of ["hard","advanced","expert"] as const)
    for(let variant=0;variant<24;variant++)
      it(level+"/"+variant+" exact rational shape and six graded PL/EN responses",()=>{
        const p=makeAsymptoticJump(variant,level);
        const {A,k,B,h}=checkAsymptoticJump(p);
        shapes.add(JSON.stringify(p));
        expect(k).toBeGreaterThan(0);
        expect(h).toBeGreaterThan(0);
        expect(B).toBeGreaterThan(A);
        // Independent algebraic oracle derived from derivative signs and images,
        // not from the production oracle's string formatter.
        const expected={
          domain:"ℝ",
          range:iv(fmt(A-k),fmt(A))+" ∪ "+iv(fmt(B),fmt(B+h),true),
          increasing:iv("0","+∞",true),
          decreasing:iv("−∞","0"),
          injective:"yes",
          parity:"neither",
        };
        expect(asymptoticJumpOracle(p)).toEqual(expected);
        for(const x of [-1,-0.75,-0.2,-3,-10,-100,-1000])
          expect(asymptoticJumpValue(p,x)).toBeCloseTo(A-k/(1-x),12);
        for(const x of [0,0.5,1,3,10,100,1000])
          expect(asymptoticJumpValue(p,x)).toBeCloseTo(B+h*x/(1+x),12);
        expect(asymptoticJumpValue(p,0)).toBe(B);
        expect(asymptoticJumpValue(p,-1e-7)).toBeCloseTo(A-k,5);
        expect(asymptoticJumpValue(p,-1e6)).toBeCloseTo(A,4);
        expect(asymptoticJumpValue(p,1e6)).toBeCloseTo(B+h,4);
        for(const x of [-20,-8,-2,-0.5]){
          const y=asymptoticJumpValue(p,x);
          expect(y).toBeGreaterThan(A-k);
          expect(y).toBeLessThan(A);
          expect(y).toBeLessThan(B);
          expect(asymptoticJumpValue(p,x-0.001)).toBeGreaterThan(y);
          expect(asymptoticJumpValue(p,x+0.001)).toBeLessThan(y);
        }
        for(const x of [0,0.5,2,8,20]){
          const y=asymptoticJumpValue(p,x);
          expect(y).toBeGreaterThanOrEqual(B);
          expect(y).toBeLessThan(B+h);
          expect(asymptoticJumpValue(p,x+0.001)).toBeGreaterThan(y);
        }
        expect(()=>asymptoticJumpValue(p,NaN)).toThrow();
        expect(()=>asymptoticJumpValue(p,Infinity)).toThrow();
        for(const locale of ["pl","en"] as const){
          const lesson=presentAsymptoticJump(p,locale),spec=lesson.answer;
          expect(spec.kind).toBe("multi-choice");
          if(spec.kind!=="multi-choice")throw Error("Expected six fields");
          expect(spec.fields.map(f=>f.id)).toEqual(asymptoticJumpFields);
          const correctMap={...expected,
            injective:locale==="pl"?"Tak":"Yes",
            parity:locale==="pl"?"Ani parzysta, ani nieparzysta":"Neither",
          };
          const correct={kind:"multi-choice" as const,
            values:Object.fromEntries(spec.fields.map(field=>{
              expect(new Set(field.options.map(o=>o.label)).size).toBe(field.options.length);
              const match=field.options.filter(o=>o.label===correctMap[field.id as keyof typeof correctMap]);
              expect(match).toHaveLength(1);
              expect(field.options.some(o=>o.value===field.value)).toBe(true);
              return [field.id,match[0].value];
            }))};
          expect(assessAnswer(spec,correct).kind).toBe("correct");
          expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
          for(const field of spec.fields){
            const missing={...correct.values};delete missing[field.id];
            expect(assessAnswer(spec,{kind:"multi-choice",values:missing}).kind).toBe("invalid");
            const wrong=field.options.find(o=>o.value!==correct.values[field.id]);
            expect(wrong).toBeDefined();
            expect(assessAnswer(spec,{kind:"multi-choice",values:{
              ...correct.values,[field.id]:wrong!.value,
            }}).kind).toBe("incorrect");
          }
          const steps=lesson.solution.filter(s=>s.kind==="working");
          expect(steps).toHaveLength(6);
          for(const [i,k] of (["domain","range","increasing","decreasing"] as const).entries())
            expect(steps[i].action).toContain(expected[k]);
          expect(lesson.hint.length).toBeGreaterThan(30);
          expect(lesson.nextHint.length).toBeGreaterThan(35);
          expect(lesson.question.length).toBeGreaterThan(60);
          if(locale==="en"){
            const text=[lesson.question,lesson.hint,lesson.nextHint,
              ...steps.map(s=>s.action+" "+s.reason)].join(" ");
            expect(text).not.toMatch(/[ąćęłńóśźż]/i);
          }
        }
      });
  it("72 distinct immutable parameter tuples and invalid profiles",()=>{
    expect(shapes.size).toBe(72);
    for(const level of ["hard","advanced","expert"] as const)
      for(const v of [-1,24,1.4,NaN,Infinity])
        expect(()=>makeAsymptoticJump(v,level)).toThrow();
    expect(()=>makeAsymptoticJump(0,"easy")).toThrow();
    const p=makeAsymptoticJump(0,"hard");
    for(const z of [
      {...p,k:0},{...p,h:-1},{...p,B:p.A},{...p,A:NaN},
    ]) expect(()=>checkAsymptoticJump(z)).toThrow();
  });
});
