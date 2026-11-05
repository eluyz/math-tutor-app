import {describe,it,expect} from "vitest";
import {batchG,batchGCertificate,wrongBatchG} from "./batchG";
import {makeUniversityTask,localizeUniversity} from "../university/catalog";
import {assessAnswer,emptyAnswer} from "../answers";
import {auditCalculation} from "../university/audit";
import {r,add,sub,mul,div,cmp} from "./batchFMath";
import {selectedSetContains} from "../university/functions-audit";
import {polishLearningText} from "../../e2e/helpers/localization";
const clean=(s:string)=>s.replace(/\s/g,"").replaceAll("-","−");

describe("Batch G independent sequence, domain and asymptote proofs",()=>{
 it("keeps the scope bounded",()=>{
  expect(batchG.length).toBeLessThanOrEqual(16);
  expect(new Set(batchG.map(x=>x.family+":"+x.level)).size).toBe(batchG.length);
  expect(batchG.flatMap(x=>x.variants).length).toBeLessThanOrEqual(32);
 });
 for(const row of batchG)it(`${row.block} ${row.skills.join("/")} ${row.family}/${row.level}: exactly 24 tasks × PL/EN`,()=>{
  const keys=new Set<string>(),classes=new Set<string>();
  for(let v=0;v<24;v++){
   const task=makeUniversityTask(row.family,v,row.level),cert=batchGCertificate(task),input=cert.input;
   keys.add(task.contentKey);expect(cert.facts.length).toBeGreaterThanOrEqual(2);
   if(cert.classes)classes.add(cert.classes);
   const p=task.university;
   if(p.kind==="sequence-monotonic-bounded"){
    const term=(n:number)=>add(p.offset,p.mode==="linear"?mul(p.amplitude,r(n)):mul(p.amplitude,r(p.mode==="alternating"?(-1)**n:1,n+p.shift)));
    for(const n of [1,2,3,10,100]){
     const value=term(n),delta=sub(term(n+1),value);
     const formula=p.mode==="linear"?p.amplitude:p.mode==="reciprocal"?div(sub(r(0),p.amplitude),r((n+p.shift)*(n+p.shift+1))):div(mul(p.amplitude,r(-((-1)**n)*(2*n+2*p.shift+1))),r((n+p.shift)*(n+p.shift+1)));
     expect(cmp(delta,formula)).toBe(0);
     if(cert.bounds?.lower)expect(cmp(value,cert.bounds.lower)).toBeGreaterThanOrEqual(0);
     if(cert.bounds?.upper)expect(cmp(value,cert.bounds.upper)).toBeLessThanOrEqual(0);
    }
   }
   const pl=localizeUniversity(task,"pl"),en=localizeUniversity(task,"en");
   expect(pl.hint).not.toBe(en.hint);expect(pl.nextHint).not.toBe(en.nextHint);
   for(const view of [pl,en]){
    const viewCert=batchGCertificate(task,view===en?"en":"pl");
    expect(assessAnswer(view.answer,input),task.id).toEqual({kind:"correct"});
    expect(assessAnswer(view.answer,wrongBatchG(input,task)).kind,task.id).toBe("incorrect");
    expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
    const final=view.solution?.at(-1);expect(final?.kind).toBe("answer");
    if(final?.kind==="answer")expect(assessAnswer(final.answer,input)).toEqual({kind:"correct"});
    if(cert.critical&&cert.contains&&view.answer.kind==="choice"){
     const cuts=[...cert.critical].sort(cmp),points=[...cuts,sub(cuts[0],r(1)),add(cuts.at(-1)!,r(1)),...cuts.slice(1).map((x,i)=>div(add(x,cuts[i]),r(2)))];
     for(const x of points)expect(selectedSetContains(view.answer.value,x),task.id+" boundary/cell").toBe(cert.contains(x));
    }
    if(p.kind==="analysis-power-law"||p.kind==="analysis-elementary-equation"||p.kind==="analysis-log-inequality")expect(view.question).not.toMatch(/log_1\/2/);
    const steps=view.solution?.filter(s=>s.kind==="working")??[];
    expect(steps.length,task.id+" anchors for every working step").toBe(viewCert.anchors.length);
    steps.forEach((s,i)=>{
     expect(s.reason.length).toBeGreaterThan(15);expect(viewCert.anchors[i].length).toBeGreaterThan(0);
     for(const anchor of viewCert.anchors[i])expect(clean(s.action),task.id+" step "+i).toContain(clean(anchor));
     for(const calculation of s.calculations)expect(auditCalculation(calculation)).toBe(true);
    });
    expect(view.hint.length).toBeGreaterThanOrEqual(10);expect(view.nextHint.length).toBeGreaterThanOrEqual(10);
    expect(view.hint).not.toBe(view.nextHint);expect(view.explanation.length).toBeGreaterThan(20);
    if(viewCert.choiceLabel&&view.answer.kind==="choice"&&typeof input!=="string"&&input.kind==="choice")expect(view.answer.options.find(x=>x.value===input.value)?.label).toBe(viewCert.choiceLabel);
    if(view===en)expect([view.question,view.hint,view.nextHint,view.explanation,...steps.map(s=>s.action+" "+s.reason)].join(" ")).not.toMatch(new RegExp(polishLearningText.source+"|\\b(gdy|lub|Dla)\\b","iu"));
   }
  }
  expect(keys.size).toBe(24);
  if(row.family==="function-mixed-domain")expect(classes).toEqual(new Set(row.level==="hard"?["empty","connected"]:["connected","disconnected"]));
  if(row.family==="function-parity")expect(classes).toEqual(new Set(["even","odd","neither"]));
  if(row.family==="analysis-log-inequality")expect(classes).toEqual(new Set(["base>1","base<1"]));
  if(row.family==="sequence-monotonic-bounded")expect(classes).toEqual(new Set(["increasing-bounded","decreasing-bounded","increasing-unbounded","decreasing-unbounded","neither-bounded"]));
 });
});
