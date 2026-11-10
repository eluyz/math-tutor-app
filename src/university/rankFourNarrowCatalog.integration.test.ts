import {describe,it,expect} from "vitest";
import {assessAnswer,emptyAnswer} from "../answers";
import {equalRational as eq,rational as r,type Rational} from "../rational";
import {taskPool} from "../generators";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {fourNarrowRankStageFamilies} from "./rankFourNarrowStage";
import {laplace} from "./audit";

type Matrix=readonly (readonly Rational[])[];
const choose=(n:number,k:number):number[][]=>k===0?[[]]:
  Array.from({length:n},(_,i)=>choose(n-i-1,k-1)
    .map(rest=>[i,...rest.map(j=>j+i+1)])).flat();
function rankByMinors(A:Matrix):number{
  for(let k=Math.min(A.length,A[0].length);k>=1;k--)
    for(const rows of choose(A.length,k))
      for(const cols of choose(A[0].length,k))
        if(laplace(rows.map(i=>cols.map(j=>A[i][j]))).numerator!==0n)return k;
  return 0;
}
describe("M14 catalog: both exact original-source rectangular shapes",()=>{
  const keys = new Set<string>();
  for(const family of fourNarrowRankStageFamilies)
    for(const level of family.supportedDifficulties)
      it(family.id+"/"+level+": 24 source-form cases, independent oracle, PL/EN and grading",()=>{
        const pool=taskPool("matrices",level).filter(t=>t.templateId===family.id);
        expect(pool).toHaveLength(24);
        expect(new Set(pool.map(t=>t.id)).size).toBe(24);
        const cols=family.id.endsWith("two")?2:3;
        const seenRanks=new Set<number>();
        for(let variant=0;variant<24;variant++){
          const task=makeUniversityTask(family.id,variant,level);
          expect(task.id).toBe(pool[variant].id);
          expect(task.contentKey).toBe(pool[variant].contentKey);
          keys.add(task.contentKey);
          const p=task.university;
          if(p.kind!=="linear-rank")throw Error("M14 expects linear-rank");
          expect(p.matrix).toHaveLength(4);
          expect(p.matrix.every(row=>row.length===cols)).toBe(true);
          const rank=rankByMinors(p.matrix);
          seenRanks.add(rank);
          for(const locale of ["pl","en"] as const){
            const view=localizeUniversity(task,locale);
            expect(view.id).toBe(task.id);
            expect(view.contentKey).toBe(task.contentKey);
            expect(view.title).toBe(family.titles[locale]);
            expect(view.question.length).toBeGreaterThan(18);
            expect(view.solution?.length).toBeGreaterThanOrEqual(3);
            expect(view.solution?.at(-1)?.kind).toBe("answer");
            expect(view.solution?.some(s=>s.action.includes("RREF(A)"))).toBe(true);
            expect(view.hint.length).toBeGreaterThan(20);
            expect(view.nextHint.length).toBeGreaterThan(20);
            expect(view.answer.kind).toBe("scalar");
            if(view.answer.kind!=="scalar")throw Error("Rank answer must be scalar");
            expect(eq(view.answer.value,r(rank))).toBe(true);
            expect(assessAnswer(view.answer,String(rank)).kind).toBe("correct");
            expect(assessAnswer(view.answer,String((rank+1)%(cols+1))).kind).toBe("incorrect");
            expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
            expect(assessAnswer(view.answer,"1/0").kind).toBe("invalid");
            expect(view.explanation).not.toMatch(/undefined|NaN/);
            if(locale==="en")expect(view.question).not.toMatch(/[ąćęłńóśźż]/i);
          }
        }
        expect([...seenRanks].length).toBeGreaterThanOrEqual(2);
      },45000);
  it("adds exactly 144 unique student-facing identifiers (without touching legacy families)",()=>{
    expect(keys.size).toBe(144);
  });
});