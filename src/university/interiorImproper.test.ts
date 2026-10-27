import {describe,it,expect} from "vitest";
import {interiorImproperFamilies,improperInteriorResult,type InteriorImproperProblem} from "./interiorImproper";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {rational as r,multiplyRational as mul,addRational as add,equalRational as eq,type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";

const val=(z:Rational)=>Number(z.numerator)/Number(z.denominator);
const independent=(p:InteriorImproperProblem)=>{
 if(p.kind==="integral-improper-interior-power"){
  if(p.power==="half")return {kind:"finite" as const,value:mul(r(2),mul(p.k,add(p.leftRoot,p.rightRoot)))};
  return {kind:(p.k.numerator>0n?"positive-infinity":"negative-infinity") as "positive-infinity"|"negative-infinity"};
 }
 return p.leftLength.numerator*p.rightLength.denominator===p.rightLength.numerator*p.leftLength.denominator?
  "divergent-pv-zero" as const:"divergent-pv-nonzero" as const;
};
describe("MT-EDU-028 P3B: interior improper integral and Cauchy PV independent audit",()=>{
 it("declares two families × three levels × 24 variants = 144",()=>{
  expect(interiorImproperFamilies.map(x=>x.id)).toEqual(["integral-improper-interior-power","integral-improper-interior-pv"]);
  expect(interiorImproperFamilies.reduce((sum,f)=>sum+24*f.supportedDifficulties.length,0)).toBe(144);
 });
 for(const family of interiorImproperFamilies)for(const level of family.supportedDifficulties)
 it(family.id+"/"+level+" audits 24 bilingual variants",()=>{
  const keys=new Set<string>(),classes=new Set<string>();
  for(let v=0;v<24;v++){
   const task=makeUniversityTask(family.id,v,level),p=task.university;
   if(p.kind!=="integral-improper-interior-power"&&p.kind!=="integral-improper-interior-pv")throw Error("Wrong task kind");
   keys.add(task.contentKey);expect(task.category).toBe("integrals");
   expect(p.k.numerator).not.toBe(0n);
   const want=independent(p),actual=improperInteriorResult(p);
   classes.add(typeof want==="string"?want:want.kind);
   if(typeof want==="string")expect(actual).toBe(want);
   else{
    expect(typeof actual).not.toBe("string");
    if(typeof actual!=="string"){
     expect(actual.kind).toBe(want.kind);
     if(actual.kind==="finite"&&want.kind==="finite")expect(eq(actual.value,want.value)).toBe(true);
    }
   }
   if(p.kind==="integral-improper-interior-power"){
    const a=val(p.leftRoot),b=val(p.rightRoot),k=val(p.k);
    expect(a).toBeGreaterThan(0);expect(b).toBeGreaterThan(0);
    // Each side has its own independent epsilon; probe the separately truncated integrals.
    for(const eps of [1e-2,1e-3]){
     const partial=(length:number)=>{
      if(p.power==="half")return 2*k*(length-Math.sqrt(eps));
      if(p.power==="one")return k*(2*Math.log(length)-Math.log(eps));
      return k*(1/eps-1/(length*length));
     };
     const L=partial(a),R=partial(b);
     if(p.power==="half"){
      expect(Math.abs(L-2*k*a)).toBeCloseTo(Math.abs(2*k*Math.sqrt(eps)),7);
      expect(Math.abs(R-2*k*b)).toBeCloseTo(Math.abs(2*k*Math.sqrt(eps)),7);
     }else{
      expect(Math.sign(L)).toBe(Math.sign(k));
      expect(Math.sign(R)).toBe(Math.sign(k));
     }
    }
   }else{
    const a=val(p.leftLength),b=val(p.rightLength),k=val(p.k);
    expect(a).toBeGreaterThan(0);expect(b).toBeGreaterThan(0);
    for(const eps of [1e-2,1e-4]){
     const L=k*(Math.log(eps)-Math.log(a)),R=k*(Math.log(b)-Math.log(eps));
     expect(Math.sign(L)).toBe(-Math.sign(k));expect(Math.sign(R)).toBe(Math.sign(k));
     expect(L+R).toBeCloseTo(k*Math.log(b/a),10);
    }
    expect(Math.abs(k*Math.log(b/a))<1e-9).toBe(want==="divergent-pv-zero");
   }
   for(const locale of ["pl","en"] as const){
    const view=localizeUniversity(task,locale),spec=view.answer;
    expect(view.contentKey).toBe(task.contentKey);
    expect(view.question.length).toBeGreaterThan(60);
    expect(view.solution?.length).toBeGreaterThanOrEqual(5);
    if(locale==="en")for(const copy of [view.title,view.question,view.hint,view.nextHint,view.explanation,...view.solution!.map(s=>s.action+" "+s.reason)])
     expect(copy).not.toMatch(polishLearningText);
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    if(p.kind==="integral-improper-interior-power"){
     expect(spec.kind).toBe("limit");if(spec.kind!=="limit"||typeof want==="string")throw Error("Expected limit spec");
     expect(spec.value.kind).toBe(want.kind);
     const text=want.kind==="finite"?f(want.value):"";
     expect(assessAnswer(spec,{kind:"limit",classification:want.kind,value:text}).kind).toBe("correct");
     expect(assessAnswer(spec,{kind:"limit",classification:want.kind==="finite"?"positive-infinity":"finite",value:"0"}).kind).toBe("incorrect");
     expect(assessAnswer(spec,{kind:"limit",classification:"finite",value:"1/0"}).kind).toBe("invalid");
    }else{
     expect(spec.kind).toBe("choice");if(spec.kind!=="choice"||typeof want!=="string")throw Error("Expected choice spec");
     expect(spec.value).toBe(want);expect(spec.options).toHaveLength(4);
     expect(new Set(spec.options.map(x=>x.label)).size).toBe(4);
     expect(assessAnswer(spec,{kind:"choice",value:want}).kind).toBe("correct");
     expect(assessAnswer(spec,{kind:"choice",value:"convergent"}).kind).toBe("incorrect");
     expect(assessAnswer(spec,{kind:"choice",value:"unsupported"}).kind).toBe("invalid");
    }
   }
  }
  expect(keys.size).toBe(24);
  expect(classes.size).toBe(family.id==="integral-improper-interior-power"?3:2);
 },45000);
 it("rejects invalid coefficients, bounds and unsupported variants",()=>{
  for(const f of interiorImproperFamilies){
   expect(()=>makeUniversityTask(f.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(f.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(f.id,0,"easy")).toThrow();
  }
  for(const f of interiorImproperFamilies){
   const p=makeUniversityTask(f.id,0,"hard").university;
   if(p.kind!=="integral-improper-interior-power"&&p.kind!=="integral-improper-interior-pv")throw Error("Wrong kind");
   expect(()=>improperInteriorResult({...p,k:r(0)})).toThrow();
   if(p.kind==="integral-improper-interior-power")expect(()=>improperInteriorResult({...p,leftRoot:r(0)})).toThrow();
   else expect(()=>improperInteriorResult({...p,rightLength:r(0)})).toThrow();
  }
 });
});
