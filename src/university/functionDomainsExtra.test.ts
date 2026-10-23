import { describe,it,expect } from "vitest";
import { rational as r, addRational as add, subtractRational as sub, divideRational as div } from "../rational";
import { assessAnswer, emptyAnswer } from "../answers";
import { makeUniversityTask,localizeUniversity } from "./catalog";
import { functionDomainExtraFamilies, type FunctionDomainExtraProblem } from "./functionDomainsExtra";
import { selectedSetContains } from "./functions-audit";
import { compare as cmp } from "./realSets";

const greater=(a:ReturnType<typeof r>,b:ReturnType<typeof r>)=>cmp(a,b)>0;
const atLeast=(a:ReturnType<typeof r>,b:ReturnType<typeof r>)=>cmp(a,b)>=0;
function independentMixed(p:Extract<FunctionDomainExtraProblem,{kind:"function-mixed-domain"}>,x:ReturnType<typeof r>){
  const root=p.mode==="root-log" ? atLeast(x,p.p) :
    (cmp(x,p.p)<=0 || cmp(x,p.q)>=0);
  if(p.mode!=="product-root-log")return root&&greater(x,p.boundary)&&cmp(x,add(p.boundary,r(1)))!==0;
  return root&&(p.base.numerator>p.base.denominator?
    greater(x,add(p.boundary,r(1))) :
    greater(x,p.boundary)&&cmp(x,add(p.boundary,r(1)))<0);
}
function samplePoints(p:Extract<FunctionDomainExtraProblem,{kind:"function-mixed-domain"}>){
 const boundaries=[p.p,p.q,p.boundary,add(p.boundary,r(1))].sort(cmp);
 const result=[...boundaries,sub(boundaries[0],r(2)),add(boundaries.at(-1)!,r(2))];
 for(let i=1;i<boundaries.length;i++)result.push(r(
  boundaries[i-1].numerator*boundaries[i].denominator+boundaries[i].numerator*boundaries[i-1].denominator,
  2n*boundaries[i-1].denominator*boundaries[i].denominator));
 return result;
}
describe("MT-EDU-015B P2A: tangent and mixed domains",()=>{
 it.each(functionDomainExtraFamilies)("$id: every generated task has exact classification and bilingual solutions",(family)=>{
  for(const level of family.supportedDifficulties){
   const keys=new Set<string>();
   for(let variant=0;variant<24;variant++){
    const task=makeUniversityTask(family.id,variant,level);
    const p=task.university as FunctionDomainExtraProblem;
    keys.add(task.contentKey);
    const spec=task.answer;
    expect(spec.kind).toBe("choice");
    if(spec.kind!=="choice")throw Error("A choice answer was required");
    expect(spec.options.some(x=>x.value===spec.value)).toBe(true);
    expect(new Set(spec.options.map(x=>x.value)).size).toBe(spec.options.length);
    expect(new Set(spec.options.map(x=>x.label)).size).toBe(spec.options.length);
    if(p.kind==="function-tangent-domain"){
      expect(p.factor).toBeGreaterThan(0);
      expect(p.shift.denominator).toBeGreaterThan(0n);
      const expected=sub(r(1,2),p.shift);
      expect(spec.options.find(x=>x.value===spec.value)?.label).toContain("π");
      const wrongPeriod=spec.options.find(x=>x.value==="tan:period")?.label;
      expect(wrongPeriod).toContain("2k");
      expect(wrongPeriod).toContain("k∈ℤ");
      expect(wrongPeriod).not.toContain("2k∈ℤ");
      // Structural check independent of answer picker: the forbidden tangent arguments
      // solve ax + shift*pi = pi/2 + k*pi for every integer k.
      for(let k=-3;k<=3;k++){
        const origin=add(expected,r(k));
        expect(origin.denominator).toBeGreaterThan(0n);
        const excludedCoefficient=div(origin,r(p.factor));
        expect(add(r(excludedCoefficient.numerator*BigInt(p.factor),excludedCoefficient.denominator),p.shift)).toEqual(add(r(1,2),r(k)));
      }
      if(p.pole!==null)expect(spec.options.find(x=>x.value===spec.value)?.label).toContain("∖ {");
    }else{
      for(const x of samplePoints(p)){
        expect(selectedSetContains(spec.value,x),`${family.id}/${level}/${variant} x=${x.numerator}/${x.denominator}`)
          .toBe(independentMixed(p,x));
      }
    }
    for(const locale of ["pl","en"] as const){
      const localized=localizeUniversity(task,locale),answer=localized.answer;
      expect(answer.kind).toBe("choice");
      if(answer.kind!=="choice")throw Error("Expected choice");
      const correct={kind:"choice" as const,value:answer.value};
      expect(assessAnswer(answer,correct).kind).toBe("correct");
      expect(assessAnswer(answer,{kind:"choice",value:answer.options.find(x=>x.value!==answer.value)!.value}).kind).toBe("incorrect");
      expect(assessAnswer(answer,{kind:"choice",value:"invalid-domain-choice"}).kind).toBe("invalid");
      expect(assessAnswer(answer,emptyAnswer(answer)).kind).toBe("invalid");
      expect(localized.solution?.length).toBeGreaterThan(2);
      expect(localized.question.length).toBeGreaterThan(15);
      expect(localized.nextHint.length).toBeGreaterThan(10);
    }
   }
   expect(keys.size,`${family.id}/${level}`).toBe(24);
  }
 });
});
