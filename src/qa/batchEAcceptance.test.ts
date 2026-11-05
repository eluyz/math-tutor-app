import {describe,it,expect} from "vitest";
import {batchE,batchECertificate,wrongBatchE,evaluate,sign} from "./batchE";
import {makeUniversityTask,localizeUniversity} from "../university/catalog";
import {assessAnswer,emptyAnswer} from "../answers";
import {auditCalculation} from "../university/audit";
import {polishLearningText} from "../../e2e/helpers/localization";
import {rational as r, subtractRational as sub, addRational as add, multiplyRational as mul} from "../rational";
import {formatRational as f} from "../answers";

describe("Batch E independent calculus method evidence",()=>{
  it("enforces the bounded manifest",()=>{
    expect(batchE.length).toBe(16);
    expect(new Set(batchE.map(x=>x.skill)).size).toBe(8);
    expect(new Set(batchE.map(x=>x.family+":"+x.level)).size).toBe(batchE.length);
    expect(batchE.flatMap(x=>x.variants).length).toBe(32);
    expect(batchE.every(x=>x.variants.every(v=>v>=0&&v<24))).toBe(true);
  });
  it("localizes area-between integration bounds across all existing PL/EN variants",()=>{
    for(const level of ["easy","medium","hard"] as const)for(let variant=0;variant<24;variant++){
      const task=makeUniversityTask("integral-area-between",variant,level),p=task.university;
      if(p.kind!=="integral-area-between")throw Error("Expected area-between task");
      const pl=localizeUniversity(task,"pl"),en=localizeUniversity(task,"en");
      const areaStep=(view:typeof en)=>{
        const step=view.solution?.find(s=>s.kind==="working"&&s.action.startsWith("A=∫"));
        if(step?.kind!=="working")throw Error("Expected displayed area integral bounds");
        return step.action;
      };
      expect(areaStep(pl)).toBe(`A=∫ od ${f(p.lower)} do ${f(p.upper)} |f(x)−g(x)| dx`);
      expect(areaStep(en)).toBe(`A=∫ from ${f(p.lower)} to ${f(p.upper)} |f(x)−g(x)| dx`);
      expect(areaStep(en)).not.toMatch(/\\bod\\b|\\bdo\\b/iu);
    }
  });
  it("has hand-derived controls independent of both generators and oracle formulas",()=>{
    const cases=[
      ["integral-parts","expert",{kind:"primitive",coefficients:["1","−3","6","−6"],hasConstant:true}],
      ["integral-recurring","expert",{kind:"primitive",coefficients:["3/2","1/2"],hasConstant:true}],
      ["integral-area-parabolas","hard","8"],
      ["integral-arc-length","hard","14/3"],
      ["integral-arc-parametric","advanced","5/3"],
    ] as const;
    for(const [family,level,expected] of cases)expect(batchECertificate(makeUniversityTask(family,0,level)).input).toEqual(expected);
  });
  for(const row of batchE)it(`${row.block} ${row.skill} ${row.family}/${row.level}: 24 exact variants × PL/EN`,()=>{
    const keys=new Set<string>(),orientations=new Set<number>(),forms=new Set<string>();
    for(let v=0;v<24;v++){
      const task=makeUniversityTask(row.family,v,row.level),p=task.university;
      const certificate=batchECertificate(task),expected=certificate.input;
      expect(certificate.checks.length).toBeGreaterThanOrEqual(2);
      keys.add(task.contentKey);
      if(typeof expected!=="string"&&expected.kind==="limit")forms.add(expected.classification);
      if(p.kind==="integral-improper-interior-pv"&&typeof expected!=="string"&&expected.kind==="choice")forms.add(expected.value);
      if(p.kind==="integral-area-parabolas")forms.add(String([sub(p.center,p.radius),add(p.center,p.radius)].filter(x=>sign(sub(x,p.lower))>0&&sign(sub(p.upper,x))>0).length));
      if(p.kind==="integral-arc-parametric")forms.add(sign(p.upper)<0?"negative":sign(p.lower)>0?"positive":"crosses-zero");
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
        const final=view.solution?.at(-1);
        expect(final?.kind).toBe("answer");
        if(final?.kind==="answer"){
          expect(assessAnswer(final.answer,expected),task.id+" final step").toEqual({kind:"correct"});
          if(final.answer.kind==="primitive")expect(final.answer.terms.map(x=>x.basis)).toEqual(certificate.basis);
        }
        const steps=view.solution?.filter(x=>x.kind==="working")??[];
        expect(steps.length).toBeGreaterThanOrEqual(3);
        for(const step of steps)if(step.kind==="working"){
          expect(step.action.trim()).not.toBe("");expect(step.reason.length).toBeGreaterThan(15);
          for(const calculation of step.calculations)expect(auditCalculation(calculation)).toBe(true);
        }
        // Check independent mathematical anchors in the displayed working as
        // well as the typed answer. Free prose is reviewed per bounded template.
        const actions=steps.map(x=>x.action).join(" ");
        const compact=(s:string)=>s.replace(/[·\s]/g,"");
        if(typeof expected!=="string"&&expected.kind==="primitive"){
          certificate.basis.forEach((basis,i)=>expect(compact(actions)).toContain(compact(`(${expected.coefficients[i]})${basis}`)));
          expect(actions).toMatch(/\+ ?C/);
        }
        if(p.kind==="integral-substitution-definite"){
          for(const x of [p.lower,p.upper])expect(actions).toContain(`x=${f(x)} ⇒ u=${f(evaluate([p.c,p.b,r(1)],x))}`);
        }
        if(p.kind==="integral-area-parabolas"){
          for(const x of [sub(p.center,p.radius),add(p.center,p.radius)])expect(actions).toContain(`x=${f(x)}`);
          expect(actions).toContain("|f(x)−g(x)|");
        }
        if(p.kind==="integral-improper-interior-power"||p.kind==="integral-improper-interior-pv"){
          expect(actions).toContain("ε");expect(actions).toContain("δ");
          if(p.kind==="integral-improper-interior-pv")expect(actions).toContain(`PV=(${f(p.k)})ln(${f(p.rightLength)}/${f(p.leftLength)})`);
          else if(p.power==="half"){
            expect(actions).toContain(`I_left=2(${f(p.k)})√(h−L)=2(${f(p.k)})(${f(p.leftRoot)})`);
            expect(actions).toContain(`I_right=2(${f(p.k)})√(R−h)=2(${f(p.k)})(${f(p.rightRoot)})`);
          }
        }
        if(p.kind==="integral-arc-length")expect(actions).toContain(`u: 1→${p.endRoot*p.endRoot}`);
        if(p.kind==="integral-arc-parametric")expect(actions).toContain(`√(x′(t)²+y′(t)²)=(${f(p.scale)})(t²+1)`);
        if(p.kind==="integral-area-horizontal-slices")expect(actions).toContain(`u: 0→${f(mul(p.radius,p.radius))}`);
        if(p.kind==="integral"&&p.method==="parts"&&sign(p.a)<0){
          expect(actions).not.toBe("");expect(view.explanation).not.toMatch(/signs alternate|znaki współczynników zmieniają się naprzemiennie/);
        }
        if(view===en)expect([view.question,view.hint,view.nextHint,view.explanation,...steps.map(x=>x.action+" "+x.reason)].join(" ")).not.toMatch(new RegExp(polishLearningText.source+"|\\blub\\b|\\bod .+ do ","iu"));
      }
    }
    expect(keys.size).toBe(24);
    if(row.family==="integral-improper-infinity"||row.family==="integral-improper-interior-power")expect(forms).toEqual(new Set(["finite","positive-infinity","negative-infinity"]));
    if(row.family==="integral-improper-interior-pv")expect(forms).toEqual(new Set(["divergent-pv-zero","divergent-pv-nonzero"]));
    if(row.family==="integral-area-parabolas")expect(forms).toEqual(new Set(["0","1","2"]));
    if(row.family==="integral-arc-parametric")expect(forms).toEqual(new Set(["negative","positive","crosses-zero"]));
    if(row.family==="integral-substitution-definite")expect(orientations).toEqual(new Set([-1,0,1]));
  });
});
