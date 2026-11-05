import {describe,it,expect} from "vitest";
import {batchF,batchFCertificate,wrongBatchF} from "./batchF";
import {makeUniversityTask,localizeUniversity} from "../university/catalog";
import {assessAnswer,emptyAnswer} from "../answers";
import {auditCalculation} from "../university/audit";
import {polishLearningText} from "../../e2e/helpers/localization";
const clean=(s:string)=>s.replace(/\s/g,"");

describe("Batch F: exact independent derivatives and function analysis",()=>{
 it("enforces the bounded manifest",()=>{
  expect(batchF.length).toBeLessThanOrEqual(16);
  expect(new Set(batchF.map(x=>x.family+":"+x.level)).size).toBe(batchF.length);
  expect(batchF.flatMap(x=>x.variants).length).toBeLessThanOrEqual(32);
  expect(batchF.every(x=>x.variants.every(v=>v>=0&&v<24))).toBe(true);
 });
 for(const row of batchF)it(`${row.block} ${row.skills.join("/")} ${row.family}/${row.level}: 24 exact tasks × PL/EN and all working steps`,()=>{
  const ids=new Set<string>(),forms=new Set<string>();
  for(let v=0;v<24;v++){
   const task=makeUniversityTask(row.family,v,row.level),cert=batchFCertificate(task),expected=cert.input;
   ids.add(task.contentKey);expect(cert.facts.length).toBeGreaterThanOrEqual(2);
   if(typeof expected!=="string"&&expected.kind==="choice")forms.add(expected.value);
   const pl=localizeUniversity(task,"pl"),en=localizeUniversity(task,"en");
   expect(pl.hint).not.toBe(en.hint);expect(pl.nextHint).not.toBe(en.nextHint);
   for(const view of [pl,en]){
    expect(assessAnswer(view.answer,expected),task.id).toEqual({kind:"correct"});
    expect(assessAnswer(view.answer,wrongBatchF(expected,task)).kind,task.id).toBe("incorrect");
    expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
    expect(view.hint.length).toBeGreaterThan(15);expect(view.nextHint.length).toBeGreaterThan(15);
    expect(view.hint).not.toBe(view.nextHint);expect(view.explanation.length).toBeGreaterThan(20);
    const final=view.solution?.at(-1);expect(final?.kind).toBe("answer");
    if(final?.kind==="answer")expect(assessAnswer(final.answer,expected)).toEqual({kind:"correct"});
    const steps=view.solution?.filter(s=>s.kind==="working")??[];
    expect(steps.length,task.id+" every step has independent math anchors").toBe(cert.anchors.length);
    steps.forEach((step,i)=>{
     expect(step.reason.length).toBeGreaterThan(15);expect(cert.anchors[i].length).toBeGreaterThan(0);
     for(const anchor of cert.anchors[i])expect(clean(step.action),task.id+" step "+(i+1)).toContain(clean(anchor));
     for(const calculation of step.calculations)expect(auditCalculation(calculation)).toBe(true);
    });
    if(cert.choiceLabel&&view.answer.kind==="choice"&&typeof expected!=="string"&&expected.kind==="choice")expect(view.answer.options.find(o=>o.value===expected.value)?.label).toBe(cert.choiceLabel);
    if(view===en)expect([view.question,view.hint,view.nextHint,view.explanation,...steps.map(s=>s.action+" "+s.reason)].join(" ")).not.toMatch(new RegExp(polishLearningText.source+"|\\b(gdy|lub)\\b","iu"));
   }
  }
  expect(ids.size).toBe(24);
  if(row.family==="derivative-piecewise-point")expect(forms).toEqual(new Set(["derivative:0","derivative:1","derivative:2"]));
  if(row.family==="derivative-vertical-cusp")expect(forms).toEqual(new Set(["vertical","cusp"]));
 });
});
