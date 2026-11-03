import { describe, expect, it } from "vitest";
import { makeUniversityTask, localizeUniversity } from "../university/catalog";
import { educationTemplates } from "../education/catalog";
import { makeEducationInstance } from "../education/types";
import { localizeTask } from "../locales/catalog";
import { q, a as plus, s as minus, m as times, d as divide, eq } from "../university/audit";
import { assessAnswer, emptyAnswer, formatRational as fmt } from "../answers";
import type { Rational } from "../rational";

/**
 * #151 Batch A — source-FORM regression witnesses, not full SOURCE_PASS.
 * Source references: private P03/1a,1b; P09/1c,1h; P12/1a–h,3a–d.
 * No original private PDF coefficients or answer keys are copied here.
 * Each pinned synthetic variant is verified using independent arithmetic.
 * Chromium and exact-original-source grading remain separate evidence gates.
 */
type M = readonly (readonly Rational[])[];
const same = (A:M,B:M) =>
  A.length===B.length && A.every((row,i)=>row.length===B[i].length &&
    row.every((x,j)=>eq(x,B[i][j])));
const trans = (A:M):Rational[][] => A[0].map((_,j)=>A.map(row=>row[j]));
const scaled = (A:M,k:Rational):Rational[][] =>
  A.map(row=>row.map(x=>times(x,k)));
const subMatrix = (A:M,B:M):Rational[][] =>
  A.map((row,i)=>row.map((x,j)=>minus(x,B[i][j])));
const addMatrix = (A:M,B:M):Rational[][] =>
  A.map((row,i)=>row.map((x,j)=>plus(x,B[i][j])));
const numeric = (A:M):string[][] => A.map(row=>row.map(fmt));
const changed = (A:string[][]):string[][] =>
  A.map((row,i)=>row.map((v,j)=>i===0&&j===0?"999999":v));
function rankOf(input:M):number {
  const rows=input.map(row=>[...row]);
  if(!rows.length)return 0;
  const cols=rows[0].length;
  let pivot=0;
  for(let j=0;j<cols && pivot<rows.length;j++){
    const found=rows.findIndex((row,i)=>i>=pivot && row[j].numerator!==0n);
    if(found<0)continue;
    [rows[pivot],rows[found]]=[rows[found],rows[pivot]];
    const divisor=rows[pivot][j];
    rows[pivot]=rows[pivot].map(v=>divide(v,divisor));
    for(let i=0;i<rows.length;i++)if(i!==pivot){
      const factor=rows[i][j];
      rows[i]=rows[i].map((v,k)=>minus(v,times(factor,rows[pivot][k])));
    }
    pivot++;
  }
  return pivot;
}
function determinant(input:M):Rational {
  const rows=input.map(row=>[...row]), n=rows.length;
  let sign=q(1);
  for(let j=0;j<n;j++){
    const found=rows.findIndex((row,i)=>i>=j&&row[j].numerator!==0n);
    if(found<0)return q(0);
    if(found!==j){
      [rows[j],rows[found]]=[rows[found],rows[j]];
      sign=times(sign,q(-1));
    }
    for(let i=j+1;i<n;i++){
      const multiplier=divide(rows[i][j],rows[j][j]);
      for(let k=j;k<n;k++)
        rows[i][k]=minus(rows[i][k],times(multiplier,rows[j][k]));
    }
  }
  return rows.reduce((product,row,i)=>times(product,row[i]),sign);
}
function checkLesson(task:ReturnType<typeof makeUniversityTask>) {
  for(const locale of ["pl","en"] as const){
    const localized=localizeUniversity(task,locale);
    expect(localized.hint.length).toBeGreaterThan(12);
    expect(localized.nextHint.length).toBeGreaterThan(12);
    expect(localized.solution?.length).toBeGreaterThan(2);
    for(const step of localized.solution||[]){
      expect(step.action.trim().length).toBeGreaterThan(0);
      expect(step.reason.trim().length).toBeGreaterThan(15);
    }
  }
}
function matrixCase(variant:number,expr:"3A−B"|"A+Aᵀ",shape:number[]){
  const task=makeUniversityTask("matrix-worksheet-composites",variant,"medium");
  const p=task.university;
  if(p.kind!=="linear-matrix-practice")throw Error("unexpected matrix kind");
  expect(task.id).toBe("matrix-worksheet-composites:medium:"+variant);
  expect(p.expression).toBe(expr);
  expect(p.matrices.map(m=>[m.values.length,m.values[0].length]).flat()).toEqual(shape);
  const A=p.matrices[0].values;
  const result=expr==="3A−B"?subMatrix(scaled(A,q(3)),p.matrices[1].values):addMatrix(A,trans(A));
  if(expr==="A+Aᵀ")expect(same(result,trans(result))).toBe(true);
  checkLesson(task);
  for(const locale of ["pl","en"] as const){
    const view=localizeUniversity(task,locale),spec=view.answer;
    if(spec.kind!=="matrix")throw Error("matrix answer missing");
    expect(same(spec.values,result)).toBe(true);
    expect(assessAnswer(spec,{kind:"matrix",values:numeric(result)}).kind).toBe("correct");
    expect(assessAnswer(spec,{kind:"matrix",values:changed(numeric(result))}).kind).toBe("incorrect");
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
  }
}
describe("#151 Batch A — pinned mathematical source-form witnesses",()=>{
  it("M01 P03: 2×3 three-times-A minus B (synthetic medium/0)",()=>{
    matrixCase(0,"3A−B",[2,3,2,3]);
  });
  it("M02 P03: 3×3 matrix plus transpose (synthetic medium/1)",()=>{
    matrixCase(1,"A+Aᵀ",[3,3]);
  });
  it("M07 P09: independent signed Sarrus 3×3 (synthetic easy/1)",()=>{
    const family=educationTemplates.find(x=>x.id==="determinant-sarrus");
    if(!family)throw Error("Missing Sarrus");
    const task=makeEducationInstance(family,1,"easy");
    expect(task.id).toBe("determinant-sarrus:easy:1");
    const mat=task.matrices?.[0].values;
    if(!mat)throw Error("Missing 3×3 source-form matrix");
    expect(mat.length).toBe(3);
    const term=(i:number,j:number,k:number)=>times(times(mat[0][i],mat[1][j]),mat[2][k]);
    const forward=plus(plus(term(0,1,2),term(1,2,0)),term(2,0,1));
    const backward=plus(plus(term(2,1,0),term(0,2,1)),term(1,0,2));
    const result=minus(forward,backward);
    for(const locale of ["pl","en"] as const){
      const view=localizeTask(task,locale);
      if(view.answer.kind!=="scalar")throw Error("Expected scalar");
      expect(eq(view.answer.value,result)).toBe(true);
      expect(view.hint.length).toBeGreaterThan(12);
      expect(view.nextHint.length).toBeGreaterThan(12);
      expect(view.explanation.length).toBeGreaterThan(60);
      expect(assessAnswer(view.answer,fmt(result)).kind).toBe("correct");
      expect(assessAnswer(view.answer,fmt(plus(result,q(1)))).kind).toBe("incorrect");
      expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
    }
  });
  it("M08 P09: 4×4 determinant correct, but source sparse-column layout not witnessed",()=>{
    const task=makeUniversityTask("determinant-laplace-four",0,"hard");
    const p=task.university;
    if(p.kind!=="determinant")throw Error("Expected determinant");
    expect(task.id).toBe("determinant-laplace-four:hard:0");
    expect(p.matrix.length).toBe(4);
    expect(p.matrix[0].filter(x=>x.numerator!==0n).length).toBe(1);
    // Negative witness: original P09/1h expands along a sparse 3rd column;
    // current generated variant instead has a sparse first ROW.
    expect(p.matrix.filter(row=>row[2].numerator!==0n).length).toBeGreaterThan(1);
    const result=determinant(p.matrix);
    checkLesson(task);
    for(const locale of ["pl","en"] as const){
      const view=localizeUniversity(task,locale),spec=view.answer;
      if(spec.kind!=="scalar")throw Error("Expected determinant scalar");
      expect(eq(spec.value,result)).toBe(true);
      expect(assessAnswer(spec,fmt(result)).kind).toBe("correct");
      expect(assessAnswer(spec,fmt(plus(result,q(1)))).kind).toBe("incorrect");
      expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    }
  });
  it("U02 P12: 3×3 Cramer solution and singular applicability branches",()=>{
    const solve=makeUniversityTask("system-cramer-three",0,"hard");
    const p=solve.university;
    if(p.kind!=="system")throw Error("Expected system");
    expect(solve.id).toBe("system-cramer-three:hard:0");
    const D=determinant(p.coefficients);
    expect(D.numerator).not.toBe(0n);
    const values=p.coefficients.map((_,j)=>divide(
      determinant(p.coefficients.map((row,i)=>row.map((cell,k)=>j===k?p.rhs[i]:cell))),D));
    for(let i=0;i<3;i++)
      expect(eq(p.coefficients[i].reduce((sum,x,j)=>plus(sum,times(x,values[j])),q(0)),p.rhs[i])).toBe(true);
    checkLesson(solve);
    for(const locale of ["pl","en"] as const){
      const view=localizeUniversity(solve,locale),spec=view.answer;
      if(spec.kind!=="list")throw Error("Expected Cramer values");
      expect(spec.values.every((x,i)=>eq(x,values[i]))).toBe(true);
      expect(assessAnswer(spec,{kind:"list",values:values.map(fmt)}).kind).toBe("correct");
      expect(assessAnswer(spec,{kind:"list",values:values.map((x,i)=>i===0?"999999":fmt(x))}).kind).toBe("incorrect");
      expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    }
    for(const [v,kind] of [[0,"system-one"],[1,"system-many"],[2,"system-none"]] as const){
      const task=makeUniversityTask("cramer-applicability",v,"medium");
      const example=task.university;
      if(example.kind!=="linear-cramer-diagnostic")throw Error("Expected eligibility diagnostic");
      const ra=rankOf(example.matrix);
      const augmented=example.matrix.map((row,i)=>[...row,example.rhs[i]]);
      const rab=rankOf(augmented),det=determinant(example.matrix);
      expect(ra<rab?"system-none":ra===3?"system-one":"system-many").toBe(kind);
      expect(det.numerator!==0n).toBe(kind==="system-one");
      for(const locale of ["pl","en"] as const){
        const view=localizeUniversity(task,locale),spec=view.answer;
        if(spec.kind!=="choice")throw Error("Expected eligibility choice");
        expect(spec.value).toBe(kind);
        expect(assessAnswer(spec,{kind:"choice",value:kind}).kind).toBe("correct");
        expect(assessAnswer(spec,{kind:"choice",value:kind==="system-one"?"system-none":"system-one"}).kind).toBe("incorrect");
        expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
      }
    }
    // Source requests applicability followed by solving in one exercise;
    // here those are two separate families, so no source-integrated PASS.
  });
  it("U05 P12: four rank cases, solution class AND parameter count",()=>{
    const expected=[
      [3,2,3,"system-none","not-applicable"],
      [4,3,3,"system-many","1"],
      [4,4,4,"system-one","0"],
      [4,2,2,"system-many","2"],
    ] as const;
    for(let v=0;v<expected.length;v++){
      const task=makeUniversityTask("capelli-free-parameters",v,"easy"),p=task.university;
      if(p.kind!=="linear-rank-given")throw Error("Expected given ranks");
      const [n,ra,rab,kind,count]=expected[v];
      expect(task.id).toBe("capelli-free-parameters:easy:"+v);
      expect([p.variables,p.rankA,p.rankAugmented]).toEqual([n,ra,rab]);
      const independent=ra<rab?"system-none":ra===n?"system-one":"system-many";
      const k=independent==="system-none"?"not-applicable":String(n-ra);
      expect([independent,k]).toEqual([kind,count]);
      checkLesson(task);
      for(const locale of ["pl","en"] as const){
        const view=localizeUniversity(task,locale),spec=view.answer;
        if(spec.kind!=="multi-choice")throw Error("Expected both fields");
        expect(Object.fromEntries(spec.fields.map(x=>[x.id,x.value])))
          .toEqual({classification:kind,parameters:count});
        const input={kind:"multi-choice" as const,values:{classification:kind,parameters:count}};
        expect(assessAnswer(spec,input).kind).toBe("correct");
        expect(assessAnswer(spec,{kind:"multi-choice",values:{...input.values,parameters:count==="1"?"2":"1"}}).kind).toBe("incorrect");
        expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
      }
    }
  });
});
