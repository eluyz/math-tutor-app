import {describe,it,expect} from "vitest";
import {sequenceFollowupFamilies,powerExponentialLimit,classifySequenceBehaviour} from "./sequenceFollowup";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {q,a,m,d,s,eq,auditCalculation} from "./audit";
import {assessAnswer,emptyAnswer,formatRational} from "../answers";
import type {SequenceProblem} from "./schema";
import type {Rational} from "../rational";

type Power=Extract<SequenceProblem,{kind:"sequence-power-exponential"}>;
type Behaviour=Extract<SequenceProblem,{kind:"sequence-monotonic-bounded"}>;
const ratio=(x:Rational,y:Rational)=>q(x.numerator*y.denominator,x.denominator*y.numerator);
const comparator=(x:Rational,y:Rational)=>x.numerator*y.denominator-y.numerator*x.denominator;
const refPower=(p:Power)=>{
 const base=comparator(p.numeratorBase,p.denominatorBase);
 const degree=p.numeratorDegree-p.denominatorDegree;
 const coeff=ratio(p.coefficient,p.denominatorCoefficient);
 if(base<0||base===0&&degree<0)return {kind:"finite",value:q(0)} as const;
 if(base===0&&degree===0)return {kind:"finite",value:coeff} as const;
 return {kind:coeff.numerator>0n?"positive-infinity":"negative-infinity"} as const;
};
const refBehaviour=(p:Behaviour)=>{
 const values=Array.from({length:100},(_,i)=>{
  const n=i+1;
  if(p.mode==="linear")return a(p.offset,m(p.amplitude,q(n)));
  const term=ratio(p.amplitude,q(n+p.shift));
  return a(p.offset,p.mode==="alternating"&&n%2===1?m(q(-1),term):term);
 });
 const cmp=values.slice(1).map((v,i)=>comparator(v,values[i]));
 const increasing=cmp.every(z=>z>0n),decreasing=cmp.every(z=>z<0n);
 const bounded=p.mode!=="linear"; // provable: rational reciprocal/alternating or nonzero-slope linear
 return {values,kind:increasing?(bounded?"increasing-bounded":"increasing-unbounded"):
   decreasing?(bounded?"decreasing-bounded":"decreasing-unbounded"):"neither-bounded"};
};
describe("MT-EDU-020 P1A: non-duplicating sequence gaps",()=>{
 it("registers exactly 144 new exercises",()=>{
  expect(sequenceFollowupFamilies.map(f=>f.id)).toEqual([
   "sequence-power-exponential","sequence-monotonic-bounded"]);
  expect(sequenceFollowupFamilies.reduce((n,f)=>n+f.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const family of sequenceFollowupFamilies)for(const level of family.supportedDifficulties)
 it(family.id+" / "+level+" — 24 bilingual independent proofs",()=>{
  const unique=new Set<string>(),classes=new Set<string>();
  for(let variant=0;variant<24;variant++){
   const task=makeUniversityTask(family.id,variant,level),p=task.university;
   unique.add(task.contentKey);
   expect(task.category).toBe("sequence-limits");
   let expected:ReturnType<typeof refPower>|ReturnType<typeof refBehaviour>["kind"];
   if(p.kind==="sequence-power-exponential"){
    expected=refPower(p);
    expect(p.denominatorCoefficient.numerator>0n&&p.numeratorBase.numerator>0n&&p.denominatorBase.numerator>0n).toBe(true);
    const obtained=powerExponentialLimit(p);
    expect(obtained.kind).toBe(expected.kind);
    if(expected.kind==="finite"&&obtained.kind==="finite")expect(eq(obtained.value,expected.value)).toBe(true);
    classes.add(expected.kind+":"+((expected.kind==="finite"&&expected.value.numerator!==0n)?"nonzero":""));
   }else if(p.kind==="sequence-monotonic-bounded"){
    const ref=refBehaviour(p);
    expected=ref.kind;
    expect(classifySequenceBehaviour(p)).toBe(expected);
    const signs=ref.values.slice(1).map((v,i)=>comparator(v,ref.values[i]));
    if(p.mode==="alternating")expect(signs.some(z=>z>0n)&&signs.some(z=>z<0n)).toBe(true);
    if(p.mode!=="linear"){
     for(const val of ref.values)
      expect(comparator(val,a(p.offset,q(-200)))>0n&&comparator(val,a(p.offset,q(200)))<0n).toBe(true);
    }
    classes.add(expected);
   }else throw Error("Wrong P1A generator type");
   for(const locale of ["pl","en"] as const){
    const rendered=localizeUniversity(task,locale),ans=rendered.answer;
    expect(rendered.question).toContain("n");
    expect(rendered.solution!.length).toBeGreaterThanOrEqual(4);
    expect(rendered.hint).not.toBe("");
    expect(rendered.nextHint).not.toBe("");
    if(locale==="en")expect(rendered.question).not.toMatch(/[ąćęłńóśźż]/i);
    for(const step of rendered.solution!)if(step.kind==="working"){
     expect(step.action.length).toBeGreaterThan(6);
     expect(step.reason.length).toBeGreaterThan(10);
     for(const calc of step.calculations)expect(auditCalculation(calc)).toBe(true);
    }
    expect(assessAnswer(ans,emptyAnswer(ans)).kind).toBe("invalid");
    if(typeof expected==="string"){
      expect(ans.kind).toBe("choice");
      if(ans.kind!=="choice")throw Error("Choice expected");
      expect(ans.value).toBe(expected);
      expect(ans.options.map(o=>o.value)).toContain(expected);
      expect(assessAnswer(ans,{kind:"choice",value:expected}).kind).toBe("correct");
      const wrong=ans.options.find(o=>o.value!==expected)!;
      expect(assessAnswer(ans,{kind:"choice",value:wrong.value}).kind).toBe("incorrect");
      expect(assessAnswer(ans,{kind:"choice",value:"not-a-class"}).kind).toBe("invalid");
    }else{
      expect(ans.kind).toBe("limit");
      if(ans.kind!=="limit")throw Error("Limit answer expected");
      expect(ans.value.kind).toBe(expected.kind);
      const valid={kind:"limit" as const,classification:expected.kind,value:expected.kind==="finite"?formatRational(expected.value):""};
      expect(assessAnswer(ans,valid).kind).toBe("correct");
      expect(assessAnswer(ans,{kind:"limit",classification:expected.kind==="finite"?"positive-infinity":"finite",value:"0"}).kind).toBe("incorrect");
    }
   }
  }
  expect(unique.size).toBe(24);
  if(family.id==="sequence-monotonic-bounded")expect(classes).toEqual(new Set([
    "decreasing-bounded","increasing-bounded","increasing-unbounded","decreasing-unbounded","neither-bounded"
  ]));
  else {
   expect(classes.has("positive-infinity:")).toBe(true);
   expect(classes.has("negative-infinity:")).toBe(true);
   expect(classes.has("finite:nonzero")).toBe(true);
   expect(classes.has("finite:")).toBe(true);
  }
 },30000);
 it("rejects malformed payloads and unsupported levels",()=>{
  for(const family of sequenceFollowupFamilies){
   expect(()=>makeUniversityTask(family.id,-1,family.supportedDifficulties[0])).toThrow();
   expect(()=>makeUniversityTask(family.id,24,family.supportedDifficulties[0])).toThrow();
   expect(()=>makeUniversityTask(family.id,1.5,family.supportedDifficulties[0])).toThrow();
   expect(()=>makeUniversityTask(family.id,0,"easy")).toThrow();
  }
  const power=makeUniversityTask("sequence-power-exponential",0,"hard").university;
  if(power.kind!=="sequence-power-exponential")throw Error("unexpected");
  expect(()=>powerExponentialLimit({...power,denominatorCoefficient:q(0)})).toThrow();
  expect(()=>powerExponentialLimit({...power,numeratorDegree:-1})).toThrow();
  const behavior=makeUniversityTask("sequence-monotonic-bounded",0,"hard").university;
  if(behavior.kind!=="sequence-monotonic-bounded")throw Error("unexpected");
  expect(()=>classifySequenceBehaviour({...behavior,amplitude:q(0)})).toThrow();
  expect(()=>classifySequenceBehaviour({...behavior,shift:-1})).toThrow();
 });
});
