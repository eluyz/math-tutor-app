import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import { difficulties } from "../difficulty";
import { a, d, eq, laplace, m, q } from "./audit";
import { allTemplates, taskPool } from "../generators";
import { localizeUniversity, makeUniversityTask } from "./catalog";
import { classifyTallFiveThree, makeTallFiveThree } from "./tallFiveThree";
import type { Rational } from "../rational";

const choose=(n:number,k:number):number[][]=>k===0?[[]]:Array.from({length:n},(_,i)=>
  choose(n-i-1,k-1).map(other=>[i,...other.map(j=>j+i+1)])).flat();
const rank=(mat:readonly (readonly Rational[])[])=>{
  for(let size=Math.min(mat.length,mat[0].length);size>=1;size--)
    for(const rows of choose(mat.length,size))for(const cols of choose(mat[0].length,size))
      if(laplace(rows.map(i=>cols.map(j=>mat[i][j]))).numerator!==0n)return size;
  return 0;
};

describe("U06 five equations and three unknowns, independent exact-source-shape QA",()=>{
  it("registers one family with 72 stable exercises",()=>{
    const family=allTemplates.filter(item=>item.id==="system-rectangular-5x3-classification");
    expect(family).toHaveLength(1);
    expect(family[0].supportedDifficulties).toEqual(["hard","advanced","expert"]);
    for(const level of ["hard","advanced","expert"] as const){
      const tasks=taskPool("systems",level).filter(t=>t.templateId===family[0].id);
      expect(tasks).toHaveLength(24);
      expect(new Set(tasks.map(t=>t.id)).size).toBe(24);
      expect(new Set(tasks.map(t=>t.contentKey)).size).toBe(24);
    }
  });
  it("independent rank oracle agrees in all 72; all 3 classes, PL/EN and answer grading",()=>{
    const allKinds=new Set<string>();
    for(const level of ["hard","advanced","expert"] as const)
      for(let variant=0;variant<24;variant++){
        const task=makeUniversityTask("system-rectangular-5x3-classification",variant,level);
        const p=task.university;
        if(p.kind!=="linear-rectangular")throw Error("Wrong U06 kind");
        expect(p.matrix.length).toBe(5);
        expect(p.matrix.every(row=>row.length===3)).toBe(true);
        const ra=rank(p.matrix),rb=rank(p.matrix.map((row,i)=>[...row,p.rhs[i]]));
        const expected=ra!==rb?"system-none":ra===3?"system-one":"system-many";
        allKinds.add(expected);
        const result=classifyTallFiveThree(p);
        expect(result.rankA).toBe(ra);
        expect(result.rankAugmented).toBe(rb);
        expect(result.kind).toBe(expected);
        expect(result.reduction.matrix).toHaveLength(5);
        if(expected==="system-one"){
          const indices=choose(5,3).find(indices=>laplace(indices.map(i=>p.matrix[i])).numerator!==0n);
          expect(indices).toBeDefined();
          const A=indices!.map(i=>p.matrix[i]),b=indices!.map(i=>p.rhs[i]);
          const det=laplace(A);
          const x=Array.from({length:3},(_,j)=>d(laplace(A.map((row,i)=>row.map((value,k)=>k===j?b[i]:value))),det));
          for(let row=0;row<5;row++)expect(eq(p.matrix[row].map((v,j)=>m(v,x[j])).reduce(a,q(0)),p.rhs[row])).toBe(true);
          result.values.forEach((v,j)=>expect(eq(v,x[j])).toBe(true));
        }
        for(const locale of ["pl","en"] as const){
          const screen=localizeUniversity(task,locale);
          expect(screen.question).toContain("rank(A)");
          expect(screen.question).toContain("rank([A|b])");
          expect(screen.solution!.length).toBeGreaterThan(3);
          expect(screen.hint).not.toBe("");
          expect(screen.nextHint).not.toBe("");
          expect(screen.answer.kind).toBe("choice");
          expect(assessAnswer(screen.answer,{kind:"choice",value:expected}).kind).toBe("correct");
          expect(assessAnswer(screen.answer,{kind:"choice",value:expected==="system-none"?"system-one":"system-none"}).kind).toBe("incorrect");
          expect(assessAnswer(screen.answer,emptyAnswer(screen.answer)).kind).toBe("invalid");
          if(expected==="system-many")expect(screen.explanation).toContain("rank(A)");
        }
      }
    expect(allKinds).toEqual(new Set(["system-one","system-none","system-many"]));
  },30_000);
});
