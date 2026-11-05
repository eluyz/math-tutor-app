import {describe,it,expect} from "vitest";
import {batchG,batchGCertificate,wrongBatchG} from "./batchG";
import {makeUniversityTask,localizeUniversity} from "../university/catalog";
import {assessAnswer,emptyAnswer} from "../answers";
import {auditCalculation} from "../university/audit";
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
   const pl=localizeUniversity(task,"pl"),en=localizeUniversity(task,"en");
   expect(pl.hint).not.toBe(en.hint);expect(pl.nextHint).not.toBe(en.nextHint);
   for(const view of [pl,en]){
    const viewCert=batchGCertificate(task,view===en?"en":"pl");
    expect(assessAnswer(view.answer,input),task.id).toEqual({kind:"correct"});
    expect(assessAnswer(view.answer,wrongBatchG(input,task)).kind,task.id).toBe("incorrect");
    expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
    const final=view.solution?.at(-1);expect(final?.kind).toBe("answer");
    if(final?.kind==="answer")expect(assessAnswer(final.answer,input)).toEqual({kind:"correct"});
    const steps=view.solution?.filter(s=>s.kind==="working")??[];
    expect(steps.length,task.id+" anchors for every working step").toBe(viewCert.anchors.length);
    steps.forEach((s,i)=>{
     expect(s.reason.length).toBeGreaterThan(15);expect(viewCert.anchors[i].length).toBeGreaterThan(0);
     for(const anchor of viewCert.anchors[i])expect(clean(s.action),task.id+" step "+i).toContain(clean(anchor));
     for(const calculation of s.calculations)expect(auditCalculation(calculation)).toBe(true);
    });
    expect(view.hint.length).toBeGreaterThan(15);expect(view.nextHint.length).toBeGreaterThan(15);
    expect(view.hint).not.toBe(view.nextHint);expect(view.explanation.length).toBeGreaterThan(20);
    if(cert.choiceLabel&&view.answer.kind==="choice"&&typeof input!=="string"&&input.kind==="choice")expect(view.answer.options.find(x=>x.value===input.value)?.label).toBe(cert.choiceLabel);
    if(view===en)expect([view.question,view.hint,view.nextHint,view.explanation,...steps.map(s=>s.action+" "+s.reason)].join(" ")).not.toMatch(new RegExp(polishLearningText.source+"|\\b(gdy|lub|Dla)\\b","iu"));
   }
  }
  expect(keys.size).toBe(24);
  if(row.family==="sequence-monotonic-bounded")expect(classes).toEqual(new Set(["increasing-bounded","decreasing-bounded","increasing-unbounded","decreasing-unbounded","neither-bounded"]));
 });
});
