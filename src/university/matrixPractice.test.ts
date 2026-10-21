import { describe, expect, it } from "vitest";
import { rational as r, addRational as add, subtractRational as sub,
  multiplyRational as mul, equalRational as eq, type Rational } from "../rational";
import { assessAnswer, formatRational as f } from "../answers";
import { getAnswerSpec } from "../exercises";
import { taskPool } from "../generators";
import { isUniversityTask, localizeUniversity, makeUniversityTask } from "./catalog";
import { matrixPracticeFamilies, makeMatrixPractice, presentMatrixPractice,
  type Practice } from "./matrixPractice";

type M = readonly (readonly Rational[])[];
const same=(a:M,b:M)=>a.length===b.length &&
  a.every((row,i)=>row.length===b[i].length && row.every((v,j)=>eq(v,b[i][j])));
const plus=(a:M,b:M)=>a.map((row,i)=>row.map((v,j)=>add(v,b[i][j])));
const minus=(a:M,b:M)=>a.map((row,i)=>row.map((v,j)=>sub(v,b[i][j])));
const product=(a:M,b:M)=>a.map(row=>b[0].map((_,j)=>
  row.map((v,k)=>mul(v,b[k][j])).reduce(add,r(0))));
const trans=(a:M)=>a[0].map((_,j)=>a.map(row=>row[j]));
const scaled=(a:M,k:Rational)=>a.map(row=>row.map(v=>mul(v,k)));

function expected(p:Practice): M|string {
  const by=(label:string):M=>{
    const item=p.matrices.find(m=>m.label===label);
    if(!item)throw Error("Missing matrix");
    return item.values;
  };
  const A=by("A");
  if(p.mode==="power")
    return p.expression==="A²"?product(A,A):product(product(A,A),A);
  const B=by("B");
  if(p.mode==="composite"){
    const C=by("C");
    switch(p.expression){
      case "AB−C":return minus(product(A,B),C);
      case "(A+B)C":return product(plus(A,B),C);
      case "A(B−C)":return product(A,minus(B,C));
      case "(AB)ᵀ−C":return minus(trans(product(A,B)),C);
      case "(AB)ᵀ−(3/2)C":return minus(trans(product(A,B)),scaled(C,r(3,2)));
    }
    throw Error("Bad composite");
  }
  type Shape={r:number;c:number};
  const s=(m:M):Shape=>({r:m.length,c:m[0].length});
  const addShape=(a:Shape|null,b:Shape|null):Shape|null=>
    a&&b&&a.r===b.r&&a.c===b.c ?a:null;
  const mulShape=(a:Shape|null,b:Shape|null):Shape|null=>
    a&&b&&a.c===b.r?{r:a.r,c:b.c}:null;
  const a=s(A),b=s(B),c=p.matrices.length>2?s(by("C")):null;
  let result:Shape|null=null;
  switch(p.expression){
    case "A+B":result=addShape(a,b);break;
    case "AB":result=mulShape(a,b);break;
    case "BA":result=mulShape(b,a);break;
    case "AB+C":result=addShape(mulShape(a,b),c);break;
    case "A(B+C)":result=mulShape(a,addShape(b,c));break;
    case "A(BC)":result=mulShape(a,mulShape(b,c));break;
    default:throw Error("Unexpected dimension expression");
  }
  return result?`${result.r}x${result.c}`:"not-possible";
}
describe("MT-EDU-010 mathematical and presentation audit",()=>{
  const levels=["easy","medium","hard","advanced","expert"] as const;
  const newIds=new Set(matrixPracticeFamilies.map(f=>f.id));
  it("adds 4 targeted families with 384 independently tested examples",()=>{
    expect(matrixPracticeFamilies).toHaveLength(4);
    expect(matrixPracticeFamilies.reduce((n,f)=>n+f.supportedDifficulties.length,0)).toBe(16);
    const all=levels.flatMap(level=>taskPool("matrices",level)).filter(t=>newIds.has(t.templateId));
    expect(all).toHaveLength(384);
    expect(new Set(all.map(t=>t.id)).size).toBe(all.length);
    expect(new Set(all.map(t=>t.contentKey)).size).toBe(all.length);
  });
  for(const family of matrixPracticeFamilies)
    for(const difficulty of family.supportedDifficulties)
      it(`${family.id}/${difficulty}: 24 variants PL/EN, independent answers and grading`,()=>{
        const tasks=taskPool("matrices",difficulty).filter(t=>t.templateId===family.id);
        expect(tasks).toHaveLength(24);
        let valid=0,invalid=0;
        const expressions=new Set<string>();
        for(let variant=0;variant<24;variant++){
          const task=makeUniversityTask(family.id,variant,difficulty);
          expect(task.id).toBe(tasks[variant].id);
          expect(isUniversityTask(task)).toBe(true);
          if(task.university.kind!=="linear-matrix-practice")throw Error("Wrong task kind");
          const p=task.university,actual=expected(p);
          expressions.add(p.expression);
          expect(task.matrices).toBeUndefined();
          expect(p.matrices.every(m=>m.values.length<=3&&m.values[0].length<=3)).toBe(true);
          for(const locale of ["pl","en"] as const){
            const view=localizeUniversity(task,locale);
            expect(view.id).toBe(task.id);
            expect(view.contentKey).toBe(task.contentKey);
            expect(view.title).toBe(family.titles[locale]);
            expect(view.question.length).toBeGreaterThan(20);
            expect(view.solution?.length).toBeGreaterThanOrEqual(3);
            expect(view.solution?.at(-1)?.kind).toBe("answer");
            const answer=getAnswerSpec(view);
            if(typeof actual==="string"){
              expect(answer.kind).toBe("choice");
              if(answer.kind!=="choice")throw Error("Not a choice");
              expect(answer.value).toBe(actual);
              if(actual==="not-possible")invalid++;else valid++;
              expect(assessAnswer(answer,{kind:"choice",value:actual}).kind).toBe("correct");
              expect(assessAnswer(answer,{kind:"choice",value:actual==="not-possible"?"2x2":"not-possible"}).kind).toBe("incorrect");
              expect(assessAnswer(answer,{kind:"choice",value:"wrong"}).kind).toBe("invalid");
              expect(answer.options.map(o=>o.value)).toContain(actual);
            }else{
              expect(answer.kind).toBe("matrix");
              if(answer.kind!=="matrix")throw Error("Not a matrix");
              expect(same(answer.values,actual)).toBe(true);
              const raw=actual.map(row=>row.map(f));
              expect(assessAnswer(answer,{kind:"matrix",values:raw}).kind).toBe("correct");
              const bad=raw.map(row=>[...row]);
              bad[0][0]=f(add(actual[0][0],r(1)));
              expect(assessAnswer(answer,{kind:"matrix",values:bad}).kind).toBe("incorrect");
              bad[0][0]="1/0";
              expect(assessAnswer(answer,{kind:"matrix",values:bad}).kind).toBe("invalid");
            }
          }
        }
        expect(expressions.size).toBeGreaterThanOrEqual(family.id==="matrix-powers" && (difficulty==="medium"||difficulty==="advanced")?1:2);
        if(family.id==="matrix-compatibility"||family.id==="matrix-chained-dimensions"){
          expect(valid).toBeGreaterThan(0);
          expect(invalid).toBeGreaterThan(0);
        }
      });
  it("manual square and cube calculation protects against elementwise powers",()=>{
    const A=[[r(1),r(2)],[r(3),r(4)]];
    expect(product(A,A).map(row=>row.map(f))).toEqual([["7","10"],["15","22"]]);
    expect(product(product(A,A),A).map(row=>row.map(f))).toEqual([["37","54"],["81","118"]]);
  });
  it("rejects unsupported variant and nonsquare powers",()=>{
    expect(()=>makeMatrixPractice("power",24,"hard")).toThrow();
    expect(()=>makeMatrixPractice("power",-1,"hard")).toThrow();
    const p=makeMatrixPractice("power",3,"hard");
    expect(()=>presentMatrixPractice({...p,matrices:[{label:"A",values:[[r(1),r(2),r(3)],[r(4),r(5),r(6)]]}]},"pl")).toThrow();
  });
});
