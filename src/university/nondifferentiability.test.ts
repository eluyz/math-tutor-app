import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as f } from "../answers";
import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, equalRational as eq } from "../rational";
import { englishAnswer, englishTask } from "../locales/lessons-en";
import { makeUniversityTask, localizeUniversity, universityPool } from "./catalog";
import { nondifferentiabilityFamilies, oneSidedSlopes, piecewiseClassification, type NondifferentiabilityProblem } from "./nondifferentiability";

function expectChoice(task:ReturnType<typeof makeUniversityTask>,correct:string) {
  const spec=task.answer;
  expect(spec.kind).toBe("choice");
  if(spec.kind!=="choice")throw Error("Missing choice answer");
  expect(spec.options).toHaveLength(4);
  expect(new Set(spec.options.map(o=>o.value)).size).toBe(4);
  expect(new Set(spec.options.map(o=>o.label)).size).toBe(4);
  expect(spec.options.find(o=>o.value===spec.value)?.label).toBe(correct);
  expect(assessAnswer(spec,{kind:"choice",value:spec.value}).kind).toBe("correct");
  expect(assessAnswer(spec,{kind:"choice",value:spec.options.find(o=>o.value!==spec.value)!.value}).kind).toBe("incorrect");
  expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
  expect(assessAnswer(spec,{kind:"choice",value:"not-in-options"}).kind).toBe("invalid");
}

describe("MT-EDU-016 P0: D06 independently verified derivatives",()=>{
  it.each(nondifferentiabilityFamilies)("$id: 24 original variants per level, PL/EN, steps, validity",family=>{
    for(const level of family.supportedDifficulties){
      const keys=new Set<string>();
      const classes=new Map<string,number>();
      for(let variant=0;variant<24;variant++){
        const task=makeUniversityTask(family.id,variant,level);
        const p=task.university as NondifferentiabilityProblem;
        keys.add(task.contentKey);
        if(p.kind==="derivative-absolute-one-sided"){
          const {left,right}=oneSidedSlopes(p);
          // Audit from the limit definition: (f(h+t)-f(h))/t = a*|t|/t+b.
          const plus=add(div(mul(p.a,r(1)),r(1)),p.b);
          const minus=add(div(mul(p.a,r(1)),r(-1)),p.b);
          expect(eq(plus,right)).toBe(true);
          expect(eq(minus,left)).toBe(true);
          expect(eq(left,right)).toBe(false);
          const label="f′₋("+f(p.h)+") = "+f(minus)+"; f′₊("+f(p.h)+") = "+f(plus);
          expectChoice(task,label);
        } else {
          const expected=p.jump.numerator!==0n?"jump":
            eq(p.leftSlope,p.rightSlope)?"smooth":"corner";
          classes.set(expected,1+(classes.get(expected)||0));
          expect(piecewiseClassification(p)).toBe(expected);
          expect(eq(sub(add(p.at,p.jump),p.at),p.jump)).toBe(true);
          if(expected==="smooth")expect(eq(p.leftSlope,p.rightSlope)).toBe(true);
          if(expected==="corner")expect(eq(p.leftSlope,p.rightSlope)).toBe(false);
          if(expected==="jump")expect(p.jump.numerator).not.toBe(0n);
          const labels={smooth:"ciągła i różniczkowalna",
            corner:"ciągła, ale nieróżniczkowalna (załamanie)",
            jump:"nieciągła (skok)"};
          expectChoice(task,labels[expected]);
        }
        const en=localizeUniversity(task,"en");
        expect(en.id).toBe(task.id);
        expect(en.contentKey).toBe(task.contentKey);
        expect(en.answer).toEqual(englishAnswer(task.answer));
        expect(englishTask(task).answer).toEqual(en.answer);
        expect(en.question).not.toMatch(/[ąćęłńóśźż]/i);
        for(const shown of [task,en]){
          expect(shown.question.length).toBeGreaterThan(50);
          expect(shown.hint.length).toBeGreaterThan(20);
          expect(shown.nextHint.length).toBeGreaterThan(20);
          expect(shown.solution?.length).toBeGreaterThanOrEqual(4);
        }
      }
      expect(keys.size,family.id+"/"+level).toBe(24);
      if(family.id==="derivative-piecewise-point")
        for(const key of ["smooth","corner","jump"])
          expect(classes.get(key),level+"/"+key).toBe(8);
      expect(universityPool("derivatives",level).filter(task=>task.templateId===family.id)).toHaveLength(24);
    }
  });
  it("avoids collisions across both families and all three declared levels",()=>{
    const tasks=["easy","medium","hard"] as const;
    const all=tasks.flatMap(level=>nondifferentiabilityFamilies.flatMap(f=>
      Array.from({length:24},(_,v)=>makeUniversityTask(f.id,v,level))));
    expect(new Set(all.map(x=>x.contentKey)).size).toBe(144);
  });
});
