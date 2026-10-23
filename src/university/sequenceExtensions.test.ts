import {describe,it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {sequenceExtensionFamilies} from "./sequenceExtensions";
import {q,a,m,d,eq} from "./audit";
import {rational as normalize} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f,type LimitValue} from "../answers";
import type {GeometricTerm,SequenceProblem} from "./schema";
import type {Rational} from "../rational";

function dominant(terms:readonly GeometricTerm[]){
 const sorted=[...terms].sort((x,y)=>Number(x.base.numerator*y.base.denominator-y.base.numerator*x.base.denominator));
 const grouped:GeometricTerm[]=[];
 for(const z of sorted){
  const prev=grouped.at(-1);
  if(prev&&eq(prev.base,z.base))grouped[grouped.length-1]={base:z.base,coefficient:a(prev.coefficient,z.coefficient)};
  else grouped.push(z);
 }
 return grouped.filter(z=>z.coefficient.numerator!==0n).at(-1);
}
const reduced=(v:Rational)=>normalize(v.numerator,v.denominator);
function reference(p:SequenceProblem):LimitValue|Rational {
 if(p.kind==="sequence-radical-ratio"){
  expect(p.a.numerator>0n&&p.e.numerator>0n).toBe(true);
  expect(p.c.numerator>0n&&p.remainder.numerator>0n).toBe(true);
  expect(a(p.e,p.lowerLinear).numerator>0n).toBe(true);
  return {kind:"finite",value:reduced(d(a(p.a,p.linear),a(p.e,p.lowerLinear)))};
 }
 if(p.kind==="sequence-exponential-ratio"){
  expect(p.denominator.every(t=>t.coefficient.numerator>0n&&t.base.numerator>0n)).toBe(true);
  const n=dominant(p.numerator),den=dominant(p.denominator);
  if(!den)throw Error("Empty denominator");
  if(!n||n.base.numerator*den.base.denominator<den.base.numerator*n.base.denominator)
   return {kind:"finite",value:q(0)};
  if(eq(n.base,den.base))return {kind:"finite",value:reduced(d(n.coefficient,den.coefficient))};
  return {kind:n.coefficient.numerator>0n?"positive-infinity":"negative-infinity"};
 }
 if(p.kind==="sequence-euler-product"){
  for(const z of p.factors)expect(a(a(q(1),z.b),z.a).numerator>0n).toBe(true);
  return reduced(p.factors.map(z=>m(z.a,z.c)).reduce(a,q(0)));
 }
 throw Error("Unexpected problem kind");
}
describe("MT-EDU-015A 288 cases",()=>{
 it("declares three families and twelve family-level combinations",()=>{
  expect(sequenceExtensionFamilies).toHaveLength(3);
  expect(sequenceExtensionFamilies.reduce((n,family)=>n+24*family.supportedDifficulties.length,0)).toBe(288);
 });
 for(const family of sequenceExtensionFamilies)for(const level of family.supportedDifficulties)
  it(`${family.id}/${level}: exact reference, 24 unique tasks, PL/EN`,()=>{
   const seen=new Set<string>(),kinds=new Set<string>();
   for(let v=0;v<24;v++){
    const task=makeUniversityTask(family.id,v,level);
    if(task.university.kind!=="sequence-radical-ratio"&&task.university.kind!=="sequence-exponential-ratio"&&task.university.kind!=="sequence-euler-product")throw Error("Wrong generator family");
    const answer=reference(task.university);
    seen.add(task.contentKey);
    for(const locale of ["pl","en"] as const){
     const local=localizeUniversity(task,locale);
     expect(local.question).toContain("n→+∞");
     expect(local.solution!.length).toBeGreaterThan(3);
     expect(local.solution!.every(step=>step.action.length>8&&step.reason.length>20)).toBe(true);
     const spec=local.answer;
     if("numerator" in answer){
      if(spec.kind==="scalar"){
       expect(answer.numerator).toBe(0n);
       expect(eq(spec.value,q(1))).toBe(true);
       expect(assessAnswer(spec,"1").kind).toBe("correct");
       expect(assessAnswer(spec,"2").kind).toBe("incorrect");
       expect(assessAnswer(spec,"1/0").kind).toBe("invalid");
      }else{
       expect(spec.kind).toBe("choice");
       if(spec.kind!=="choice")throw Error("Expected symbolic exponent");
       const label=`exp:${answer.numerator}/${answer.denominator}`;
       expect(spec.value).toBe(label);
       expect(assessAnswer(spec,{kind:"choice",value:label}).kind).toBe("correct");
       const other=spec.options.find(option=>option.value!==label);
       expect(other, "a distractor must be available").toBeDefined();
       expect(assessAnswer(spec,{kind:"choice",value:other!.value}).kind).toBe("incorrect");
       expect(assessAnswer(spec,{kind:"choice",value:"exp:invalid"}).kind).toBe("invalid");
      }
     }else{
      expect(spec.kind).toBe("limit");
      if(spec.kind!=="limit")throw Error("Expected limit answer");
      kinds.add(answer.kind);
      expect(spec.value.kind).toBe(answer.kind);
      if(answer.kind==="finite"&&spec.value.kind==="finite")expect(eq(spec.value.value,answer.value)).toBe(true);
      expect(assessAnswer(spec,{kind:"limit",classification:answer.kind,value:answer.kind==="finite"?f(answer.value):""}).kind).toBe("correct");
      expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
      if(answer.kind==="finite"){
       expect(assessAnswer(spec,{kind:"limit",classification:"finite",value:f(a(answer.value,q(1)))}).kind).toBe("incorrect");
       expect(assessAnswer(spec,{kind:"limit",classification:"finite",value:"1/0"}).kind).toBe("invalid");
       expect(assessAnswer(spec,{kind:"limit",classification:"positive-infinity",value:""}).kind).toBe("incorrect");
      }else{
       const reversed=answer.kind==="positive-infinity"?"negative-infinity":"positive-infinity";
       expect(assessAnswer(spec,{kind:"limit",classification:reversed,value:""}).kind).toBe("incorrect");
       expect(assessAnswer(spec,{kind:"limit",classification:"finite",value:"0"}).kind).toBe("incorrect");
      }
      expect(assessAnswer(spec,{kind:"limit",classification:"unrecognized",value:""}).kind).toBe("invalid");
     }
    }
   }
   expect(seen.size).toBe(24);
   if(family.id==="sequence-exponential-ratio")
    expect(kinds).toEqual(new Set(["finite","positive-infinity","negative-infinity"]));
  });
 it("does not reuse question content across difficulty levels",()=>{
  const seen=new Set<string>();
  for(const fam of sequenceExtensionFamilies)for(const level of fam.supportedDifficulties)
   for(let v=0;v<24;v++)seen.add(makeUniversityTask(fam.id,v,level).contentKey);
  expect(seen.size).toBe(288);
 });
});
