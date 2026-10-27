import {describe,it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {negativePowerFamilies,negativePowerResult,inverseTwo,type NegativePowerProblem} from "./negativePower";
import {q,a,s,m,d,eq} from "./audit";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";
import type {Rational} from "../rational";

type Mat=readonly (readonly Rational[])[];
const mm=(x:Mat,y:Mat):Rational[][]=>x.map(row=>y[0].map((_,j)=>row.reduce((sum,v,k)=>a(sum,m(v,y[k][j])),q(0))));
const det=(x:Mat)=>s(m(x[0][0],x[1][1]),m(x[0][1],x[1][0]));
const inv=(x:Mat):Mat=>{const delta=det(x);if(delta.numerator===0n)throw Error("Singular");return [
 [d(x[1][1],delta),d(q(-x[0][1].numerator,x[0][1].denominator),delta)],
 [d(q(-x[1][0].numerator,x[1][0].denominator),delta),d(x[0][0],delta)]];};
const equal=(x:Mat,y:Mat)=>x.length===y.length&&x.every((row,i)=>row.length===y[i].length&&row.every((v,j)=>eq(v,y[i][j])));
const I=[[q(1),q(0)],[q(0),q(1)]];
const expected=(p:NegativePowerProblem):Mat=>p.kind==="matrix-negative-square-two"?
 mm(inv(p.A),inv(p.A)):mm(mm(p.P,p.A),inv(p.P));

describe("MT-EDU-026 P2H-A: exact matrix inverse compositions",()=>{
 it("declares precisely 2 families × 3 levels × 24 = 144 variants",()=>{
  expect(negativePowerFamilies.map(x=>x.id)).toEqual(["matrix-negative-square-two","matrix-conjugation-two"]);
  expect(negativePowerFamilies.reduce((sum,f)=>sum+f.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const family of negativePowerFamilies)for(const level of family.supportedDifficulties)
 it(family.id+"/"+level+" audits each variant and locale independently",()=>{
  const keys=new Set<string>();
  for(let v=0;v<24;v++){
   const task=makeUniversityTask(family.id,v,level),p=task.university;
   if(p.kind!=="matrix-negative-square-two"&&p.kind!=="matrix-conjugation-two")throw Error("Wrong problem kind");
   keys.add(task.contentKey);
   expect(task.category).toBe("matrices");
   expect(eq(det(p.A),q(1))).toBe(true);
   const result=expected(p);
   expect(equal(negativePowerResult(p),result)).toBe(true);
   expect(equal(mm(p.A,inv(p.A)),I)).toBe(true);
   expect(equal(inverseTwo(p.A),inv(p.A))).toBe(true);
   if(p.kind==="matrix-negative-square-two"){
    expect(equal(mm(mm(p.A,p.A),result),I)).toBe(true);
   }else{
    expect(eq(det(p.P),q(1))).toBe(true);
    expect(equal(mm(p.P,inv(p.P)),I)).toBe(true);
    expect(eq(det(result),det(p.A))).toBe(true);
    expect(equal(mm(p.P,p.A),mm(p.A,p.P))).toBe(false);
   }
   for(const locale of ["pl","en"] as const){
    const view=localizeUniversity(task,locale),spec=view.answer;
    expect(view.contentKey).toBe(task.contentKey);
    expect(view.solution?.length).toBeGreaterThanOrEqual(6);
    expect(view.question.length).toBeGreaterThan(60);
    if(locale==="en")for(const t of [view.title,view.question,view.hint,view.nextHint,view.explanation,...view.solution!.map(z=>z.action+" "+z.reason)])
     expect(t).not.toMatch(polishLearningText);
    expect(spec.kind).toBe("matrix");
    if(spec.kind!=="matrix")throw Error("Expected matrix answer");
    expect(equal(spec.values,result)).toBe(true);
    expect(assessAnswer(spec,{kind:"matrix",values:result.map(row=>row.map(f))}).kind).toBe("correct");
    const wrong=result.map(row=>row.map(f));
    wrong[0][0]=f(a(result[0][0],q(1)));
    expect(assessAnswer(spec,{kind:"matrix",values:wrong}).kind).toBe("incorrect");
    wrong[0][0]="1/0";
    expect(assessAnswer(spec,{kind:"matrix",values:wrong}).kind).toBe("invalid");
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
   }
  }
  expect(keys.size).toBe(24);
 },45000);
 it("rejects unsupported variants, noninvertible matrices, and wrong input shape",()=>{
  for(const family of negativePowerFamilies){
   expect(()=>makeUniversityTask(family.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(family.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(family.id,0,"easy")).toThrow();
  }
  expect(()=>inverseTwo([[q(1),q(1)],[q(2),q(2)]])).toThrow();
  expect(()=>inverseTwo([[q(1),q(2),q(3)],[q(3),q(4),q(5)]])).toThrow();
 });
});
