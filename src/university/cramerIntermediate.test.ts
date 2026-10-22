import { describe, expect, it } from "vitest";
import { rational as r, addRational as add, multiplyRational as mul,
  divideRational as div, equalRational as eq, type Rational } from "../rational";
import { assessAnswer, formatRational as f } from "../answers";
import { cramerIntermediateFamilies } from "./cramerIntermediate";
import { localizeUniversity, makeUniversityTask } from "./catalog";
import type { ExactMatrix } from "./linearAlgebraMath";
import { taskPool } from "../generators";
import { auditCalculation } from "./audit";

const perms=(n:number):number[][]=>{
  const f=(used:number[]):number[][]=>used.length===n?[used]:
    Array.from({length:n},(_,j)=>j).filter(j=>!used.includes(j)).flatMap(j=>f([...used,j]));
  return f([]);
};
/** Independent Leibniz sum, deliberately not using the production Laplace evaluator. */
const leibniz=(A:ExactMatrix)=>{
  const ps=perms(A.length);
  return ps.map(p=>{
    const swaps=p.reduce((n,x,i)=>n+p.slice(i+1).filter(y=>x>y).length,0);
    return p.reduce((product,j,i)=>mul(product,A[i][j]),r(swaps%2?-1:1));
  }).reduce(add,r(0));
};
const dot=(row:readonly Rational[],x:readonly Rational[])=>row.reduce((sum,v,i)=>add(sum,mul(v,x[i])),r(0));

describe("MT-EDU-012 Cramer intermediate determinants",()=>{
  it("adds 120 nonduplicated exercises without changing existing Cramer families",()=>{
    const ids=new Set(cramerIntermediateFamilies.map(family=>family.id));
    expect(cramerIntermediateFamilies).toHaveLength(2);
    expect(cramerIntermediateFamilies.reduce((s,family)=>s+family.supportedDifficulties.length,0)).toBe(5);
    const all=["easy","medium","hard","advanced","expert"].flatMap(level=>taskPool("systems",level as "easy"|"medium"|"hard"|"advanced"|"expert")).filter(x=>ids.has(x.templateId));
    expect(all).toHaveLength(120);
    expect(new Set(all.map(x=>x.id)).size).toBe(120);
    expect(new Set(all.map(x=>x.contentKey)).size).toBe(120);
  });
  for(const family of cramerIntermediateFamilies)for(const difficulty of family.supportedDifficulties)
    it(`${family.id}/${difficulty}: D and all Dᵢ are correct in 24 PL/EN tasks`,()=>{
      const seen=new Set<string>();
      for(let variant=0;variant<24;variant++){
        const t=makeUniversityTask(family.id,variant,difficulty);
        if(t.university.kind!=="linear-cramer-minors")throw Error("Unexpected kind");
        const p=t.university,n=p.matrix.length;
        expect(n).toBe(family.id.endsWith("three")?3:4);
        expect(p.rhs).toHaveLength(n);
        const D=leibniz(p.matrix);
        expect(D.numerator).not.toBe(0n);
        const ds=Array.from({length:n},(_,j)=>leibniz(p.matrix.map((row,i)=>row.map((v,k)=>k===j?p.rhs[i]:v))));
        const x=ds.map(v=>div(v,D));
        expect(p.matrix.every((row,i)=>eq(dot(row,x),p.rhs[i]))).toBe(true);
        seen.add(t.contentKey);
        for(const locale of ["pl","en"] as const){
          const task=localizeUniversity(t,locale);
          expect(task.id).toBe(t.id);
          expect(task.contentKey).toBe(t.contentKey);
          expect(task.title).toBe(family.titles[locale]);
          expect(task.question).toContain(locale==="pl"?"oblicz":"calculate");
          const answer=task.answer;
          expect(answer.kind).toBe("list");
          if(answer.kind!=="list")throw Error("Expected list");
          const expected=[D,...ds];
          expect(answer.values).toHaveLength(n+1);
          expect(answer.values.every((v,j)=>eq(v,expected[j]))).toBe(true);
          expect(answer.labels).toEqual(["D",...Array.from({length:n},(_,i)=>`D${i+1}`)]);
          const input={kind:"list" as const,values:expected.map(f)};
          expect(assessAnswer(answer,input).kind).toBe("correct");
          expect(assessAnswer(answer,{...input,values:[f(add(D,r(1))),...input.values.slice(1)]}).kind).toBe("incorrect");
          expect(assessAnswer(answer,{...input,values:["1/0",...input.values.slice(1)]}).kind).toBe("invalid");
          expect(task.solution?.length).toBeGreaterThan(10);
          const steps=task.solution?.filter(step=>step.kind==="working")||[];
          expect(steps.some(step=>step.action.startsWith("D = "))).toBe(true);
          for(let j=1;j<=n;j++)expect(steps.some(step=>step.action.startsWith(`D${j} = `))).toBe(true);
          for(const step of steps)for(const calculation of step.calculations)
            expect(auditCalculation(calculation)).toBe(true);
        }
      }
      expect(seen.size).toBe(24);
    });
});
