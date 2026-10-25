import {describe,it,expect} from "vitest";
import {limitFollowupFamilies,radicalInfinityLimit,heineClassification,type LimitFollowupProblem} from "./limitFollowup";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,equalRational as eq,type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {auditCalculation} from "./audit";
import {polishLearningText} from "../../e2e/helpers/localization";

type Radical=Extract<LimitFollowupProblem,{kind:"limit-radical-infinity"}>;
type Piecewise=Extract<LimitFollowupProblem,{kind:"limit-piecewise-heine"}>;
const neg=(z:Rational)=>r(-z.numerator,z.denominator);
const signed=(z:Rational)=>z.numerator>0n?1:-1;
const val=(x:Rational)=>Number(x.numerator)/Number(x.denominator);
const expectedRadical=(p:Radical)=>{
 const dir=p.direction==="positive"?1:-1;
 const coef=add(p.c,dir===1?p.a:neg(p.a));
 return coef.numerator===0n?{kind:"finite" as const,value:p.d}:
   {kind:(signed(coef)*dir>0?"positive-infinity":"negative-infinity") as "positive-infinity"|"negative-infinity"};
};
const refHeine=(p:Piecewise)=>{
 const sameLimits=eq(p.left,p.right);
 return !sameLimits?"jump":eq(p.left,p.valueAt)?"continuous":"removable";
};
describe("MT-EDU-020 P1C: limit and continuity mathematical verification",()=>{
 it("registers precisely two new families and 144 exercise variants",()=>{
  expect(limitFollowupFamilies.map(t=>t.id)).toEqual(["limit-radical-infinity","limit-piecewise-heine"]);
  expect(limitFollowupFamilies.reduce((sum,x)=>sum+x.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const fam of limitFollowupFamilies)for(const level of fam.supportedDifficulties){
  it(fam.id+"/"+level+": independent math and 24 bilingual instances",()=>{
   const content=new Set<string>(),classes=new Set<string>();
   for(let i=0;i<24;i++){
    const task=makeUniversityTask(fam.id,i,level),p=task.university;
    content.add(task.contentKey);
    expect(task.category).toBe("function-limits");
    if(p.kind==="limit-radical-infinity"){
     expect(p.a.numerator>0n&&p.b.numerator>0n).toBe(true);
     const ref=expectedRadical(p),actual=radicalInfinityLimit(p);
     expect(actual.kind).toBe(ref.kind);
     if(ref.kind==="finite"&&actual.kind==="finite")expect(eq(ref.value,actual.value)).toBe(true);
     classes.add(ref.kind);
     // Independent numerical conjugate identity and vanishing remainder.
     for(const x of [5000,-5000]){
      const root=Math.sqrt(val(p.a)**2*x*x+val(p.b)),linear=val(p.a)*Math.abs(x);
      const residual=val(p.b)/(root+linear);
      expect(Math.abs((root-linear)-residual)).toBeLessThan(0.00001);
      expect(Math.abs(residual)).toBeLessThan(0.01);
     }
    }else if(p.kind==="limit-piecewise-heine"){
     const kind=refHeine(p);classes.add(kind);
     expect(heineClassification(p)).toBe(kind);
     for(const n of [1,2,10,100]){
      const offset=div(r(1),r(n));
      const leftX=sub(p.at,offset),rightX=add(p.at,offset);
      const leftF=add(p.left,mul(p.leftSlope,sub(leftX,p.at)));
      const rightF=add(p.right,mul(p.rightSlope,sub(rightX,p.at)));
      expect(eq(sub(leftF,p.left),mul(neg(p.leftSlope),offset))).toBe(true);
      expect(eq(sub(rightF,p.right),mul(p.rightSlope,offset))).toBe(true);
     }
    }else throw Error("Unknown family");
    for(const locale of ["pl","en"] as const){
     const result=localizeUniversity(task,locale),spec=result.answer;
     expect(result.question.length).toBeGreaterThan(40);
     expect(result.solution!.length).toBeGreaterThanOrEqual(5);
     expect(result.hint.length).toBeGreaterThan(10);
     expect(result.nextHint.length).toBeGreaterThan(10);
     if(locale==="en")for(const text of [result.question,result.hint,result.nextHint,result.explanation,...result.solution!.map(x=>x.kind==="working"?x.action+" "+x.reason:"")])expect(text).not.toMatch(polishLearningText);
     for(const step of result.solution!)if(step.kind==="working"){
      expect(step.action.length).toBeGreaterThan(4);
      expect(step.reason.length).toBeGreaterThan(18);
      for(const c of step.calculations)expect(auditCalculation(c)).toBe(true);
     }
     expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
     if(p.kind==="limit-radical-infinity"){
      const reference=expectedRadical(p);
      expect(spec.kind).toBe("limit");
      if(spec.kind!=="limit")throw Error("Expected limit kind");
      expect(spec.value.kind).toBe(reference.kind);
      expect(assessAnswer(spec,{kind:"limit",classification:reference.kind,value:reference.kind==="finite"?f(reference.value):""}).kind).toBe("correct");
      expect(assessAnswer(spec,{kind:"limit",classification:reference.kind==="finite"?"positive-infinity":"finite",value:"0"}).kind).toBe("incorrect");
     }else{
      const expected=refHeine(p);
      expect(spec.kind).toBe("choice");
      if(spec.kind!=="choice")throw Error("Expected choice kind");
      expect(spec.value).toBe(expected);
      expect(spec.options.map(o=>o.value)).toEqual(["continuous","removable","jump"]);
      expect(assessAnswer(spec,{kind:"choice",value:expected}).kind).toBe("correct");
      expect(assessAnswer(spec,{kind:"choice",value:spec.options.find(x=>x.value!==expected)!.value}).kind).toBe("incorrect");
      expect(assessAnswer(spec,{kind:"choice",value:"unknown"}).kind).toBe("invalid");
     }
    }
   }
   expect(content.size).toBe(24);
   if(fam.id==="limit-piecewise-heine")expect(classes).toEqual(new Set(["continuous","removable","jump"]));
   else expect(classes).toEqual(new Set(["finite","positive-infinity","negative-infinity"]));
  },30000);
 }
 it("rejects unsupported levels and degenerate parameters",()=>{
  for(const fam of limitFollowupFamilies){
   expect(()=>makeUniversityTask(fam.id,24,fam.supportedDifficulties[0])).toThrow();
   expect(()=>makeUniversityTask(fam.id,-1,fam.supportedDifficulties[0])).toThrow();
   expect(()=>makeUniversityTask(fam.id,0,"easy")).toThrow();
  }
  const r0=makeUniversityTask("limit-radical-infinity",0,"hard").university;
  if(r0.kind!=="limit-radical-infinity")throw Error("wrong kind");
  expect(()=>radicalInfinityLimit({...r0,a:r(0)})).toThrow();
  expect(()=>radicalInfinityLimit({...r0,b:r(0)})).toThrow();
  const h0=makeUniversityTask("limit-piecewise-heine",0,"hard").university;
  if(h0.kind!=="limit-piecewise-heine")throw Error("wrong kind");
  expect(()=>heineClassification({...h0,leftSlope:r(0)})).toThrow();
 });
});
