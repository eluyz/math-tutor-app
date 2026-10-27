import {describe,it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {polarContinuityFamilies,polarLimitValue,polarDiagonalPathValue,angularAxisValues,angularContinuityClass,type PolarContinuityProblem} from "./polarContinuity";
import {q,a,s,m,d,eq} from "./audit";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import type {Rational} from "../rational";
import {polishLearningText} from "../../e2e/helpers/localization";

const sq=(x:Rational)=>m(x,x);
const power2=(p:Extract<PolarContinuityProblem,{kind:"multivar-polar-homogeneous-limit"}>,u:Rational,v:Rational)=>{
 const denominator=a(sq(u),sq(v));
 if(denominator.numerator===0n)throw Error("Punctured domain only");
 const fraction=d(m(sq(u),sq(v)),p.power===1?denominator:sq(denominator));
 return a(p.base,m(p.factor,fraction));
};
const angularAt=(p:Extract<PolarContinuityProblem,{kind:"multivar-angular-continuity"}>,u:Rational,v:Rational)=>{
 const denominator=a(sq(u),sq(v));
 if(denominator.numerator===0n)throw Error("Punctured domain only");
 return a(p.base,d(a(m(p.a,sq(u)),m(p.c,sq(v))),denominator));
};
const abs=(x:Rational)=>q(x.numerator<0n?-x.numerator:x.numerator,x.denominator);
const le=(x:Rational,y:Rational)=>x.numerator*y.denominator<=y.numerator*x.denominator;
describe("MT-EDU-025 P2G-C W03 exact polar and angular limits",()=>{
 it("registers precisely 2 families × 3 levels × 24 = 144 instances",()=>{
  expect(polarContinuityFamilies.map(x=>x.id)).toEqual(["multivar-polar-homogeneous-limit","multivar-angular-continuity"]);
  expect(polarContinuityFamilies.reduce((count,family)=>count+family.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const family of polarContinuityFamilies)for(const level of family.supportedDifficulties)
 it(family.id+"/"+level+" independently checks 24 different variants in PL/EN",()=>{
  const distinct=new Set<string>(),types=new Set<string>(),polarSigns=new Set<string>();
  for(let v=0;v<24;v++){
   const task=makeUniversityTask(family.id,v,level),p=task.university;
   distinct.add(task.contentKey);
   expect(task.category).toBe("function-limits");
   if(p.kind==="multivar-polar-homogeneous-limit"){
    expect(p.factor.numerator).not.toBe(0n);
    polarSigns.add(p.power+":"+(p.factor.numerator>0n?"positive":"negative"));
    const actual=polarLimitValue(p);
    types.add(actual.kind);
    if(p.power===1){
     expect(actual.kind).toBe("finite");
     if(actual.kind==="finite")expect(eq(actual.value,p.base)).toBe(true);
     for(const [u,vv] of [[q(2,3),q(1,5)],[q(-1,20),q(3,17)],[q(1,101),q(-2,301)]]){
      const radiusSquared=a(sq(u),sq(vv)),difference=abs(s(power2(p,u,vv),p.base));
      expect(le(difference,d(m(abs(p.factor),radiusSquared),q(4)))).toBe(true);
      expect(le(difference,d(m(abs(p.factor),radiusSquared),q(1)))).toBe(true);
     }
    }else{
     expect(actual.kind).toBe("does-not-exist");
     const second=polarDiagonalPathValue(p);
     expect(eq(second,p.base)).toBe(false);
     for(const u of [q(1),q(-1,3),q(2,17),q(-5,31)]){
      expect(eq(power2(p,u,q(0)),p.base)).toBe(true);
      expect(eq(power2(p,u,u),second)).toBe(true);
     }
    }
   }else if(p.kind==="multivar-angular-continuity"){
    const [first,second]=angularAxisValues(p);
    const result=angularContinuityClass(p);
    types.add(result);
    expect(result).toBe(p.mode);
    expect(eq(first,a(p.base,p.a))).toBe(true);
    expect(eq(second,a(p.base,p.c))).toBe(true);
    for(const t of [q(1),q(-1,5),q(2,101)]){
     expect(eq(angularAt(p,t,q(0)),first)).toBe(true);
     expect(eq(angularAt(p,q(0),t),second)).toBe(true);
    }
    if(result==="nonremovable")expect(eq(first,second)).toBe(false);
    else{
     expect(eq(first,second)).toBe(true);
     for(const [u,vv] of [[q(1),q(2)],[q(-3,5),q(2,7)]])expect(eq(angularAt(p,u,vv),first)).toBe(true);
     expect(eq(first,p.valueAt)).toBe(result==="continuous");
    }
   }else throw Error("Unexpected kind");
   for(const locale of ["pl","en"] as const){
    const view=localizeUniversity(task,locale),spec=view.answer;
    expect(view.contentKey).toBe(task.contentKey);
    expect(view.question.length).toBeGreaterThan(75);
    expect(view.solution?.length).toBeGreaterThanOrEqual(6);
    expect(view.hint.length).toBeGreaterThan(20);
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    if(locale==="en")for(const copy of [view.title,view.question,view.hint,view.nextHint,view.explanation,...view.solution!.map(z=>z.action+" "+z.reason)])
     expect(copy).not.toMatch(polishLearningText);
    if(p.kind==="multivar-polar-homogeneous-limit"){
     expect(spec.kind).toBe("limit");
     if(spec.kind!=="limit")throw Error("Expected limit");
     const answer=polarLimitValue(p);
     expect(spec.value.kind).toBe(answer.kind);
     if(answer.kind==="finite"&&spec.value.kind==="finite")expect(eq(answer.value,spec.value.value)).toBe(true);
     expect(assessAnswer(spec,{kind:"limit",classification:answer.kind,value:answer.kind==="finite"?f(answer.value):""}).kind).toBe("correct");
     expect(assessAnswer(spec,{kind:"limit",classification:answer.kind==="finite"?"does-not-exist":"finite",value:"999"}).kind).toBe("incorrect");
     expect(assessAnswer(spec,{kind:"limit",classification:"finite",value:"1/0"}).kind).toBe("invalid");
    }else{
     expect(spec.kind).toBe("choice");
     if(spec.kind!=="choice")throw Error("Expected choice");
     expect(spec.value).toBe(p.mode);
     expect(spec.options).toHaveLength(3);
     expect(assessAnswer(spec,{kind:"choice",value:p.mode}).kind).toBe("correct");
     expect(assessAnswer(spec,{kind:"choice",value:spec.options.find(o=>o.value!==p.mode)!.value}).kind).toBe("incorrect");
     expect(assessAnswer(spec,{kind:"choice",value:"bad-choice"}).kind).toBe("invalid");
    }
   }
  }
  expect(distinct.size).toBe(24);
  expect(types.size).toBe(family.id==="multivar-polar-homogeneous-limit"?2:3);
  if(family.id==="multivar-polar-homogeneous-limit")expect(polarSigns.size).toBe(4);
 },45000);
 it("rejects invalid indices, unsupported difficulties, and invalid analytical assumptions",()=>{
  for(const family of polarContinuityFamilies){
   expect(()=>makeUniversityTask(family.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(family.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(family.id,0,"easy")).toThrow();
  }
  const polar=makeUniversityTask("multivar-polar-homogeneous-limit",0,"hard").university;
  if(polar.kind!=="multivar-polar-homogeneous-limit")throw Error("Wrong polar kind");
  expect(()=>polarLimitValue({...polar,factor:q(0)})).toThrow();
  expect(()=>polarLimitValue({...polar,power:3 as 1})).toThrow();
  const ang=makeUniversityTask("multivar-angular-continuity",2,"hard").university;
  if(ang.kind!=="multivar-angular-continuity")throw Error("Wrong angular kind");
  expect(()=>angularContinuityClass({...ang,c:ang.a})).toThrow();
  const equal=makeUniversityTask("multivar-angular-continuity",0,"hard").university;
  if(equal.kind!=="multivar-angular-continuity")throw Error("Wrong angular kind");
  expect(()=>angularContinuityClass({...equal,c:a(equal.a,q(1))})).toThrow();
 });
});
