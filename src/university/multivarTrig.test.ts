import { it, expect } from "vitest";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { assessAnswer, emptyAnswer } from "../answers";
import { independentTrig } from "../qa/w01Trig";
import { polishLearningText } from "../../e2e/helpers/localization";

it("W01: all 24 trig variants, independent mixed derivatives and bilingual grading",()=>{
  const identities=new Set<string>(),seen=new Set<string>();
  for(let v=0;v<24;v++){
    const task=makeUniversityTask("multivar-trig-partial",v,"hard");
    const p=task.university;
    if(p.kind!=="multivar-trig-partial")throw new Error("Trig family mismatch");
    expect(task.category).toBe("derivatives");
    expect(p.a).toBeGreaterThanOrEqual(2);
    expect(p.b).toBeLessThanOrEqual(-2);
    expect(p.k).toBeGreaterThanOrEqual(2);
    identities.add(p.mode+":"+p.target);
    seen.add(task.contentKey);
    const expected=independentTrig(task);
    for(const locale of ["pl","en"] as const){
      const view=localizeUniversity(task,locale);
      expect(assessAnswer(view.answer,expected).kind).toBe("correct");
      const wrong={...expected,values:[String(Number(expected.values[0])+1),...expected.values.slice(1)]};
      expect(assessAnswer(view.answer,wrong).kind).toBe("incorrect");
      expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
      const steps=view.solution?.filter(x=>x.kind==="working")??[];
      expect(steps).toHaveLength(6);
      expect(steps[1].action).toBe("D(f)=ℝ²; f∈C∞(ℝ²)");
      expect(steps[2].action).toContain("u_xy=u_yx=");
      expect(steps[3].action).toContain("f_ij=");
      expect(steps[4].action).toContain("f_"+p.target);
      expect(steps[5].action).toContain("f_"+p.target);
      expect(view.hint.length).toBeGreaterThan(20);
      expect(view.nextHint.length).toBeGreaterThan(20);
      if(locale==="en")expect(view.explanation+" "+view.hint+" "+view.nextHint).not.toMatch(polishLearningText);
      const final=view.solution?.at(-1);
      if(final?.kind!=="answer")throw Error("Missing final");
      expect(assessAnswer(final.answer,expected).kind).toBe("correct");
    }
    if(p.target==="xy"||p.target==="yx"){
      const swapped=independentTrig({...task,university:{...p,target:p.target==="xy"?"yx":"xy"}});
      expect(swapped).toEqual(expected);
    }
  }
  expect(identities.size).toBe(12);
  expect(seen.size).toBe(24);
});
