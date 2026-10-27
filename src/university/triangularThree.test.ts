import {describe,it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {triangularThreeFamilies,triangularThreeResult,triangularUpperInverse,lowerElementaryInverse,type TriangularThreeProblem} from "./triangularThree";
import {q,a,s,m,d,eq} from "./audit";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";
import {rational as normalize,type Rational} from "../rational";
type M=readonly (readonly Rational[])[];
const format=(v:Rational)=>f(normalize(v.numerator,v.denominator));
const I=Array.from({length:3},(_,i)=>Array.from({length:3},(_,j)=>q(i===j?1:0)));
const mul=(A:M,B:M):Rational[][]=>A.map(row=>B[0].map((_,j)=>row.reduce((acc,x,k)=>a(acc,m(x,B[k][j])),q(0))));
const eql=(A:M,B:M)=>A.length===B.length&&A.every((row,i)=>row.length===B[i].length&&row.every((x,j)=>eq(x,B[i][j])));
function inverseGauss(A:M):Rational[][]{
 const x=A.map((row,i)=>[...row,...I[i]]);
 for(let col=0;col<3;col++){
  const pivot=x.findIndex((row,i)=>i>=col&&row[col].numerator!==0n);
  if(pivot<0)throw Error("Singular reference matrix");
  [x[pivot],x[col]]=[x[col],x[pivot]];
  const p=x[col][col]; x[col]=x[col].map(v=>d(v,p));
  for(let k=0;k<3;k++)if(k!==col){
   const factor=x[k][col];
   x[k]=x[k].map((v,j)=>s(v,m(factor,x[col][j])));
  }
 }
 return x.map(row=>row.slice(3));
}
const independent=(p:TriangularThreeProblem):M=>p.kind==="matrix-negative-square-three"
 ?mul(inverseGauss(p.A),inverseGauss(p.A))
 :mul(mul(p.P,p.A),inverseGauss(p.P));
const determinant=(A:M)=>s(a(s(m(m(A[0][0],A[1][1]),A[2][2]),m(m(A[0][1],A[1][2]),A[2][0])),
 m(m(A[0][2],A[1][0]),A[2][1])),a(a(m(m(A[0][2],A[1][1]),A[2][0]),
 m(m(A[0][1],A[1][0]),A[2][2])),m(m(A[0][0],A[1][2]),A[2][1])));

describe("MT-EDU-026 P2H-B: 3×3 inverse-power and similarity exact audit",()=>{
 it("has exactly two families, 3 declared levels and 144 task variants",()=>{
  expect(triangularThreeFamilies.map(f=>f.id)).toEqual(["matrix-negative-square-three","matrix-conjugation-three"]);
  expect(triangularThreeFamilies.reduce((n,f)=>n+f.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const family of triangularThreeFamilies)for(const level of family.supportedDifficulties)
 it(family.id+"/"+level+" checks all variants and bilingual answers",()=>{
  const seen=new Set<string>();
  for(let v=0;v<24;v++){
   const task=makeUniversityTask(family.id,v,level),p=task.university;
   if(p.kind!=="matrix-negative-square-three"&&p.kind!=="matrix-conjugation-three")throw Error("Unexpected kind");
   seen.add(task.contentKey);
   expect(task.category).toBe("matrices");
   expect(eq(determinant(p.A),q(1))).toBe(true);
   expect(eql(mul(p.A,inverseGauss(p.A)),I)).toBe(true);
   expect(eql(triangularUpperInverse(p.A),inverseGauss(p.A))).toBe(true);
   const wanted=independent(p),actual=triangularThreeResult(p);
   expect(eql(actual,wanted)).toBe(true);
   if(p.kind==="matrix-negative-square-three"){
    expect(eql(mul(mul(p.A,p.A),wanted),I)).toBe(true);
   }else{
    expect(eq(determinant(p.P),q(1))).toBe(true);
    expect(eql(lowerElementaryInverse(p.P),inverseGauss(p.P))).toBe(true);
    expect(eql(mul(p.P,inverseGauss(p.P)),I)).toBe(true);
    expect(eql(mul(p.P,p.A),mul(p.A,p.P))).toBe(false);
    expect(eq(determinant(wanted),determinant(p.A))).toBe(true);
   }
   for(const locale of ["pl","en"] as const){
    const view=localizeUniversity(task,locale),spec=view.answer;
    expect(view.contentKey).toBe(task.contentKey);
    expect(view.question.length).toBeGreaterThan(50);
    expect(view.solution?.length).toBeGreaterThanOrEqual(6);
    if(locale==="en")for(const copy of [view.title,view.question,view.hint,view.nextHint,view.explanation,...view.solution!.map(z=>z.action+" "+z.reason)])
     expect(copy).not.toMatch(polishLearningText);
    expect(spec.kind).toBe("matrix");
    if(spec.kind!=="matrix")throw Error("Expected matrix");
    expect(eql(spec.values,wanted)).toBe(true);
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    const correct=wanted.map(row=>row.map(format));
    const checked=assessAnswer(spec,{kind:"matrix",values:correct});
    expect(checked,`${family.id}/${level}/${v}/${locale}: ${JSON.stringify(correct)}; feedback=${JSON.stringify(checked)}`).toEqual({kind:"correct"});
    const wrong=correct.map(row=>[...row]);wrong[0][0]=format(a(wanted[0][0],q(1)));
    expect(assessAnswer(spec,{kind:"matrix",values:wrong}).kind).toBe("incorrect");
    wrong[0][0]="1/0";
    expect(assessAnswer(spec,{kind:"matrix",values:wrong}).kind).toBe("invalid");
   }
  }
  expect(seen.size).toBe(24);
 },45000);
 it("rejects out-of-range instances, wrong levels and malformed inverse assumptions",()=>{
  for(const family of triangularThreeFamilies){
   expect(()=>makeUniversityTask(family.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(family.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(family.id,0,"easy")).toThrow();
  }
  expect(()=>triangularUpperInverse([[q(1),q(2)],[q(0),q(1)]])).toThrow();
  expect(()=>triangularUpperInverse([[q(2),q(1),q(1)],[q(0),q(1),q(1)],[q(0),q(0),q(1)]])).toThrow();
  expect(()=>lowerElementaryInverse(I)).toThrow();
 });
});
