import {describe,it,expect} from "vitest";
import {rational as r,addRational as add,multiplyRational as mul,subtractRational as sub,equalRational as eq} from "../rational";
import {formatRational as f,assessAnswer,emptyAnswer} from "../answers";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {hessianFamilies,stationaryCoordinates,determinantHessian,hessianClassification,type HessianProblem} from "./hessian";
describe("MT-EDU-018 P2 Hessian and stationary points",()=>{
 it.each(hessianFamilies)("$id: 72 exact exercises and degenerate Hessians",family=>{
  const keys=new Set<string>(),modes=new Set<string>();
  for(const level of family.supportedDifficulties)for(let v=0;v<24;v++){
   const task=makeUniversityTask(family.id,v,level),p=task.university as HessianProblem;
   const D=sub(mul(mul(r(2),p.a),mul(r(2),p.c)),mul(p.b,p.b));
   expect(eq(D,determinantHessian(p))).toBe(true);
   keys.add(task.contentKey);
   if(level==="easy"){
     // Beginner exercises must not require ±11 coordinates or coefficients around ±70.
     for(const coordinate of [p.h,p.k]){
       expect(coordinate.denominator).toBe(1n);
       expect(coordinate.numerator>=-2n && coordinate.numerator<=2n).toBe(true);
     }
     // The shown stationary polynomial's linear terms remain bounded.
     if(p.kind==="multivar-stationary-point"){
       for(const coefficient of [p.d,p.e])expect(
         coefficient.numerator<=15n && coefficient.numerator>=-15n
       ).toBe(true);
     }
   }
   if(p.kind==="multivar-stationary-point"){
     const [x,y]=stationaryCoordinates(p);
     expect(D.numerator).not.toBe(0n);
     expect(eq(x,p.h)).toBe(true);expect(eq(y,p.k)).toBe(true);
     expect(eq(add(add(mul(mul(r(2),p.a),x),mul(p.b,y)),p.d),r(0))).toBe(true);
     expect(eq(add(add(mul(p.b,x),mul(mul(r(2),p.c),y)),p.e),r(0))).toBe(true);
     expect(task.answer.kind).toBe("list");
     if(task.answer.kind!=="list")throw Error("Expected pair");
     expect(assessAnswer(task.answer,{kind:"list",values:[f(x),f(y)]}).kind).toBe("correct");
   }else{
     const independent=D.numerator<0n?"saddle":D.numerator===0n?"inconclusive":p.a.numerator>0n?"minimum":"maximum";
     const result=hessianClassification(p);
     modes.add(result);
     expect(result).toBe(independent);
     expect(task.answer.kind).toBe("choice");
     if(task.answer.kind!=="choice")throw Error("Expected choice");
     expect(task.answer.value).toBe(result);
     expect(task.answer.options).toHaveLength(4);
     expect(new Set(task.answer.options.map(o=>o.label)).size).toBe(4);
     expect(assessAnswer(task.answer,{kind:"choice",value:result}).kind).toBe("correct");
     expect(assessAnswer(task.answer,{kind:"choice",value:task.answer.options.find(o=>o.value!==result)!.value}).kind).toBe("incorrect");
     if(p.degenerate){
       // f=a(x−h)^2+(y−k)^4+const has an actual strict minimum.
       // But D=0, so the *Hessian test alone* must still be inconclusive.
       expect(result).toBe("inconclusive");
       expect(p.a.numerator>0n).toBe(true);
       expect(p.b.numerator).toBe(0n);
       expect(p.c.numerator).toBe(0n);
       expect(task.question).toContain("⁴");
     }
   }
   expect(assessAnswer(task.answer,emptyAnswer(task.answer)).kind).toBe("invalid");
   const en=localizeUniversity(task,"en");
   expect(en.answer.kind).toBe(task.answer.kind);
   expect(en.contentKey).toBe(task.contentKey);
   expect(en.question).not.toMatch(/[ąćęłńóśźż]/i);
   expect(task.solution?.length).toBeGreaterThanOrEqual(5);
   expect(en.solution?.length).toBe(task.solution?.length);
  }
  expect(keys.size).toBe(72);
  if(family.id==="multivar-hessian-classify")expect([...modes].sort()).toEqual(["inconclusive","maximum","minimum","saddle"]);
 });
});