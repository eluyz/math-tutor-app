import {describe,it,expect} from "vitest";
import {rational as r,addRational as add,multiplyRational as mul,type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";
import {
  smoothRationalStudyStage,makeSmoothRationalStudy,smoothRationalValue,
  smoothRationalCritical,smoothRationalIntervalExtrema,presentSmoothRationalStudy
} from "./functionStudySmoothRational";

const number=(v:Rational)=>Number(v.numerator)/Number(v.denominator);
const eq=(a:Rational,b:Rational)=>a.numerator*b.denominator===b.numerator*a.denominator;
const value=(k:number,m:number,q:number,t:number)=>k+m*q*q/(t*t+q*q);
const slope=(m:number,q:number,t:number)=>-2*m*q*q*t/(t*t+q*q)**2;
const second=(m:number,q:number,t:number)=>2*m*q*q*(3*t*t-q*q)/(t*t+q*q)**3;
const sign=(x:number)=>x>0?1:x<0?-1:0;

describe("D08 staged smooth rational study; not yet in the production catalog",()=>{
  it("defines one controlled family and rejects invalid inputs",()=>{
    expect(smoothRationalStudyStage.id).toBe("analysis-study-smooth-rational");
    expect(smoothRationalStudyStage.category).toBe("derivatives");
    expect(smoothRationalStudyStage.supportedDifficulties).toEqual(["hard","advanced","expert"]);
    expect(smoothRationalStudyStage.variantCountPerLevel).toBe(24);
    for(const v of [-1,24,1.5,NaN,Infinity])
      expect(()=>makeSmoothRationalStudy(v,"hard")).toThrow();
    expect(()=>makeSmoothRationalStudy(0,"easy")).toThrow();
    const p=makeSmoothRationalStudy(0,"hard");
    expect(()=>smoothRationalValue({...p,q:r(0)},r(0))).toThrow();
    expect(()=>smoothRationalCritical({...p,m:r(0)})).toThrow();
    expect(()=>smoothRationalIntervalExtrema({...p,q:r(-1)})).toThrow();
  });
  for(const level of ["hard","advanced","expert"] as const)
    it(level+": exact values, derivatives, sign tests, PL/EN and grading for 24 variants",()=>{
      const keys=new Set<string>();
      let pos=0,neg=0,zeroShift=0;
      for(let v=0;v<24;v++){
        const p=makeSmoothRationalStudy(v,level);
        const a=number(p.a),m=number(p.m),q=number(p.q),k=number(p.k);
        keys.add([a,m,q,k,p.target].join(";"));
        expect(q).toBeGreaterThan(0);
        expect(m).not.toBe(0);
        if(m>0)pos++;else neg++;
        if(k===0)zeroShift++;
        expect(eq(smoothRationalValue(p,r(0)),add(p.k,p.m))).toBe(true);
        for(const multiple of [-3,-2,-1,0,1,2,3]){
          const t=mul(r(multiple),p.q);
          expect(number(smoothRationalValue(p,t))).toBeCloseTo(value(k,m,q,multiple*q),12);
        }
        const [cx,cy]=smoothRationalCritical(p);
        expect(eq(cx,p.a)).toBe(true);
        expect(eq(cy,add(p.k,p.m))).toBe(true);
        for(const t of [-2*q,-q/2,q/2,2*q]){
          expect(sign(slope(m,q,t))).toBe(sign(-m*t));
          expect(sign(second(m,q,t))).toBe(sign(m*(3*t*t-q*q)));
          const h=Math.max(1e-5,q*1e-4);
          const approx=(value(k,m,q,t+h)-value(k,m,q,t-h))/(2*h);
          expect(Math.abs(approx-slope(m,q,t))).toBeLessThan(0.00005);
        }
        for(const t of [-q/Math.sqrt(3),q/Math.sqrt(3)]){
          expect(Math.abs(second(m,q,t))).toBeLessThan(1e-9);
          expect(value(k,m,q,t)).toBeCloseTo(k+3*m/4,11);
        }
        for(const t of [-2*q,0,2*q])expect(t*t+q*q).toBeGreaterThan(0);
        const [max,min]=smoothRationalIntervalExtrema(p);
        const candidates=[-2*q,0,2*q].map(t=>value(k,m,q,t));
        expect(number(max)).toBeCloseTo(Math.max(...candidates),12);
        expect(number(min)).toBeCloseTo(Math.min(...candidates),12);
        for(const locale of ["pl","en"] as const){
          const view=presentSmoothRationalStudy(p,locale),spec=view.answer;
          expect(view.question).toContain("f(x)=");
          expect(view.question).toContain("f′");
          expect(view.question).toContain("f″");
          expect(view.solution.length).toBeGreaterThanOrEqual(11);
          expect(view.explanation).toContain("/√3");
          if(locale==="en")for(const line of [view.question,view.hint,view.nextHint,
            ...view.solution.filter(s=>s.kind==="working").map(s=>s.action+" "+s.reason)])
              expect(line).not.toMatch(polishLearningText);
          expect(spec.kind).toBe("list");
          if(spec.kind!=="list")throw Error("Unexpected answer spec");
          const expected=p.target==="critical"?[p.a,add(p.k,p.m)]:[max,min];
          expect(spec.values.length).toBe(expected.length);
          expect(spec.values.every((x,i)=>eq(x,expected[i]))).toBe(true);
          expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
          expect(assessAnswer(spec,{kind:"list",values:expected.map(f)}).kind).toBe("correct");
          expect(assessAnswer(spec,{kind:"list",values:expected.map((x,i)=>f(i===0?add(x,r(1)):x))}).kind).toBe("incorrect");
          expect(assessAnswer(spec,{kind:"list",values:expected.map((x,i)=>i===0?"1/0":f(x))}).kind).toBe("invalid");
        }
      }
      expect(keys.size).toBe(24);
      expect(pos).toBeGreaterThan(0);
      expect(neg).toBeGreaterThan(0);
      expect(zeroShift).toBeGreaterThan(0);
    },30000);
  it("distinguishes one double zero from no real zeros",()=>{
    const p=makeSmoothRationalStudy(0,"hard");
    const oneZero={...p,k:mul(r(-1),p.m)};
    expect(eq(smoothRationalValue(oneZero,r(0)),r(0))).toBe(true);
    const noZero={...p,k:p.m};
    expect(smoothRationalValue(noZero,r(0)).numerator).not.toBe(0n);
    expect(presentSmoothRationalStudy(oneZero,"en").explanation).toContain("t²=");
  });
});
