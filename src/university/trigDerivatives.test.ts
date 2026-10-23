import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as f } from "../answers";
import { rational as r, addRational as add, multiplyRational as mul, equalRational as eq } from "../rational";
import { englishAnswer } from "../locales/lessons-en";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { trigDerivativeFamilies, pointDerivative, derivativeFormula, phaseFactor, type TrigDerivativeProblem } from "./trigDerivatives";

function expectedFormula(p:Extract<TrigDerivativeProblem,{kind:"derivative-trig-chain"}>) {
  const u="("+p.innerSlope+")x+("+f(p.shift)+")";
  const c=mul(p.coefficient,r(p.innerSlope));
  if(p.mode==="sin")return "("+f(c)+")cos("+u+")";
  if(p.mode==="cos")return "("+f(mul(c,r(-1)))+")sin("+u+")";
  return "("+f(c)+")/cos²("+u+")";
}
function independentPhaseDerivative(p:Extract<TrigDerivativeProblem,{kind:"derivative-trig-special-point"}>) {
  const sign=p.mode==="tan"?1:
    p.mode==="sin"?(p.phase==="0"?1:-1):
      (p.phase==="π/2"?-1:1);
  return add(mul(p.coefficient,r(p.innerSlope*sign)),p.linearSlope);
}
describe("MT-EDU-016 P1: chain rule and exact special-angle trig derivatives",()=>{
  it.each(trigDerivativeFamilies)("$id checks 24 variants on 3 levels and locale correctness",family=>{
    for(const level of family.supportedDifficulties){
      const keys=new Set<string>(),modes=new Map<string,number>();
      for(let v=0;v<24;v++){
        const task=makeUniversityTask(family.id,v,level),p=task.university as TrigDerivativeProblem;
        keys.add(task.contentKey);
        modes.set(p.mode,(modes.get(p.mode)||0)+1);
        expect(p.innerSlope).toBeGreaterThanOrEqual(2);
        expect(p.coefficient.numerator).not.toBe(0n);
        const spec=task.answer;
        if(p.kind==="derivative-trig-chain"){
          expect(derivativeFormula(p)).toBe(expectedFormula(p));
          expect(spec.kind).toBe("choice");
          if(spec.kind!=="choice")throw Error("Expected trig choice");
          expect(spec.options).toHaveLength(4);
          expect(new Set(spec.options.map(o=>o.label)).size).toBe(4);
          expect(spec.options.find(o=>o.value===spec.value)?.label).toBe(expectedFormula(p));
          expect(assessAnswer(spec,{kind:"choice",value:spec.value}).kind).toBe("correct");
          expect(assessAnswer(spec,{kind:"choice",value:spec.options.find(o=>o.value!==spec.value)!.value}).kind).toBe("incorrect");
          expect(assessAnswer(spec,{kind:"choice",value:"not-a-choice"}).kind).toBe("invalid");
        }else{
          expect(p.mode==="cos"?["π/2","3π/2"]:["0","π"]).toContain(p.phase);
          const factor=p.mode==="tan"?1:p.mode==="sin"?(p.phase==="0"?1:-1):(p.phase==="π/2"?-1:1);
          expect(phaseFactor(p)).toBe(factor);
          expect(eq(pointDerivative(p),independentPhaseDerivative(p))).toBe(true);
          expect(spec.kind).toBe("scalar");
          if(spec.kind!=="scalar")throw Error("Expected numeric trig result");
          expect(eq(spec.value,independentPhaseDerivative(p))).toBe(true);
          expect(assessAnswer(spec,f(spec.value)).kind).toBe("correct");
          expect(assessAnswer(spec,f(add(spec.value,r(1)))).kind).toBe("incorrect");
          expect(assessAnswer(spec,"1/0").kind).toBe("invalid");
        }
        expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
        const english=localizeUniversity(task,"en");
        expect(english.contentKey).toBe(task.contentKey);
        expect(english.answer).toEqual(englishAnswer(task.answer));
        expect(english.question).not.toMatch(/[ąćęłńóśźż]/i);
        for(const shown of [task,english]){
          expect(shown.question.length).toBeGreaterThan(30);
          expect(shown.solution?.length).toBeGreaterThanOrEqual(4);
          expect(shown.hint.length).toBeGreaterThan(12);
          expect(shown.nextHint.length).toBeGreaterThan(20);
        }
      }
      expect(keys.size,family.id+"/"+level).toBe(24);
      for(const mode of ["sin","cos","tan"])expect(modes.get(mode)).toBe(8);
    }
  });
  it("maintains unique content keys over 144 exercises",()=>{
    const all=["easy","medium","hard"] as const;
    const tasks=all.flatMap(level=>trigDerivativeFamilies.flatMap(family=>
      Array.from({length:24},(_,v)=>makeUniversityTask(family.id,v,level))));
    expect(new Set(tasks.map(t=>t.contentKey)).size).toBe(144);
  });
});
