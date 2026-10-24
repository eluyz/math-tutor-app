import {describe,it,expect} from "vitest";
import { cramerDiagnosticFamilies } from "./cramerDiagnostics";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {laplace,eq,a,m,d,q} from "./audit";
import {formatRational as f,assessAnswer} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";
import type {Rational} from "../rational";
import type {LinearAlgebraProblem} from "./schema";

const choose=(n:number,k:number):number[][]=>
 k===0?[[]]:Array.from({length:n},(_,i)=>
   choose(n-i-1,k-1).map(rest=>[i,...rest.map(j=>j+i+1)])).flat();
const rankIndependent=(mat:readonly (readonly Rational[])[]):number=>{
 const rows=mat.length,cols=mat[0].length;
 for(let size=Math.min(rows,cols);size>=1;size--)
   for(const rs of choose(rows,size))
     for(const cs of choose(cols,size))
       if(laplace(rs.map(i=>cs.map(j=>mat[i][j]))).numerator!==0n)return size;
 return 0;
};
describe("MT-EDU-019 P0B: independent Cramer decision and determinant audit",()=>{
 it.each(cramerDiagnosticFamilies)("$id: all 72 variants, rank and Cramer minors",family=>{
  const across=new Set<string>();
  for(const level of family.supportedDifficulties){
   const questions=new Set<string>(),modeCounts={"system-one":0,"system-none":0,"system-many":0};
   for(let variant=0;variant<24;variant++){
    const task=makeUniversityTask(family.id,variant,level);
    const p=task.university as Extract<LinearAlgebraProblem,{kind:"linear-cramer-diagnostic"}>;
    const n=p.matrix.length;
    expect(p.matrix.every(row=>row.length===n)).toBe(true);
    expect(p.rhs.length).toBe(n);
    expect(n).toBe(family.id==="cramer-four-singular-minors"?4:level==="easy"?2:level==="medium"?3:4);
    const determinant=laplace(p.matrix);
    const Ds=Array.from({length:n},(_,j)=>laplace(p.matrix.map((row,i)=>row.map((c,k)=>k===j?p.rhs[i]:c))));
    const ra=rankIndependent(p.matrix),rb=rankIndependent(p.matrix.map((row,i)=>[...row,p.rhs[i]]));
    const classification=ra<rb?"system-none":ra===n?"system-one":"system-many";
    modeCounts[classification]++;
    expect((determinant.numerator!==0n)).toBe(classification==="system-one");
    if(classification==="system-many")expect(Ds.every(x=>x.numerator===0n)).toBe(true);
    if(classification==="system-none")expect(Ds.some(x=>x.numerator!==0n)).toBe(true);
    if(classification==="system-one"){
      const solution=Ds.map(x=>d(x,determinant));
      for(let i=0;i<n;i++)
        expect(eq(p.matrix[i].map((c,j)=>m(c,solution[j])).reduce(a,q(0)),p.rhs[i])).toBe(true);
    }
    const spec=task.answer;
    if(family.id==="cramer-applicability"){
      expect(spec.kind).toBe("choice");
      if(spec.kind!=="choice")throw Error("Choice expected");
      expect(spec.value).toBe(classification);
      expect(assessAnswer(spec,{kind:"choice",value:classification}).kind).toBe("correct");
      expect(assessAnswer(spec,{kind:"choice",value:classification==="system-one"?"system-none":"system-one"}).kind).toBe("incorrect");
      expect(assessAnswer(spec,{kind:"choice",value:""}).kind).toBe("invalid");
    }else{
      expect(spec.kind).toBe("list");
      if(spec.kind!=="list")throw Error("List expected");
      expect(spec.labels).toEqual(["D","D1","D2","D3","D4"]);
      const expected=[determinant,...Ds];
      expected.forEach((z,i)=>expect(eq(z,spec.values[i])).toBe(true));
      const entries=spec.values.map(f);
      expect(assessAnswer(spec,{kind:"list",values:entries}).kind).toBe("correct");
      expect(assessAnswer(spec,{kind:"list",values:entries.map((x,i)=>i?x:"999999")}).kind).toBe("incorrect");
      expect(assessAnswer(spec,{kind:"list",values:entries.map((x,i)=>i?x:"1/0")}).kind).toBe("invalid");
    }
    const en=localizeUniversity(task,"en");
    if(task.answer.kind==="choice" && en.answer.kind==="choice"){
      expect(en.answer.value).toBe(task.answer.value);
      expect(en.answer.options.map(x=>x.value)).toEqual(task.answer.options.map(x=>x.value));
    }else expect(en.answer).toEqual(task.answer);
    expect(en.contentKey).toBe(task.contentKey);
    expect(en.solution?.length).toBeGreaterThanOrEqual(4);
    expect(task.solution?.length).toBe(en.solution?.length);
    expect(polishLearningText.test(en.question)).toBe(false);
    expect(en.solution?.every(step=>!polishLearningText.test(step.reason))).toBe(true);
    questions.add(task.contentKey);across.add(task.contentKey);
   }
   expect(questions.size).toBe(24);
   expect(modeCounts).toEqual({"system-one":8,"system-none":8,"system-many":8});
  }
  expect(across.size).toBe(72);
 });
});
