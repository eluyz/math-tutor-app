import {describe,it,expect} from "vitest";
import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,type Rational} from "../rational";
import {formatRational as f,assessAnswer,emptyAnswer} from "../answers";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {definiteIntegralFollowupFamilies,definiteIntegralValue,definiteIntegralPrimitive,type DefiniteIntegralFollowupProblem} from "./definiteIntegralFollowup";
import {polishLearningText} from "../../e2e/helpers/localization";
import {auditCalculation} from "./audit";

const eq=(a:Rational,b:Rational)=>a.numerator*b.denominator===b.numerator*a.denominator;
const pow=(a:Rational,n:number)=>Array.from({length:n},()=>a).reduce(mul,r(1));
const num=(a:Rational)=>Number(a.numerator)/Number(a.denominator);
const polynomial=(p:DefiniteIntegralFollowupProblem,x:Rational):Rational=>{
 if(p.kind==="integral-substitution-definite"){
  const u=add(add(mul(x,x),mul(p.b,x)),p.c);
  return mul(mul(p.k,add(mul(r(2),x),p.b)),pow(u,p.n));
 }
 return mul(mul(p.k,x),pow(add(x,p.b),p.n));
};
const independentIntegral=(p:DefiniteIntegralFollowupProblem):Rational=>{
 if(p.kind==="integral-substitution-definite"){
  // Independent endpoint substitution and the fundamental theorem.
  const u=(x:Rational)=>add(add(mul(x,x),mul(p.b,x)),p.c);
  return div(mul(p.k,sub(pow(u(p.upper),p.n+1),pow(u(p.lower),p.n+1))),r(p.n+1));
 }
 // Direct expansion by y=x+b, x=y−b yields y^(n+1)−b*y^n.
 const direct=(x:Rational)=>{
  const y=add(x,p.b);
  const integral=sub(div(pow(y,p.n+2),r(p.n+2)),mul(p.b,div(pow(y,p.n+1),r(p.n+1))));
  return mul(p.k,integral);
 };
 return sub(direct(p.upper),direct(p.lower));
};
const midpoint=(p:DefiniteIntegralFollowupProblem)=>{
 const low=num(p.lower),high=num(p.upper),steps=3000;
 const dx=(high-low)/steps;
 let total=0;
 for(let i=0;i<steps;i++){
  const x=r(Math.round((low+(i+0.5)*dx)*1000000),1000000);
  total+=num(polynomial(p,x))*dx;
 }
 return total;
};

describe("MT-EDU-023 P2E-A: exact definite substitutions and parts",()=>{
 it("declares two families and 144 non-repeating variants",()=>{
  expect(definiteIntegralFollowupFamilies.map(x=>x.id)).toEqual(["integral-substitution-definite","integral-parts-definite"]);
  expect(definiteIntegralFollowupFamilies.reduce((n,x)=>n+x.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const fam of definiteIntegralFollowupFamilies)for(const level of fam.supportedDifficulties){
  it(fam.id+"/"+level+" checks all 24 exact answers, languages and feedback",()=>{
   const distinct=new Set<string>();
   for(let v=0;v<24;v++){
    const task=makeUniversityTask(fam.id,v,level),p=task.university;
    if(p.kind!=="integral-substitution-definite"&&p.kind!=="integral-parts-definite")throw Error("Wrong kind");
    distinct.add(task.contentKey);
    expect(task.category).toBe("integrals");
    expect(p.k.numerator).not.toBe(0n);
    expect(p.n).toBeGreaterThanOrEqual(1);
    expect(p.upper.numerator*p.lower.denominator).toBeGreaterThan(p.lower.numerator*p.upper.denominator);
    const exact=definiteIntegralValue(p),independent=independentIntegral(p);
    expect(eq(exact,independent)).toBe(true);
    expect(Math.abs(num(exact)-midpoint(p))).toBeLessThan(Math.max(0.02,Math.abs(num(exact))*0.0002));
    for(const x of [p.lower,p.upper,r(1),r(-2)]){
     const h=r(1,1000),numerator=sub(definiteIntegralPrimitive(p,add(x,h)),definiteIntegralPrimitive(p,sub(x,h)));
     const symmetric=div(numerator,mul(r(2),h));
     const actual=polynomial(p,x);
     expect(Math.abs(num(sub(symmetric,actual)))).toBeLessThan(Math.max(0.5,Math.abs(num(actual))*0.002));
    }
    for(const locale of ["pl","en"] as const){
     const t=localizeUniversity(task,locale),spec=t.answer;
     expect(t.question.length).toBeGreaterThan(55);
     expect(t.solution?.length).toBeGreaterThanOrEqual(5);
     expect(t.nextHint.length).toBeGreaterThan(20);
     if(locale==="en")for(const text of [t.title,t.question,t.hint,t.nextHint,t.explanation,...t.solution!.map(z=>z.action+" "+z.reason)])
       expect(text).not.toMatch(polishLearningText);
     for(const step of t.solution!)if(step.kind==="working"){
      expect(step.reason.length).toBeGreaterThan(25);
      for(const calc of step.calculations)expect(auditCalculation(calc)).toBe(true);
     }
     expect(spec.kind).toBe("scalar");
     if(spec.kind!=="scalar")throw Error("Expected scalar answer");
     expect(eq(spec.value,independent)).toBe(true);
     expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
     expect(assessAnswer(spec,f(exact)).kind).toBe("correct");
     expect(assessAnswer(spec,f(add(exact,r(1)))).kind).toBe("incorrect");
     expect(assessAnswer(spec,"1/0").kind).toBe("invalid");
    }
   }
   expect(distinct.size).toBe(24);
  },35000);
 }
 it("rejects invalid variants, zero coefficient, reversed bounds, bad powers",()=>{
  for(const fam of definiteIntegralFollowupFamilies){
   expect(()=>makeUniversityTask(fam.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,0,"medium")).toThrow();
  }
  const p=makeUniversityTask("integral-substitution-definite",0,"hard").university;
  const q=makeUniversityTask("integral-parts-definite",0,"hard").university;
  if(p.kind!=="integral-substitution-definite"||q.kind!=="integral-parts-definite")throw Error("Invalid family");
  expect(()=>definiteIntegralValue({...p,k:r(0)})).toThrow();
  expect(()=>definiteIntegralValue({...p,lower:p.upper,upper:p.lower})).toThrow();
  expect(()=>definiteIntegralValue({...q,n:-1})).toThrow();
 });
});
