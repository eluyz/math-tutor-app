import {describe,it,expect} from "vitest";
import {rational as r,addRational as add,multiplyRational as mul,equalRational as eq} from "../rational";
import {formatRational as f,assessAnswer,emptyAnswer} from "../answers";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {partialGradientFamilies,partial,gradient,type PartialGradientProblem} from "./partialGradient";
describe("MT-EDU-018 P1 partial derivatives and gradients",()=>{
 it.each(partialGradientFamilies)("$id: 72 exact exercises",family=>{
  const keys=new Set<string>();
  for(const level of family.supportedDifficulties)for(let v=0;v<24;v++){
   const task=makeUniversityTask(family.id,v,level),p=task.university as PartialGradientProblem;
   keys.add(task.contentKey);
   const gx=add(add(mul(r(2),mul(p.a,p.x)),mul(p.b,p.y)),p.d);
   const gy=add(add(mul(p.b,p.x),mul(r(2),mul(p.c,p.y))),p.e);
   const [gotX,gotY]=gradient(p);
   expect(eq(gx,gotX)).toBe(true);expect(eq(gy,gotY)).toBe(true);
   if(p.kind==="multivar-gradient-point"){
     expect(task.answer.kind).toBe("list");
     if(task.answer.kind!=="list")throw Error("Expected gradient");
     expect(eq(task.answer.values[0],gx)).toBe(true);
     expect(eq(task.answer.values[1],gy)).toBe(true);
     expect(assessAnswer(task.answer,{kind:"list",values:[f(gx),f(gy)]}).kind).toBe("correct");
     expect(assessAnswer(task.answer,{kind:"list",values:[f(add(gx,r(1))),f(gy)]}).kind).toBe("incorrect");
   }else{
     const expectPart=p.target==="x"?gx:p.target==="y"?gy:p.target==="xx"?mul(r(2),p.a):p.target==="xy"?p.b:mul(r(2),p.c);
     expect(eq(partial(p),expectPart)).toBe(true);
     expect(task.answer.kind).toBe("scalar");
     if(task.answer.kind!=="scalar")throw Error("Expected scalar");
     expect(eq(task.answer.value,expectPart)).toBe(true);
     expect(assessAnswer(task.answer,f(expectPart)).kind).toBe("correct");
   }
   expect(assessAnswer(task.answer,emptyAnswer(task.answer)).kind).toBe("invalid");
   const en=localizeUniversity(task,"en");
   expect(en.answer).toEqual(task.answer);
   expect(en.contentKey).toBe(task.contentKey);
   expect(en.question).not.toMatch(/[ąćęłńóśźż]/i);
   expect(task.solution?.length).toBeGreaterThanOrEqual(5);
  }
  expect(keys.size).toBe(72);
 });
});