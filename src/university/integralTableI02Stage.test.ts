import {describe,expect,it} from "vitest";
import {
  rational as r, divideRational as div, multiplyRational as mul,
  subtractRational as sub, addRational as add, equalRational as equal,
  type Rational,
} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as fmt} from "../answers";
import {
  makeI02TableStage,presentI02TableStage,i02TableStageCoefficients,
  type I02TableStageProblem,type I02TableMode,
} from "./integralTableI02Stage";

const num=(v:Rational)=>Number(v.numerator)/Number(v.denominator);
const modes:readonly I02TableMode[]=["tan-square","cot-square","arcsin","radical-x"];
const input=(v:readonly Rational[],hasConstant=true)=>({
  kind:"primitive" as const,coefficients:v.map(fmt),hasConstant,
});

// Independent symbolic identities, not the staged answer-generation helper.
function independentCoefficients(p:I02TableStageProblem):readonly Rational[]{
  if(p.mode==="tan-square")return [div(p.k,p.a),sub(r(0),p.k)];
  if(p.mode==="cot-square")return [sub(r(0),div(p.k,p.a)),sub(r(0),p.k)];
  if(p.mode==="arcsin")return [div(p.k,p.a)];
  return [div(sub(r(0),p.k),mul(p.a,p.a))];
}
function sampleAt(p:I02TableStageProblem,coeff:readonly Rational[],x:number){
  const a=num(p.a),b=num(p.b),k=num(p.k);
  const u=a*x+b,ax=a*x;
  const c=coeff.map(num);
  if(p.mode==="tan-square"){
    const t=Math.tan(u);
    return {primitive:c[0]*t+c[1]*x,integrand:k*t*t};
  }
  if(p.mode==="cot-square"){
    const t=1/Math.tan(u);
    return {primitive:c[0]*t+c[1]*x,integrand:k*t*t};
  }
  if(p.mode==="arcsin")return {
    primitive:c[0]*Math.asin(u),integrand:k/Math.sqrt(1-u*u),
  };
  return {
    primitive:c[0]*Math.sqrt(1-ax*ax),
    integrand:k*x/Math.sqrt(1-ax*ax),
  };
}
function points(p:I02TableStageProblem):number[]{
  const a=num(p.a),b=num(p.b);
  const targets=p.mode==="cot-square"?[0.42,1.09]:
    p.mode==="tan-square"?[0.32,0.87]:[-0.64,0.68];
  return targets.map(t=>(t-(p.mode==="radical-x"?0:b))/a);
}

describe("I02 source-shaped table methods — stage-only bounded QA",()=>{
  it("uses exactly 24 public synthetic variants across four methods",()=>{
    const problems=Array.from({length:24},(_,v)=>makeI02TableStage(v));
    expect(new Set(problems.map(p=>p.mode)).size).toBe(4);
    for(const mode of modes)expect(problems.filter(p=>p.mode===mode)).toHaveLength(6);
    expect(new Set(problems.map(p=>[
      p.mode,fmt(p.a),fmt(p.b),fmt(p.k),
    ].join(":"))).size).toBe(24);
    expect(()=>makeI02TableStage(-1)).toThrow();
    expect(()=>makeI02TableStage(24)).toThrow();
    expect(()=>makeI02TableStage(1.5)).toThrow();
  });

  it("keeps PL tg/ctg and EN tan/cot consistent across the full displayed solution",()=>{
    for(let variant=0;variant<24;variant++){
      const p=makeI02TableStage(variant);
      if(p.mode!=="tan-square"&&p.mode!=="cot-square")continue;
      const pl=presentI02TableStage(p,"pl");
      const en=presentI02TableStage(p,"en");
      const plFn=p.mode==="tan-square"?"tg":"ctg";
      const enFn=p.mode==="tan-square"?"tan":"cot";
      for(const [shown,fn] of [[pl,plFn],[en,enFn]] as const){
        expect(shown.question).toContain(fn+"²(");
        expect(shown.solution.some(step=>step.action.startsWith(fn+"²(u)="))).toBe(true);
        expect(shown.solution.some(step=>step.action.startsWith("∫"+fn+"²(u)du="))).toBe(true);
        expect(shown.answer.kind).toBe("primitive");
        if(shown.answer.kind!=="primitive")throw Error("Primitive required");
        // Locale-invariant response basis is required for session switching.
        expect(shown.answer.terms[0].basis.startsWith(enFn+"(")).toBe(true);
        expect(shown.solution.some(step=>step.action.includes("F(x)=")&&
          step.action.includes(fn+"("))).toBe(true);
      }
      expect(pl.solution.some(step=>step.action.includes("∫tan²")||
        step.action.includes("∫cot²"))).toBe(false);
      expect(en.solution.some(step=>step.action.includes("∫tg²")||
        step.action.includes("∫ctg²"))).toBe(false);
      expect(pl.answer.kind).toBe("primitive");
      expect(en.answer.kind).toBe("primitive");
      if(pl.answer.kind!=="primitive"||en.answer.kind!=="primitive")
        throw Error("Expected same structured primitive answer");
      expect(pl.answer.terms).toEqual(en.answer.terms);
      expect(pl.question).toContain("tg=tan i ctg=cot");
      expect(en.question).not.toContain("tg=tan");
      expect(pl.solution.some(step=>step.reason.includes("tg(u)=tan(u)")&&
        step.reason.includes("ctg(u)=cot(u)"))).toBe(true);
      expect(pl.answer.terms.length).toBe(en.answer.terms.length);
      for(let i=0;i<pl.answer.terms.length;i++)
        expect(equal(pl.answer.terms[i].coefficient,en.answer.terms[i].coefficient)).toBe(true);
    }
  });

  for(const variant of Array.from({length:24},(_,i)=>i)){
    it("variant "+variant+" independent calculus, locales and grading",()=>{
      const p=makeI02TableStage(variant);
      const oracle=independentCoefficients(p);
      const produced=i02TableStageCoefficients(p);
      expect(produced.length).toBe(oracle.length);
      produced.forEach((v,i)=>expect(equal(v,oracle[i])).toBe(true));
      for(const x of points(p)){
        const h=1e-6;
        const f0=sampleAt(p,produced,x);
        const l=sampleAt(p,produced,x-h),u=sampleAt(p,produced,x+h);
        const derivative=(u.primitive-l.primitive)/(2*h);
        expect(Number.isFinite(f0.integrand)).toBe(true);
        expect(Number.isFinite(derivative)).toBe(true);
        expect(Math.abs(derivative-f0.integrand))
          .toBeLessThan(1e-5*Math.max(1,Math.abs(f0.integrand)));
      }
      for(const locale of ["pl","en"] as const){
        const shown=presentI02TableStage(p,locale),spec=shown.answer;
        expect(shown.question).toContain("∫");
        expect(shown.hint.length).toBeGreaterThan(20);
        expect(shown.nextHint.length).toBeGreaterThan(20);
        expect(shown.solution.length).toBeGreaterThanOrEqual(4);
        expect(shown.solution.at(-1)?.kind).toBe("answer");
        expect(shown.solution.some(step=>step.action.includes("+C"))).toBe(true);
        if(locale==="en"){
          for(const value of [shown.question,shown.hint,shown.nextHint,shown.explanation,
            ...shown.solution.map(step=>step.action+" "+step.reason)])
            expect(value).not.toMatch(/[ąćęłńóśźż]/i);
        }
        expect(spec.kind).toBe("primitive");
        if(spec.kind!=="primitive")throw Error("Expected primitive answer");
        expect(spec.terms.length).toBe(oracle.length);
        spec.terms.forEach((term,i)=>expect(equal(term.coefficient,oracle[i])).toBe(true));
        expect(assessAnswer(spec,input(oracle))).toEqual({kind:"correct"});
        expect(assessAnswer(spec,input(oracle,false)))
          .toEqual({kind:"incorrect",reason:"missing-constant"});
        expect(assessAnswer(spec,input([add(oracle[0],r(1)),...oracle.slice(1)])))
          .toEqual({kind:"incorrect"});
        expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
        expect(assessAnswer(spec,{
          kind:"primitive",coefficients:["1/0",...oracle.slice(1).map(fmt)],hasConstant:true,
        }).kind).toBe("invalid");
        expect(assessAnswer(spec,{
          kind:"primitive",coefficients:[],hasConstant:true,
        }).kind).toBe("invalid");
        if(p.mode==="tan-square"||p.mode==="cot-square"){
          expect(spec.terms.length).toBe(2);
          expect(shown.question).toContain(locale==="pl"?"spójnym":"connected");
        }else{
          expect(spec.terms.length).toBe(1);
          expect(shown.question).toContain("|");
        }
      }
    });
  }
  it("refuses degenerate inner slope or zero integrand",()=>{
    for(const mode of modes){
      const p={...makeI02TableStage(0),mode};
      expect(()=>i02TableStageCoefficients({...p,a:r(0)})).toThrow();
      expect(()=>i02TableStageCoefficients({...p,k:r(0)})).toThrow();
      expect(()=>presentI02TableStage({...p,a:r(0)},"pl")).toThrow();
    }
  });
});
