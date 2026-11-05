import {describe,it,expect} from "vitest";
import {batchE,batchECertificate,wrongBatchE,evaluate,sign} from "./batchE";
import {makeUniversityTask,localizeUniversity} from "../university/catalog";
import {assessAnswer,emptyAnswer} from "../answers";
import {auditCalculation} from "../university/audit";
import {polishLearningText} from "../../e2e/helpers/localization";
import {subtractRational as sub} from "../rational";

describe("Batch E independent calculus method evidence",()=>{
  it("enforces the bounded manifest",()=>{
    expect(batchE.length).toBeLessThanOrEqual(16);
    expect(new Set(batchE.map(x=>x.family+":"+x.level)).size).toBe(batchE.length);
    expect(batchE.flatMap(x=>x.variants).length).toBeLessThanOrEqual(32);
  });
  for(const row of batchE)it(`${row.block} ${row.skill} ${row.family}/${row.level}: 24 exact variants × PL/EN`,()=>{
    const keys=new Set<string>(),orientations=new Set<number>();
    for(let v=0;v<24;v++){
      const task=makeUniversityTask(row.family,v,row.level),p=task.university;
      const certificate=batchECertificate(task),expected=certificate.input;
      expect(certificate.checks.length).toBeGreaterThanOrEqual(2);
      keys.add(task.contentKey);
      if(p.kind==="integral-substitution-definite")orientations.add(sign(sub(evaluate([p.c,p.b,{numerator:1n,denominator:1n}],p.upper),evaluate([p.c,p.b,{numerator:1n,denominator:1n}],p.lower))));
      const pl=localizeUniversity(task,"pl"),en=localizeUniversity(task,"en");
      expect(pl.hint).not.toBe(en.hint);expect(pl.nextHint).not.toBe(en.nextHint);
      for(const view of [pl,en]){
        expect(assessAnswer(view.answer,expected),task.id).toEqual({kind:"correct"});
        expect(assessAnswer(view.answer,wrongBatchE(expected)).kind,task.id).toBe("incorrect");
        expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
        if(typeof expected!=="string"&&expected.kind==="primitive"){
          expect(assessAnswer(view.answer,{...expected,hasConstant:false})).toEqual({kind:"incorrect",reason:"missing-constant"});
          if(view.answer.kind!=="primitive")throw Error("Primitive specification expected");
          expect(view.answer.terms.map(x=>x.basis)).toEqual(certificate.basis);
        }
        expect(view.hint.length).toBeGreaterThan(15);expect(view.nextHint.length).toBeGreaterThan(15);
        expect(view.hint).not.toBe(view.nextHint);expect(view.explanation.length).toBeGreaterThan(20);
        expect(view.solution?.at(-1)?.kind).toBe("answer");
        const steps=view.solution?.filter(x=>x.kind==="working")??[];
        expect(steps.length).toBeGreaterThanOrEqual(3);
        for(const step of steps)if(step.kind==="working"){
          expect(step.action.trim()).not.toBe("");expect(step.reason.length).toBeGreaterThan(15);
          for(const calculation of step.calculations)expect(auditCalculation(calculation)).toBe(true);
        }
        if(view===en)expect([view.question,view.hint,view.nextHint,view.explanation,...steps.map(x=>x.action+" "+x.reason)].join(" ")).not.toMatch(new RegExp(polishLearningText.source+"|\\blub\\b|\\bod .+ do ","iu"));
      }
    }
    expect(keys.size).toBe(24);
    if(row.family==="integral-substitution-definite")expect(orientations).toEqual(new Set([-1,0,1]));
  });
});
