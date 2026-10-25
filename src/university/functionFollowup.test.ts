
import {describe,it,expect} from "vitest";
import {functionFollowupFamilies,rationalLogDomain,mobiusInverseAt,evalMobius} from "./functionFollowup";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,equalRational as eq,type Rational} from "../rational";
import {compare} from "./realSets";
import {selectedSetContains} from "./functions-audit";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {auditCalculation} from "./audit";
import type {FunctionFollowupProblem} from "./functionFollowup";

type Dom=Extract<FunctionFollowupProblem,{kind:"function-log-rational-domain"}>;
type Mob=Extract<FunctionFollowupProblem,{kind:"function-mobius-inverse-point"}>;
function directArgument(z:Dom,x:Rational):Rational|null{
 const denominator=sub(x,z.pole);
 if(!denominator.numerator)return null;
 return div(mul(sub(x,z.p),sub(x,z.q)),denominator);
}
const midpoint=(a:Rational,b:Rational)=>div(add(a,b),r(2));
const neg=(x:Rational)=>r(-x.numerator,x.denominator);
describe("MT-EDU-020 P1B independent math and UI audits",()=>{
 it("adds exactly 144 exercises in two distinct function families",()=>{
  expect(functionFollowupFamilies.map(f=>f.id)).toEqual(["function-log-rational-domain","function-mobius-inverse-point"]);
  expect(functionFollowupFamilies.reduce((s,f)=>s+f.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const fam of functionFollowupFamilies)for(const level of fam.supportedDifficulties){
  it(fam.id+"/"+level+": all 24 variants, exact math, PL/EN",()=>{
   const keys=new Set<string>();
   for(let v=0;v<24;v++){
    const task=makeUniversityTask(fam.id,v,level),z=task.university;
    keys.add(task.contentKey);
    expect(task.category).toBe("functions");
    if(z.kind==="function-log-rational-domain"){
     expect(compare(z.p,z.q)).toBeLessThan(0);
     expect(compare(z.p,z.pole)).not.toBe(0);
     expect(compare(z.q,z.pole)).not.toBe(0);
     const critical=[z.p,z.q,z.pole].sort(compare);
     const sample=[sub(critical[0],r(1)),midpoint(critical[0],critical[1]),
       midpoint(critical[1],critical[2]),add(critical[2],r(1)),...critical];
     const D=rationalLogDomain(z);
     for(const x of sample){
      const value=directArgument(z,x);
      const valid=value!==null&&value.numerator>0n;
      const selected=task.answer;
      expect(selected.kind).toBe("choice");
      if(selected.kind!=="choice")throw Error("Expected choice answer");
      expect(selectedSetContains(selected.value,x),fam.id+"/"+level+"/"+v+" x="+f(x)).toBe(valid);
      // The semantic set generator is also compared to the independent sign oracle.
      const actualFromSet= D.some(interval=>
       (interval.lower===null||compare(x,interval.lower)>0) &&
       (interval.upper===null||compare(x,interval.upper)<0));
      expect(actualFromSet).toBe(valid);
     }
    }else if(z.kind==="function-mobius-inverse-point"){
     const det=sub(mul(z.a,z.d),mul(z.b,z.c));
     expect(det.numerator).not.toBe(0n);
     expect(z.c.numerator).not.toBe(0n);
     const inv=mobiusInverseAt(z);
     expect(eq(evalMobius(z,inv),z.image)).toBe(true);
     const pole=neg(div(z.d,z.c)), missing=div(z.a,z.c);
     expect(eq(z.image,missing)).toBe(false);
     for(const trial of [r(-9),r(-2),r(0),r(3),r(11,2)]){
      if(eq(trial,pole))continue;
      const y=div(add(mul(z.a,trial),z.b),add(mul(z.c,trial),z.d));
      expect(eq(mobiusInverseAt({...z,image:y}),trial)).toBe(true);
     }
    }else throw Error("Unexpected P1B family");
    for(const locale of ["pl","en"] as const){
     const local=localizeUniversity(task,locale),ans=local.answer;
     expect(local.question.length).toBeGreaterThan(40);
     expect(local.solution!.length).toBeGreaterThanOrEqual(5);
     expect(local.hint.length).toBeGreaterThan(12);
     expect(local.nextHint.length).toBeGreaterThan(12);
     if(locale==="en")expect(local.question).not.toMatch(/[ąćęłńóśźż]/i);
     for(const step of local.solution!)if(step.kind==="working"){
      expect(step.action.length).toBeGreaterThan(8);
      expect(step.reason.length).toBeGreaterThan(20);
      for(const calculation of step.calculations)expect(auditCalculation(calculation)).toBe(true);
     }
     expect(assessAnswer(ans,emptyAnswer(ans)).kind).toBe("invalid");
     if(z.kind==="function-log-rational-domain"){
      expect(ans.kind).toBe("choice");
      if(ans.kind!=="choice")throw Error("Expected domain choice");
      expect(ans.options.length).toBeGreaterThanOrEqual(3);
      expect(ans.options.some(x=>x.value===ans.value)).toBe(true);
      expect(assessAnswer(ans,{kind:"choice",value:ans.value}).kind).toBe("correct");
      const wrong=ans.options.find(x=>x.value!==ans.value)!;
      expect(assessAnswer(ans,{kind:"choice",value:wrong.value}).kind).toBe("incorrect");
     }else{
      expect(ans.kind).toBe("scalar");
      if(ans.kind!=="scalar")throw Error("Expected inverse scalar");
      expect(eq(ans.value,mobiusInverseAt(z))).toBe(true);
      expect(assessAnswer(ans,f(ans.value)).kind).toBe("correct");
      expect(assessAnswer(ans,f(add(ans.value,r(1)))).kind).toBe("incorrect");
      expect(assessAnswer(ans,"1/0").kind).toBe("invalid");
     }
    }
   }
   expect(keys.size).toBe(24);
  },30000);
 }
 it("rejects unsupported levels, variants and degenerate Möbius functions",()=>{
  for(const fam of functionFollowupFamilies){
   expect(()=>makeUniversityTask(fam.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,0,"easy")).toThrow();
  }
  const z=makeUniversityTask("function-mobius-inverse-point",0,"hard").university;
  if(z.kind!=="function-mobius-inverse-point")throw Error("wrong kind");
  expect(()=>mobiusInverseAt({...z,a:r(1),b:r(2),c:r(1),d:r(2)})).toThrow();
  expect(()=>mobiusInverseAt({...z,image:div(z.a,z.c)})).toThrow();
  const dom=makeUniversityTask("function-log-rational-domain",0,"hard").university;
  if(dom.kind!=="function-log-rational-domain")throw Error("wrong domain kind");
  expect(()=>rationalLogDomain({...dom,pole:dom.p})).toThrow();
 });
});
