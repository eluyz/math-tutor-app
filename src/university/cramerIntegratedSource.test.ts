import { describe, expect, it } from "vitest";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { laplace, q, a, m, d, eq } from "./audit";
import { assessAnswer, emptyAnswer, formatRational as f } from "../answers";
import type { Rational } from "../rational";

type M = readonly (readonly Rational[])[];
function rank(input:M):number{
  const matrix=input.map(row=>[...row]);let pivot=0;
  for(let j=0;j<matrix[0].length&&pivot<matrix.length;j++){
    const r=matrix.findIndex((row,i)=>i>=pivot&&row[j].numerator!==0n);
    if(r<0)continue;
    [matrix[pivot],matrix[r]]=[matrix[r],matrix[pivot]];
    const divisor=matrix[pivot][j];
    matrix[pivot]=matrix[pivot].map(x=>d(x,divisor));
    for(let i=0;i<matrix.length;i++)if(i!==pivot){
      const scale=matrix[i][j];
      matrix[i]=matrix[i].map((x,k)=>a(x,m(q(-1),m(scale,matrix[pivot][k]))));
    }
    pivot++;
  }
  return pivot;
}
describe("#157 U02 source-style integrated Cramer applicability and solve",()=>{
  it("audits all 24 medium 3×3 variants, rank classes, exact Cramer solutions and bilingual grading",()=>{
    const counts={"system-one":0,"system-none":0,"system-many":0};
    const keys=new Set<string>();
    for(let v=0;v<24;v++){
      const task=makeUniversityTask("cramer-eligibility-solve-three",v,"medium");
      keys.add(task.contentKey);
      const p=task.university;
      if(p.kind!=="linear-cramer-diagnostic")throw Error("Missing diagnostic");
      expect(p.target).toBe("eligibility-solve");
      expect(p.matrix.length).toBe(3);
      expect(p.matrix.every(row=>row.length===3)).toBe(true);
      const D=laplace(p.matrix);
      const ra=rank(p.matrix),rab=rank(p.matrix.map((row,i)=>[...row,p.rhs[i]]));
      const classification=ra<rab?"system-none":ra===3?"system-one":"system-many";
      counts[classification]++;
      expect(D.numerator!==0n).toBe(classification==="system-one");
      const values=D.numerator!==0n?Array.from({length:3},(_,j)=>
        d(laplace(p.matrix.map((row,i)=>row.map((c,k)=>j===k?p.rhs[i]:c))),D)):[];
      if(values.length)for(let i=0;i<3;i++)
        expect(eq(p.matrix[i].reduce((sum,c,j)=>a(sum,m(c,values[j])),q(0)),p.rhs[i])).toBe(true);
      for(const locale of ["pl","en"] as const){
        const view=localizeUniversity(task,locale),spec=view.answer;
        if(spec.kind!=="system")throw Error("Expected combined system answer");
        expect(spec.classification).toBe(classification);
        expect(spec.variables).toEqual(["x","y","z"]);
        expect(spec.values.length).toBe(values.length);
        expect(spec.values.every((x,i)=>eq(x,values[i]))).toBe(true);
        const correct={kind:"system" as const,classification,values:values.map(f)};
        expect(assessAnswer(spec,correct).kind).toBe("correct");
        expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
        const bad=classification==="system-one"
          ?{kind:"system" as const,classification,values:values.map((x,i)=>i===0?"999999":f(x))}
          :{kind:"system" as const,classification:"system-one",values:["0","0","0"]};
        expect(assessAnswer(spec,bad).kind).toBe("incorrect");
        expect(view.question).toContain("D");
        expect(view.solution?.length).toBeGreaterThanOrEqual(4);
        expect(view.hint.length).toBeGreaterThan(15);
        expect(view.nextHint.length).toBeGreaterThan(15);
        if(classification==="system-one")
          expect(view.solution?.some(step=>step.action.includes("D3"))).toBe(true);
      }
    }
    expect(counts).toEqual({"system-one":8,"system-none":8,"system-many":8});
    expect(keys.size).toBe(24);
  });
});
