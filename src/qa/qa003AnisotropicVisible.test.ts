import {describe,it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity} from "../university/catalog";
import {assessAnswer,emptyAnswer} from "../answers";

/**
 * QA-003 independent, question-derived certificate for W03 anisotropic limits.
 *
 * No production anisotropicClass/nonlinearPathValue, mode, answer or solver reads
 * are used to derive expectations. BigInt fractions are local to this audit.
 * This test deliberately inspects the actual localized prompt (not parameters).
 */
type Q={n:bigint;d:bigint};
const absBig=(x:bigint)=>x<0n?-x:x;
function gcd(a:bigint,b:bigint):bigint{
 a=absBig(a);b=absBig(b);
 while(b!==0n){const z=a%b;a=b;b=z;}
 return a||1n;
}
function norm(n:bigint,d:bigint):Q{
 if(d===0n)throw Error("Zero denominator");
 if(d<0n){n=-n;d=-d;}
 const g=gcd(n,d);return {n:n/g,d:d/g};
}
function q(s:string):Q{
 const m=/^([+-]?\d+)(?:\/([+-]?\d+))?$/.exec(s.trim().replaceAll("−","-"));
 if(!m)throw Error("Not a visible rational: "+s);
 return norm(BigInt(m[1]),BigInt(m[2]??"1"));
}
const add=(a:Q,b:Q)=>norm(a.n*b.d+b.n*a.d,a.d*b.d);
const neg=(a:Q)=>norm(-a.n,a.d);
const sub=(a:Q,b:Q)=>add(a,neg(b));
const mul=(a:Q,b:Q)=>norm(a.n*b.n,a.d*b.d);
const div=(a:Q,b:Q)=>norm(a.n*b.d,a.d*b.n);
const eq=(a:Q,b:Q)=>a.n*b.d===b.n*a.d;
const abs=(a:Q)=>norm(absBig(a.n),a.d);
const le=(a:Q,b:Q)=>a.n*b.d<=b.n*a.d;
const pow=(a:Q,k:number):Q=>norm(a.n**BigInt(k),a.d**BigInt(k));
const display=(a:Q)=>String(a.n)+(a.d===1n?"":"/"+String(a.d));
const shown=(a:Q)=>display(a).replaceAll("-","−");

function fromQuestion(text:string){
 const lines=text.split("\n");
 if(lines.length!==2)throw Error("Expected two-line question");
 const target=/\(([^(),]+),\s*([^(),]+)\)\.$/.exec(lines[0]);
 const coordinates=/u=x−\(([^)]+)\), v=y−\(([^)]+)\)/.exec(lines[1]);
 if(!target||!coordinates)throw Error("Missing target or coordinate translation");
 const atX=q(target[1]),atY=q(target[2]);
 if(!eq(atX,q(coordinates[1]))||!eq(atY,q(coordinates[2])))
  throw Error("Target/coordinate mismatch");
 const formula=/g\(x,y\)=\(([^)]+)\)\+\(([^)]+)\)u\^([34])v²\/\(u⁶\+v⁴\)/.exec(lines[1]);
 if(!formula)throw Error("Unknown or incomplete displayed formula");
 const base=q(formula[1]),factor=q(formula[2]),power=Number(formula[3]);
 if(factor.n===0n)throw Error("Zero coefficient invalidates path witness");
 const definition=/(?:dla|for)\s+\(u,v\)≠\(0,0\);\s*g\(([^(),]+),\s*([^()]+)\)=([−+\-\d/]+)\.$/.exec(lines[1]);
 if(!definition)throw Error("Missing punctured-domain/point-value definition");
 if(!eq(q(definition[1]),atX)||!eq(q(definition[2]),atY))
  throw Error("Point-value coordinates mismatch");
 const valueAt=q(definition[3]);
 const classification=power===3?"nonremovable":eq(base,valueAt)?"continuous":"removable";
 return {base,factor,power,atX,atY,valueAt,classification};
}
function expression(c:ReturnType<typeof fromQuestion>,u:Q,v:Q){
 return add(c.base,mul(c.factor,div(mul(pow(u,c.power),pow(v,2)),add(pow(u,6),pow(v,4)))));
}

describe("QA-003: independent anisotropic two-variable visible-question audit",()=>{
 it("checks all 72 hard/advanced/expert variants in both languages, exact paths and grading",()=>{
  const identities=new Set<string>();
  const counts=new Map<string,number>();
  let presentations=0,grading=0;
  for(const level of ["hard","advanced","expert"] as const)for(let v=0;v<24;v++){
   const task=makeUniversityTask("multivar-anisotropic-limit",v,level);
   identities.add(task.id);
   for(const locale of ["pl","en"] as const){
    const view=localizeUniversity(task,locale);
    const c=fromQuestion(view.question);
    expect(c.classification).toMatch(/^(continuous|removable|nonremovable)$/);
    expect(view.answer.kind).toBe("choice");
    if(view.answer.kind!=="choice")throw Error("Expected choice answer");
    expect(view.answer.value).toBe(c.classification);
    expect(view.answer.options.map(x=>x.value).sort()).toEqual(["continuous","nonremovable","removable"]);
    const input={kind:"choice" as const,value:c.classification};
    const wrong=view.answer.options.filter(x=>x.value!==c.classification);
    const scenarios=[
     {input,expected:"correct"},
     ...wrong.map(x=>({input:{kind:"choice" as const,value:x.value},expected:"incorrect"})),
     {input:emptyAnswer(view.answer),expected:"invalid"},
     {input:{kind:"choice" as const,value:"not-an-option"},expected:"invalid"},
     {input:"__bad_structure__",expected:"invalid"},
    ];
    expect(scenarios).toHaveLength(6);
    for(const s of scenarios){expect(assessAnswer(view.answer,s.input).kind).toBe(s.expected);grading++;}
    const steps=view.solution?.filter(s=>s.kind==="working")??[];
    const final=view.solution?.at(-1);
    expect(final?.kind).toBe("answer");
    if(final?.kind!=="answer")throw Error("Missing final answer");
    expect(assessAnswer(final.answer,input).kind).toBe("correct");
    expect(view.hint).toContain("v=0");
    expect(view.nextHint).toContain("p=3");
    expect(steps[0]?.action).toContain("(u,v)→(0,0)");
    expect(steps[1]?.action).toContain("u⁶+v⁴>0");
    expect(steps.every(s=>s.reason.trim().length>20)).toBe(true);

    const half=q("1/2");
    const pathConstant=add(c.base,mul(c.factor,half));
    for(const t of [q("1/3"),q("-1/2"),q("2/5")]){
     const U=pow(t,2),V=pow(t,3);
     const expectedPath=add(c.base,mul(c.factor,c.power===3?half:mul(pow(t,2),half)));
     expect(eq(expression(c,U,V),expectedPath)).toBe(true);
     expect(eq(expression(c,t,q("0")),c.base)).toBe(true);
    }
    if(c.power===3){
     expect(c.classification).toBe("nonremovable");
     expect(eq(c.base,pathConstant)).toBe(false);
     expect(steps.some(s=>s.action.includes("u=t², v=t³"))).toBe(true);
     expect(steps.some(s=>s.action==="L_osi="+shown(c.base)+"; L_drogi="+shown(pathConstant)+"; L_osi≠L_drogi")).toBe(true);
    }else{
     expect(c.classification).toBe(eq(c.base,c.valueAt)?"continuous":"removable");
     expect(steps.some(s=>s.action==="2|u³|v² ≤ u⁶+v⁴")).toBe(true);
     expect(steps.some(s=>s.action==="|u⁴v²/(u⁶+v⁴)| ≤ |u|/2")).toBe(true);
     expect(steps.some(s=>s.action==="lim g="+shown(c.base)+"; g("+shown(c.atX)+", "+shown(c.atY)+")="+shown(c.valueAt))).toBe(true);
     for(const [U,V] of [[q("1/3"),q("2/5")],[q("-2/7"),q("1/4")]]){
      const deviation=abs(sub(expression(c,U,V),c.base));
      const bound=div(mul(abs(c.factor),abs(U)),q("2"));
      expect(le(deviation,bound)).toBe(true);
     }
    }
    presentations++;
    counts.set(c.classification,(counts.get(c.classification)??0)+1);
    // Negative checks ensure the prompt is self-contained, not only the answer key.
    expect(()=>fromQuestion(view.question.replace(/;\s*g\([^)]*\)=[−+\-\d/]+\.$/,"."))).toThrow();
    expect(()=>fromQuestion(view.question.replace(/;\s*g\([^)]*\)=/,"; g(999, 999)="))).toThrow("Point-value coordinates mismatch");
    expect(()=>fromQuestion(view.question.replace(/\(u,v\)≠\(0,0\)/,"(u,v)≠(999,999)"))).toThrow();
    expect(()=>fromQuestion(view.question.replace(/u=x−\([^)]+\)/,"u=x−(999)"))).toThrow("Target/coordinate mismatch");
   }
  }
  expect(identities.size).toBe(72);
  expect(presentations).toBe(144);
  expect(grading).toBe(864);
  expect(Object.fromEntries(counts)).toEqual({nonremovable:48,continuous:48,removable:48});
 });
});