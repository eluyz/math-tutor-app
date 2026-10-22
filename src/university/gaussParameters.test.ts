import {describe,it,expect} from "vitest";
import {assessAnswer,emptyAnswer,formatRational as format} from "../answers";
import {taskPool} from "../generators";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {gaussParameterFamilies} from "./gaussParameters";
import {a,m,eq,q,laplace} from "./audit";
import type {Rational} from "../rational";

/** Independent rank via nonzero square minors (not the production RREF routine). */
const combinations=(n:number,k:number):number[][]=>k===0?[[]]:
  Array.from({length:n},(_,i)=>combinations(n-i-1,k-1).map(rest=>[i,...rest.map(j=>j+i+1)])).flat();
function independentRank(matrix:readonly (readonly Rational[])[]) {
  for(let k=Math.min(matrix.length,matrix[0].length);k>=1;k--)
    for(const rows of combinations(matrix.length,k))
      for(const cols of combinations(matrix[0].length,k))
        if(laplace(rows.map(i=>cols.map(j=>matrix[i][j]))).numerator!==0n)return k;
  return 0;
}
function sum(values:readonly Rational[]) {return values.reduce(a,q(0));}
describe("MT-EDU-014 P0 full parametric Gaussian solutions",()=>{
  it("declares 120 distinct tasks with guaranteed 1–2 free variables",()=>{
    expect(gaussParameterFamilies.reduce((count,family)=>count+family.supportedDifficulties.length*24,0)).toBe(120);
  });
  for(const family of gaussParameterFamilies)
    for(const difficulty of family.supportedDifficulties)
      it(`${family.id}/${difficulty}: all 24 variants and PL/EN complete parameters`,()=>{
        const tasks=taskPool("systems",difficulty).filter(t=>t.templateId===family.id);
        expect(tasks).toHaveLength(24);
        expect(new Set(tasks.map(t=>t.contentKey)).size).toBe(24);
        for(let v=0;v<24;v++){
          const task=makeUniversityTask(family.id,v,difficulty),p=task.university;
          if(p.kind!=="linear-system")throw Error("Not a linear system");
          expect(p.method).toBe("parameters");
          const n=p.matrix[0].length,free=family.id==="gauss-parameters-one"?1:2;
          expect(n).toBe(difficulty==="hard"?3:4);
          expect(independentRank(p.matrix)).toBe(n-free);
          expect(independentRank(p.matrix.map((row,i)=>[...row,p.rhs[i]]))).toBe(n-free);
          for(const locale of ["pl","en"] as const){
            const local=localizeUniversity(task,locale);
            const answer=local.answer;
            expect(answer.kind).toBe("list");
            if(answer.kind!=="list")throw Error("Expected coefficient form");
            expect(answer.labels).toHaveLength(n*(free+1));
            expect(answer.values).toHaveLength(n*(free+1));
            expect(local.question).toContain("t1");
            if(free===2)expect(local.question).toContain("t2");
            expect(local.solution).toBeDefined();
            expect(local.solution!.length).toBeGreaterThan(4);
            // Evaluate the constant solution and EACH individual parameter
            // coefficient in the ORIGINAL (not row-reduced) equations.
            for(let i=0;i<n;i++){
              for(let k=0;k<=free;k++){
                const lhs=sum(p.matrix[i].map((c,j)=>m(c,answer.values[j*(free+1)+k])));
                expect(eq(lhs,k===0?p.rhs[i]:q(0)),
                  `${family.id}/${difficulty}/${v}, eq ${i}, term ${k}`).toBe(true);
              }
            }
            const correct={kind:"list" as const,values:answer.values.map(format)};
            expect(assessAnswer(answer,correct).kind).toBe("correct");
            expect(assessAnswer(answer,emptyAnswer(answer)).kind).toBe("invalid");
            expect(assessAnswer(answer,{...correct,values:correct.values.map((x,i)=>i===0?"987654":x)}).kind).toBe("incorrect");
            expect(assessAnswer(answer,{...correct,values:correct.values.map((x,i)=>i===0?"1/0":x)}).kind).toBe("invalid");
          }
        }
      });
});
