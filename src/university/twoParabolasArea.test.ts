import {describe,it,expect} from "vitest";
import {rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, equalRational as eq, type Rational} from "../rational";
import {formatRational as fmt, assessAnswer, emptyAnswer} from "../answers";
import {makeUniversityTask, localizeUniversity} from "./catalog";
import {twoParabolasAreaFamilies, parabolaValues, exactTwoParabolasArea, type TwoParabolasAreaProblem} from "./twoParabolasArea";
import {polishLearningText} from "../../e2e/helpers/localization";
const number=(v:Rational)=>Number(v.numerator)/Number(v.denominator);
const compare=(a:Rational,b:Rational)=>a.numerator*b.denominator<b.numerator*a.denominator?-1:a.numerator*b.denominator>b.numerator*a.denominator?1:0;
describe("MT-EDU-023 P2E-B1: genuine quadratic pairs and exact unsigned areas",()=>{
 it("advertises one family of 72 exercises",()=>{
  expect(twoParabolasAreaFamilies.map(f=>f.id)).toEqual(["integral-area-parabolas"]);
  expect(twoParabolasAreaFamilies[0].supportedDifficulties).toEqual(["hard","advanced","expert"]);
 });
 for(const level of twoParabolasAreaFamilies[0].supportedDifficulties){
  it("checks all 24 variants, crossings, PL/EN and answers for "+level,()=>{
   const seen=new Set<string>(),crossingCounts=new Set<number>();
   for(let i=0;i<24;i++){
    const task=makeUniversityTask("integral-area-parabolas",i,level),p=task.university as TwoParabolasAreaProblem;
    expect(p.kind).toBe("integral-area-parabolas");
    expect(p.a.numerator).not.toBe(0n);
    expect(sub(p.a,p.delta).numerator).not.toBe(0n);
    expect(p.shift.numerator).not.toBe(0n);
    expect(compare(p.lower,p.upper)).toBe(-1);
    const cuts=[sub(p.center,p.radius),add(p.center,p.radius)].filter(x=>compare(p.lower,x)<0&&compare(x,p.upper)<0);
    crossingCounts.add(cuts.length);
    for(const x of [p.lower,p.upper,p.center,add(p.center,p.radius),r(0)]){
     const {f,g}=parabolaValues(p,x);
     const t=sub(x,p.center);
     expect(eq(sub(f,g),mul(p.delta,sub(mul(t,t),mul(p.radius,p.radius))))).toBe(true);
    }
    const exact=exactTwoParabolasArea(p);
    expect(compare(r(0),exact)).toBe(-1);
    const left=number(p.lower),right=number(p.upper),center=number(p.center);
    const radius=number(p.radius),delta=number(p.delta),N=8000,dx=(right-left)/N;
    let numerical=0;
    for(let j=0;j<N;j++){const x=left+(j+0.5)*dx;numerical+=Math.abs(delta*((x-center)**2-radius*radius))*dx;}
    expect(Math.abs(numerical-number(exact))).toBeLessThan(Math.max(0.002,0.00002*number(exact)));
    for(const locale of ["pl","en"] as const){
     const shown=localizeUniversity(task,locale),answer=shown.answer;
     expect(shown.solution?.length).toBeGreaterThanOrEqual(6);
     expect(shown.question).toContain(locale==="pl"?"Oblicz":"Find");
     if(locale==="en"){
      expect(shown.question).not.toMatch(polishLearningText);
      expect(shown.explanation).not.toMatch(polishLearningText);
     }
     expect(answer.kind).toBe("scalar");
     if(answer.kind!=="scalar")throw Error("Expected rational area");
     expect(eq(answer.value,exact)).toBe(true);
     expect(assessAnswer(answer,fmt(exact)).kind).toBe("correct");
     expect(assessAnswer(answer,fmt(add(exact,r(1)))).kind).toBe("incorrect");
     expect(assessAnswer(answer,emptyAnswer(answer)).kind).toBe("invalid");
     expect(assessAnswer(answer,"1/0").kind).toBe("invalid");
    }
    seen.add(task.contentKey);
   }
   expect(seen.size).toBe(24);
   expect([...crossingCounts].sort()).toEqual([0,1,2]);
  },35000);
 }
 it("rejects invalid variants and impossible geometry",()=>{
  expect(()=>makeUniversityTask("integral-area-parabolas",24,"hard")).toThrow();
  expect(()=>makeUniversityTask("integral-area-parabolas",-1,"hard")).toThrow();
  expect(()=>makeUniversityTask("integral-area-parabolas",0,"easy")).toThrow();
  const p=makeUniversityTask("integral-area-parabolas",0,"hard").university as TwoParabolasAreaProblem;
  expect(()=>exactTwoParabolasArea({...p,delta:r(0)})).toThrow();
  expect(()=>exactTwoParabolasArea({...p,radius:r(0)})).toThrow();
  expect(()=>exactTwoParabolasArea({...p,lower:p.upper,upper:p.lower})).toThrow();
 });
});
