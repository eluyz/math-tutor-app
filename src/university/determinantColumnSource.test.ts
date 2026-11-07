import { describe, expect, it } from "vitest";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { q, m, s, d, eq } from "./audit";
import { assessAnswer, formatRational as f } from "../answers";
import type { Rational } from "../rational";

type Matrix = readonly (readonly Rational[])[];
function gaussian(input: Matrix): Rational {
  const a=input.map(row=>[...row]);
  let sign=q(1);
  for(let k=0;k<a.length;k++){
    const pivot=a.findIndex((row,i)=>i>=k&&row[k].numerator!==0n);
    if(pivot<0)return q(0);
    if(pivot!==k){[a[pivot],a[k]]=[a[k],a[pivot]];sign=m(sign,q(-1));}
    for(let i=k+1;i<a.length;i++){
      const factor=d(a[i][k],a[k][k]);
      for(let j=k;j<a.length;j++)a[i][j]=s(a[i][j],m(factor,a[k][j]));
    }
  }
  return a.reduce((product,row,i)=>m(product,row[i]),sign);
}
describe("#156 M08 source-style sparse third-column Laplace",()=>{
  it("has 24 distinct source-topology 4×4 cases, correct signed cofactors, PL/EN grading",()=>{
    const distinct=new Set<string>();
    for(let v=0;v<24;v++){
      const task=makeUniversityTask("determinant-laplace-column-three",v,"hard");
      const reference=makeUniversityTask("determinant-laplace-four",v,"hard");
      const p=task.university;
      if(p.kind!=="determinant"||reference.university.kind!=="determinant")throw Error("Missing determinant");
      expect(p.method).toBe("laplace-column-four");
      expect(p.matrix).toHaveLength(4);
      expect(p.matrix.every(row=>row.length===4)).toBe(true);
      expect(p.matrix.slice(0,3).every(row=>row[2].numerator===0n)).toBe(true);
      expect(p.matrix[3][2].numerator).not.toBe(0n);
      expect(p.matrix.every(row=>row.filter(x=>x.numerator!==0n).length>=2)).toBe(true);
      distinct.add(task.contentKey);
      const actual=gaussian(p.matrix);
      expect(eq(actual,gaussian(reference.university.matrix))).toBe(true);
      const minor=p.matrix.slice(0,3).map(row=>row.filter((_,i)=>i!==2));
      // C43 has negative cofactor parity, so only one signed 3×3 minor.
      expect(eq(actual,m(q(-1),m(p.matrix[3][2],gaussian(minor))))).toBe(true);
      for(const locale of ["pl","en"] as const){
        const view=localizeUniversity(task,locale);
        if(view.answer.kind!=="scalar")throw Error("Expected scalar");
        expect(eq(view.answer.value,actual)).toBe(true);
        expect(view.hint.length).toBeGreaterThan(20);
        expect(view.nextHint.length).toBeGreaterThan(20);
        expect(view.solution?.length).toBeGreaterThan(3);
        expect(view.solution?.[0]?.action).toMatch(locale==="pl"?/kolumna 3/:/column 3/);
        const cofactors=view.solution!.filter(x=>x.kind==="working"&&/^C\d\d:/.test(x.action));
        expect(cofactors).toHaveLength(1);
        expect(cofactors[0].action).toContain("C43");
        expect(assessAnswer(view.answer,f(actual)).kind).toBe("correct");
        expect(assessAnswer(view.answer,f(s(actual,q(1)))).kind).toBe("incorrect");
        expect(assessAnswer(view.answer,"").kind).toBe("invalid");
        expect(view.solution?.at(-1)?.kind).toBe("answer");
      }
    }
    expect(distinct.size).toBe(24);
  });
});
