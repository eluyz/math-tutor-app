import {describe,expect,it} from "vitest";
import {assessAnswer,emptyAnswer} from "../answers";
import {taskPool} from "../generators";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {makeGraphAsymptoteRange,asymptotes,middleValue,asymptoticRange,outerHeight,
 type GraphAsymptoteRangeProblem} from "./graphAsymptoteRange";

const fmt=(x:number)=>String(x).replace("-","−");
/** Independent exact algebraic oracle. For t=x-m, denom=t²-h²<0. */
function independentRange(p:GraphAsymptoteRangeProblem):string{
 if(p.mode==="cross")return "ℝ"; // IVT: one pole +infty and the other -infty
 const extreme=p.shift+(p.mode==="lower"?-p.scale:p.scale);
 return p.mode==="lower"?"(−∞; "+fmt(extreme)+"]":"["+fmt(extreme)+"; +∞)";
}
describe("F05 P0F range with two vertical poles",()=>{
 it("algebraic edge cases: poles excluded; opposite vs same infinity",()=>{
  const middle={kind:"function-asymptote-range",center:0,radius:2,shift:0,scale:1,sign:1} as const;
  expect(asymptoticRange({...middle,mode:"cross"})).toBe("ℝ");
  expect(asymptoticRange({...middle,mode:"lower"})).toBe("(−∞; −1]");
  expect(asymptoticRange({...middle,mode:"upper"})).toBe("[1; +∞)");
  expect(middleValue({...middle,mode:"lower"},0)).toBe(-1);
  expect(middleValue({...middle,mode:"upper"},0)).toBe(1);
  expect(()=>middleValue({...middle,mode:"cross"},2)).toThrow();
  expect(()=>middleValue({...middle,mode:"cross"},-2)).toThrow();
  expect(()=>asymptoticRange({...middle,mode:"cross",radius:0})).toThrow();
  for(const v of [-1,24,1.5,NaN,Infinity])expect(()=>makeGraphAsymptoteRange(v,"hard")).toThrow();
  expect(()=>makeGraphAsymptoteRange(0,"easy")).toThrow();
 });
 it("checks 72 distinct geometries, full branch range, PL/EN and all grading modes",()=>{
  const signatures=new Set<string>();const counts={cross:0,lower:0,upper:0};
  for(const difficulty of ["hard","advanced","expert"] as const){
   const pool=taskPool("functions",difficulty).filter(t=>t.templateId==="function-asymptote-range");
   expect(pool).toHaveLength(24);expect(new Set(pool.map(t=>t.contentKey)).size).toBe(24);
   for(let variant=0;variant<24;variant++){
    const task=makeUniversityTask("function-asymptote-range",variant,difficulty);
    if(task.university.kind!=="function-asymptote-range")throw Error("Unexpected task");
    const p=task.university,[a,b]=asymptotes(p);
    signatures.add(task.contentKey);counts[p.mode]++;
    expect(a).toBeLessThan(p.center);expect(p.center).toBeLessThan(b);
    expect((a+b)/2).toBe(p.center);
    expect(middleValue(p,p.center)).toBe(outerHeight(p));
    expect(asymptoticRange(p)).toBe(independentRange(p));
    const small=p.radius/10000;
    const lhs=middleValue(p,a+small),rhs=middleValue(p,b-small);
    expect(Math.abs(lhs)).toBeGreaterThan(100);
    expect(Math.abs(rhs)).toBeGreaterThan(100);
    if(p.mode==="cross")expect(Math.sign(lhs)).toBe(-Math.sign(rhs));
    else expect(Math.sign(lhs)).toBe(Math.sign(rhs));
    for(let i=1;i<100;i++){
      const t=-p.radius+2*p.radius*i/100;
      const value=middleValue(p,p.center+t);
      expect(Number.isFinite(value)).toBe(true);
      if(p.mode==="lower")expect(value).toBeLessThanOrEqual(p.shift-p.scale+1e-8);
      if(p.mode==="upper")expect(value).toBeGreaterThanOrEqual(p.shift+p.scale-1e-8);
    }
    for(const locale of ["pl","en"] as const){
     const v=localizeUniversity(task,locale),ans=v.answer;
     if(ans.kind!=="choice")throw Error("Not choice");
     expect(ans.options).toHaveLength(4);
     expect(new Set(ans.options.map(o=>o.label)).size).toBe(4);
     expect(ans.options.find(o=>o.value===ans.value)?.label).toBe(independentRange(p));
     expect(assessAnswer(ans,{kind:"choice",value:ans.value}).kind).toBe("correct");
     expect(assessAnswer(ans,{kind:"choice",value:ans.options.find(o=>o.value!==ans.value)!.value}).kind).toBe("incorrect");
     expect(assessAnswer(ans,emptyAnswer(ans)).kind).toBe("invalid");
     expect(assessAnswer(ans,{kind:"choice",value:"invalid-option"}).kind).toBe("invalid");
     expect(v.solution!.length).toBeGreaterThanOrEqual(5);
     expect(v.explanation).toContain(independentRange(p));
     if(locale==="en")expect(v.explanation).not.toMatch(/[ąćęłńóśźż]/i);
    }
   }
  }
  expect(signatures.size).toBe(72);
  expect(counts).toEqual({cross:24,lower:24,upper:24});
 },60000);
});
