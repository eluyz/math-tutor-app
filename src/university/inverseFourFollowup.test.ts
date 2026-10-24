import {describe,it,expect} from "vitest";
import {inverseFourFollowupFamilies} from "./inverseFourFollowup";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {inverse,type ExactMatrix} from "./linearAlgebraMath";
import {laplace,eq,m,d,q,a,s,auditCalculation} from "./audit";
import {assessAnswer,formatRational,emptyAnswer} from "../answers";

const minor=(A:ExactMatrix,i:number,j:number)=>
  A.filter((_,row)=>row!==i).map(row=>row.filter((_,col)=>col!==j));
const cofactorInverse=(A:ExactMatrix):ExactMatrix=>{
  const det=laplace(A);
  if(det.numerator===0n)throw Error("P0F2 matrix unexpectedly singular");
  return A.map((_,i)=>A.map((_,j)=>
    d(m(q((i+j)%2?-1:1),laplace(minor(A,j,i))),det)));
};
const dot=(A:ExactMatrix,B:ExactMatrix):ExactMatrix=>
  A.map(row=>B[0].map((_,j)=>row.map((v,k)=>m(v,B[k][j])).reduce(a,q(0))));
const same=(A:ExactMatrix,B:ExactMatrix)=>A.length===B.length&&
  A.every((row,i)=>row.length===B[i].length&&row.every((v,j)=>eq(v,B[i][j])));
const id=(n:number):ExactMatrix=>Array.from({length:n},(_,i)=>
  Array.from({length:n},(_,j)=>q(i===j?1:0)));
const shifted=(A:ExactMatrix):ExactMatrix=>
  A.map((row,i)=>row.map((v,j)=>i===j?s(v,q(4)):v));

describe("MT-EDU-019 P0F2: XA=B and AX=4X+B for A 4×4",()=>{
  expect(inverseFourFollowupFamilies.map(f=>f.id)).toEqual([
    "inverse-four-xa-equation","matrix-ax-shift-four"
  ]);
  for(const family of inverseFourFollowupFamilies)it(family.id+" — 72 unique independent PL/EN cases",()=>{
    const keys=new Set<string>();
    let pivotsRequiringSwaps=0, fractional=0;
    for(const level of family.supportedDifficulties)for(let variant=0;variant<24;variant++){
      const task=makeUniversityTask(family.id,variant,level);
      const p=task.university;
      if(p.kind!=="linear-application"&&p.kind!=="linear-matrix-equation")
        throw Error("Unexpected P0F2 task kind");
      const right=p.kind==="linear-application";
      if(right)expect(p.method).toBe("xa");
      else expect(p.mode).toBe("ax-shift");
      const A=right?p.matrix:p.left, B=p.rhs, reduced=right?A:shifted(A);
      expect(A.length).toBe(4);
      expect(A.every(row=>row.length===4)).toBe(true);
      expect(B.length).toBe(right?2:4);
      expect(B.every(row=>row.length===4)).toBe(true);
      const determinant=laplace(reduced);
      expect(determinant.numerator).not.toBe(0n);
      const oracle=cofactorInverse(reduced);
      expect(same(dot(oracle,reduced),id(4))).toBe(true);
      expect(same(dot(reduced,oracle),id(4))).toBe(true);
      const gauss=inverse(reduced);
      expect(gauss.value).not.toBeNull();
      expect(same(gauss.value!,oracle)).toBe(true);
      if(gauss.reduction.steps.some(step=>step.action.includes("↔")))pivotsRequiringSwaps++;
      if(A.some(row=>row.some(v=>v.denominator!==1n)))fractional++;
      keys.add(task.contentKey);

      for(const locale of ["pl","en"] as const){
        const localized=localizeUniversity(task,locale);
        expect(localized.question.length).toBeGreaterThan(50);
        expect(localized.hint.length).toBeGreaterThan(0);
        expect(localized.nextHint.length).toBeGreaterThan(0);
        expect(localized.solution!.length).toBeGreaterThan(4);
        if(locale==="en")expect(localized.question).not.toMatch(/[ąćęłńóśźż]/i);
        for(const step of localized.solution!)if(step.kind==="working")
          for(const calc of step.calculations)expect(auditCalculation(calc)).toBe(true);
        expect(localized.answer.kind).toBe("matrix");
        if(localized.answer.kind!=="matrix")throw Error("Expected matrix answer");
        const X=localized.answer.values;
        expect(X.length).toBe(right?2:4);
        expect(X.every(row=>row.length===4)).toBe(true);
        if(right){
          expect(same(X,dot(B,oracle))).toBe(true);
          expect(same(dot(X,A),B)).toBe(true);
        }else{
          expect(same(X,dot(oracle,B))).toBe(true);
          const lhs=dot(A,X);
          const rhs=X.map((row,i)=>row.map((v,j)=>a(m(q(4),v),B[i][j])));
          expect(same(lhs,rhs)).toBe(true);
        }
        const correct={kind:"matrix" as const,values:X.map(row=>row.map(formatRational))};
        const wrong={kind:"matrix" as const,values:correct.values.map((row,i)=>
          row.map((v,j)=>i===0&&j===0?"999999":v))};
        const malformed={kind:"matrix" as const,values:correct.values.map((row,i)=>
          row.map((v,j)=>i===0&&j===0?"1/0":v))};
        expect(assessAnswer(localized.answer,emptyAnswer(localized.answer)).kind).toBe("invalid");
        expect(assessAnswer(localized.answer,correct).kind).toBe("correct");
        expect(assessAnswer(localized.answer,wrong).kind).toBe("incorrect");
        expect(assessAnswer(localized.answer,malformed).kind).toBe("invalid");
      }
    }
    expect(keys.size).toBe(72);
    expect(pivotsRequiringSwaps).toBeGreaterThanOrEqual(36);
    expect(fractional).toBeGreaterThan(0);
  },30000);

  it("rejects invalid variants, unsupported difficulties, and noninteger variants",()=>{
    for(const f of inverseFourFollowupFamilies){
      expect(()=>makeUniversityTask(f.id,-1,"hard")).toThrow();
      expect(()=>makeUniversityTask(f.id,24,"hard")).toThrow();
      expect(()=>makeUniversityTask(f.id,1.5,"hard")).toThrow();
      expect(()=>makeUniversityTask(f.id,0,"easy")).toThrow();
    }
  });
});
