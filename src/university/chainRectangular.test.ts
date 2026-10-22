import { describe, expect, it } from "vitest";
import { difficulties } from "../difficulty";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { chainFamilies } from "./chainEqualities";
import { rectangularFamilies } from "./rectangularSystems";
import { formatRational as f, assessAnswer, emptyAnswer } from "../answers";
import { a, s, m, d, eq, q, laplace } from "./audit";
import type { Rational } from "../rational";
import type { ExactMatrix } from "./linearAlgebraMath";

const sum=(v:readonly Rational[])=>v.reduce(a,q(0));
const comb=(n:number,k:number):number[][]=>k===0?[[]]:Array.from({length:n},(_,i)=>comb(n-i-1,k-1).map(rest=>[i,...rest.map(j=>i+j+1)])).flat();
function independentRank(A:ExactMatrix):number{
  for(let k=Math.min(A.length,A[0].length);k>=1;k--)
    for(const rows of comb(A.length,k))
      for(const columns of comb(A[0].length,k))
        if(laplace(rows.map(i=>columns.map(j=>A[i][j]))).numerator!==0n)return k;
  return 0;
}
describe("MT-EDU-014 P1 five-expression equality chains",()=>{
  it("creates 96 tasks across four supported difficulties",()=>{
    expect(chainFamilies).toHaveLength(1);
    expect(chainFamilies[0].supportedDifficulties).toHaveLength(4);
  });
  for(const level of difficulties)it(`${level}: 24 distinct solvable chains, correct requested unknown, full PL/EN`,()=>{
    if(!chainFamilies[0].supportedDifficulties.includes(level))return;
    const seen=new Set<string>();
    for(let v=0;v<24;v++){
      const task=makeUniversityTask("system-chain-five",v,level),p=task.university;
      if(p.kind!=="linear-chain-five")throw Error("Incorrect kind");
      seen.add(task.contentKey);
      expect(p.expressions).toHaveLength(5);
      const e0=p.expressions[0],e1=p.expressions[1],e2=p.expressions[2];
      const first={
        a:s(d(e0.a,e0.denominator),d(e1.a,e1.denominator)),
        b:s(d(e0.b,e0.denominator),d(e1.b,e1.denominator)),
        c:s(d(e1.c,e1.denominator),d(e0.c,e0.denominator)),
      },second={
        a:s(d(e0.a,e0.denominator),d(e2.a,e2.denominator)),
        b:s(d(e0.b,e0.denominator),d(e2.b,e2.denominator)),
        c:s(d(e2.c,e2.denominator),d(e0.c,e0.denominator)),
      };
      const D=s(m(first.a,second.b),m(first.b,second.a));
      expect(D.numerator).not.toBe(0n);
      const x=d(s(m(first.c,second.b),m(first.b,second.c)),D);
      const y=d(s(m(first.a,second.c),m(first.c,second.a)),D);
      const expressions=p.expressions.map(e=>d(a(a(m(e.a,x),m(e.b,y)),e.c),e.denominator));
      expect(expressions.every(z=>eq(z,expressions[0]))).toBe(true);
      for(const locale of ["pl","en"] as const){
        const lesson=localizeUniversity(task,locale),answer=lesson.answer;
        expect(answer.kind).toBe("scalar");
        if(answer.kind!=="scalar")throw Error("Expected requested scalar");
        expect(eq(answer.value,p.target==="x"?x:y)).toBe(true);
        expect(lesson.question.match(/·x/g)?.length).toBe(5);
        expect(lesson.question.match(/·y/g)?.length).toBe(5);
        expect(lesson.solution!.length).toBeGreaterThan(4);
        expect(assessAnswer(answer,f(answer.value)).kind).toBe("correct");
        expect(assessAnswer(answer,"999999").kind).toBe("incorrect");
        expect(assessAnswer(answer,emptyAnswer(answer)).kind).toBe("invalid");
      }
    }
    expect(seen.size).toBe(24);
  });
});
describe("MT-EDU-014 P1 rectangular system classification",()=>{
  it("adds 96 3×2 and 4×3 systems covering each solvability class",()=>{
    expect(rectangularFamilies.reduce((n,family)=>n+family.supportedDifficulties.length*24,0)).toBe(96);
  });
  for(const family of rectangularFamilies)for(const level of family.supportedDifficulties)
    it(`${family.id}/${level}: 24 unique rank-audited variants and bilingual lessons`,()=>{
      const seen=new Set<string>(),classes=new Set<string>();
      for(let v=0;v<24;v++){
        const task=makeUniversityTask(family.id,v,level),p=task.university;
        if(p.kind!=="linear-rectangular")throw Error("Incorrect kind");
        seen.add(task.contentKey);
        const n=p.matrix[0].length;
        expect(p.matrix.length).toBe(n+1);
        const rankA=independentRank(p.matrix),rankAugmented=independentRank(p.matrix.map((row,i)=>[...row,p.rhs[i]]));
        const kind=rankA<rankAugmented?"system-none":rankA===n?"system-one":"system-many";
        classes.add(kind);
        for(const locale of ["pl","en"] as const){
          const lesson=localizeUniversity(task,locale),answer=lesson.answer;
          expect(answer.kind).toBe("choice");
          if(answer.kind!=="choice")throw Error("Expected choice");
          expect(answer.value).toBe(kind);
          expect(lesson.solution!.length).toBeGreaterThan(4);
          const text=lesson.solution!.map(step=>step.action).join("\n");
          expect(text).toContain("rank(A)");
          expect(text).toContain("RREF");
          if(kind==="system-none")expect(text).toContain("0 = ");
          if(kind==="system-many")expect(text).toContain("t1");
          const correct={kind:"choice" as const,value:kind};
          expect(assessAnswer(answer,correct).kind).toBe("correct");
          expect(assessAnswer(answer,{...correct,value:kind==="system-one"?"system-none":"system-one"}).kind).toBe("incorrect");
          expect(assessAnswer(answer,emptyAnswer(answer)).kind).toBe("invalid");
        }
      }
      expect(classes).toEqual(new Set(["system-one","system-none","system-many"]));
      expect(seen.size).toBe(24);
    });
});
