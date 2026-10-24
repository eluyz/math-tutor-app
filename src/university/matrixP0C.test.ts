import {describe,it,expect} from "vitest";
import {matrixP0CFamilies,makeMatrixP0C} from "./matrixP0C";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {a,s,m,q,eq} from "./audit";
import {assessAnswer,formatRational as f} from "../answers";
import type {Rational} from "../rational";
import type {Practice} from "./matrixPractice";

type M=readonly (readonly Rational[])[];
const add=(A:M,B:M):Rational[][]=>A.map((row,i)=>row.map((v,j)=>a(v,B[i][j])));
const sub=(A:M,B:M):Rational[][]=>A.map((row,i)=>row.map((v,j)=>s(v,B[i][j])));
const mul=(A:M,B:M):Rational[][]=>A.map(row=>B[0].map((_,j)=>row.reduce((sum,v,k)=>a(sum,m(v,B[k][j])),q(0))));
const tr=(A:M):Rational[][]=>A[0].map((_,j)=>A.map(row=>row[j]));
const scaled=(A:M):Rational[][]=>A.map(row=>row.map(v=>m(v,q(3,2))));
const same=(A:M,B:M):boolean=>A.length===B.length&&A.every((row,i)=>row.length===B[i].length&&row.every((x,j)=>eq(x,B[i][j])));
type Shape={rows:number;columns:number};
const shape=(a:M):Shape=>({rows:a.length,columns:a[0].length});
const plus=(x:Shape|null,y:Shape|null):Shape|null=>x&&y&&x.rows===y.rows&&x.columns===y.columns?x:null;
const product=(x:Shape|null,y:Shape|null):Shape|null=>x&&y&&x.columns===y.rows?{rows:x.rows,columns:y.columns}:null;
const transpose=(x:Shape|null):Shape|null=>x?{rows:x.columns,columns:x.rows}:null;
const reference=(p:Practice):M|string=>{
 const get=(name:string)=>p.matrices.find(x=>x.label===name)!.values;
 const A=get("A"),B=get("B"),C=p.matrices.length>2?get("C"):null;
 if(p.mode==="rectangular"){
  if(!C)throw Error("Missing C");
  switch(p.expression){
   case "AB+C":return add(mul(A,B),C);
   case "(A+B)C":return mul(add(A,B),C);
   case "A(B−C)":return mul(A,sub(B,C));
   case "(AB)ᵀ−C":return sub(tr(mul(A,B)),C);
   case "(AB)ᵀ−(3/2)C":return sub(tr(mul(A,B)),scaled(C));
   default:throw Error("Unexpected P0C computation");
  }
 }
 if(p.mode!=="transpose-dimensions")throw Error("Expected P0C dimension family");
 const aa=shape(A),bb=shape(B),cc=C?shape(C):null;
 let ans:Shape|null;
 switch(p.expression){
  case "AᵀB":ans=product(transpose(aa),bb);break;
  case "Aᵀ(B+C)":ans=product(transpose(aa),plus(bb,cc));break;
  case "(AB)ᵀ+C":ans=plus(transpose(product(aa,bb)),cc);break;
  case "ABᵀ+C":ans=plus(product(aa,transpose(bb)),cc);break;
  case "(A+Bᵀ)C":ans=product(plus(aa,transpose(bb)),cc);break;
  default:throw Error("Unexpected P0C dimensions expression");
 }
 return ans?ans.rows+"x"+ans.columns:"not-possible";
};
describe("MT-EDU-019 P0C: independent mathematical and lesson audit",()=>{
 it.each(matrixP0CFamilies)("$id: 72 independently verified variants",family=>{
  const all=new Set<string>();const expressions=new Set<string>();
  for(const level of family.supportedDifficulties){
   const keys=new Set<string>();let valid=0,invalid=0;
   for(let v=0;v<24;v++){
    const task=makeUniversityTask(family.id,v,level);
    if(task.university.kind!=="linear-matrix-practice")throw Error("Matrix payload expected");
    const p=task.university;
    keys.add(task.contentKey);all.add(task.contentKey);expressions.add(p.expression);
    expect(p.matrices.length).toBeGreaterThanOrEqual(2);
    for(const item of p.matrices){
      expect(item.values.length).toBeGreaterThanOrEqual(2);
      expect(item.values.length).toBeLessThanOrEqual(3);
      expect(item.values[0].length).toBeGreaterThanOrEqual(2);
      expect(item.values[0].length).toBeLessThanOrEqual(3);
    }
    const answer=reference(p);
    const spec=task.answer;
    if(typeof answer==="string"){
      expect(spec.kind).toBe("choice");
      if(spec.kind!=="choice")throw Error("Expected choice");
      expect(spec.value).toBe(answer);
      if(answer==="not-possible")invalid++;else valid++;
      expect(assessAnswer(spec,{kind:"choice",value:answer}).kind).toBe("correct");
      expect(assessAnswer(spec,{kind:"choice",value:answer==="not-possible"?"2x2":"not-possible"}).kind).toBe("incorrect");
      expect(assessAnswer(spec,{kind:"choice",value:""}).kind).toBe("invalid");
    }else{
      expect(spec.kind).toBe("matrix");
      if(spec.kind!=="matrix")throw Error("Expected matrix");
      expect(same(spec.values,answer)).toBe(true);
      expect(assessAnswer(spec,{kind:"matrix",values:answer.map(row=>row.map(f))}).kind).toBe("correct");
      const wrong=answer.map(row=>row.map(f));
      wrong[0][0]=f(a(answer[0][0],q(1)));
      expect(assessAnswer(spec,{kind:"matrix",values:wrong}).kind).toBe("incorrect");
      wrong[0][0]="1/0";
      expect(assessAnswer(spec,{kind:"matrix",values:wrong}).kind).toBe("invalid");
    }
    const en=localizeUniversity(task,"en");
    expect(en.contentKey).toBe(task.contentKey);
    expect(en.answer.kind).toBe(spec.kind);
    expect(en.solution?.length).toBe(task.solution?.length);
    expect(en.solution?.length).toBeGreaterThanOrEqual(4);
    for(const st of en.solution||[]){
      expect(st.action.length).toBeGreaterThan(8);
      expect(st.reason.length).toBeGreaterThan(20);
    }
    expect(en.question).not.toMatch(/[\u0105\u0107\u0119\u0142\u0144\u00f3\u015b\u017a\u017c]/i);
   }
   expect(keys.size).toBe(24);
   if(family.id==="matrix-transpose-dimensions"){
     expect(valid).toBeGreaterThan(0);
     expect(invalid).toBeGreaterThan(0);
   }
  }
  expect(all.size).toBe(72);
  expect(expressions.size).toBeGreaterThanOrEqual(3);
 });
 it("boundary variants and difficulty levels are enforced",()=>{
   expect(()=>makeMatrixP0C("rectangular",24,"easy")).toThrow();
   expect(()=>makeMatrixP0C("transpose-dimensions",-1,"hard")).toThrow();
 });
});
