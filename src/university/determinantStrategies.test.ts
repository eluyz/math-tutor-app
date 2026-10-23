import {describe,it,expect} from "vitest";
import {determinantStrategyFamilies} from "./determinantStrategies";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {laplace,eq,q} from "./audit";
import {formatRational as f,assessAnswer} from "../answers";
import {rational as r,addRational as add} from "../rational";
import {applyDeterminantRowOperation} from "./determinants";
import type {DeterminantProblem,SquareDeterminantMatrix as Square} from "./schema";

describe("MT-EDU-019 P0A: independent 4×4/5×5 reduction audit",()=>{
 it.each(determinantStrategyFamilies)("$id generates 72 exact and distinct exercises",family=>{
  const acrossLevels=new Set<string>();
  for(const level of family.supportedDifficulties){
   const matrices=new Set<string>();
   for(let variant=0;variant<24;variant++){
    const task=makeUniversityTask(family.id,variant,level);
    const p=task.university as DeterminantProblem;
    const n=family.id==="determinant-strategy-four"?4:5;
    expect(p.matrix).toHaveLength(n);
    for(const row of p.matrix)expect(row).toHaveLength(n);
    expect(p.reductions).toHaveLength(level==="easy"?1:level==="medium"?2:4);
    if(level==="hard")expect(p.reductions?.some(op=>op.kind==="swap")).toBe(true);
    const actual=laplace(p.matrix);
    expect(task.answer.kind).toBe("scalar");
    if(task.answer.kind!=="scalar")throw Error("Expected scalar determinant");
    expect(eq(actual,task.answer.value)).toBe(true);
    // Independently apply reductions and confirm upper triangular form and determinant multiplier.
    const reduced=p.reductions!.reduce<Square>((matrix,op)=>applyDeterminantRowOperation(matrix,op),p.matrix);
    for(let i=0;i<n;i++)for(let j=0;j<i;j++)expect(reduced[i][j].numerator).toBe(0n);
    const expected=reduced.map((row,i)=>row[i]).reduce((a,b)=>q(a.numerator*b.numerator,a.denominator*b.denominator),q(1));
    expect(eq(actual,level==="hard"?q(-expected.numerator,expected.denominator):expected)).toBe(true);
    expect(assessAnswer(task.answer,f(task.answer.value)).kind).toBe("correct");
    expect(assessAnswer(task.answer,f(add(task.answer.value,r(1)))).kind).toBe("incorrect");
    expect(assessAnswer(task.answer,"1/0").kind).toBe("invalid");
    const en=localizeUniversity(task,"en");
    expect(en.answer).toEqual(task.answer);
    expect(en.contentKey).toBe(task.contentKey);
    expect(en.solution?.length).toBeGreaterThanOrEqual(4);
    expect(en.question).not.toMatch(/[ąćęłńóśźż]/i);
    matrices.add(JSON.stringify(p.matrix,(_,v)=>typeof v==="bigint"?v.toString():v));
    acrossLevels.add(task.contentKey);
   }
   expect(matrices.size).toBe(24);
  }
  expect(acrossLevels.size).toBe(72);
 });
});
