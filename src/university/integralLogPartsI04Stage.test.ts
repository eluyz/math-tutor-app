import {describe,it,expect} from "vitest";
import {rational as r, addRational as add, subtractRational as sub, multiplyRational as mul,
  equalRational as equal, type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as fmt} from "../answers";
import {
  makeI04LogPartsStage,presentI04LogPartsStage,i04LogPartsCoefficients,
  type I04LogPartsStageProblem,
} from "./integralLogPartsI04Stage";

const num=(v:Rational)=>Number(v.numerator)/Number(v.denominator);
const input=(coefficients:readonly Rational[],hasConstant=true)=>({
  kind:"primitive" as const,coefficients:coefficients.map(fmt),hasConstant,
});
function oracle(p:I04LogPartsStageProblem,x:number){
  const b=num(p.b),k=num(p.k),u=x+b,L=Math.log(u);
  const antiderivative=k*(0.5*u*u*L-0.25*u*u-b*(u*L-u));
  return {antiderivative,integrand:k*x*L,u};
}

describe("I04 integration by parts with shifted logarithms — stage",()=>{
  it("has 24 distinct public synthetic variants and both slope/shift signs",()=>{
    const all=Array.from({length:24},(_,i)=>makeI04LogPartsStage(i));
    expect(new Set(all.map(p=>fmt(p.k)+":"+fmt(p.b))).size).toBe(24);
    expect(all.some(p=>p.b.numerator<0n)).toBe(true);
    expect(all.some(p=>p.b.numerator===0n)).toBe(true);
    expect(all.some(p=>p.b.numerator>0n)).toBe(true);
    expect(all.some(p=>p.k.numerator<0n)).toBe(true);
    for(const v of [-1,24,1.5,NaN,Infinity])expect(()=>makeI04LogPartsStage(v)).toThrow();
  });
  for(let variant=0;variant<24;variant++){
    it("variant "+variant+": exact differential identity, locale and grading",()=>{
      const p=makeI04LogPartsStage(variant),c=i04LogPartsCoefficients(p);
      const coeffs=[c.squareLog,c.square,c.linearLog,c.linear];
      // The derivative coefficients reduce to exactly k (u-b) ln(u):
      // 2A=k; A+2B=0; C=-kb; C+D=0.
      expect(equal(mul(r(2),c.squareLog),p.k)).toBe(true);
      expect(equal(add(c.squareLog,mul(r(2),c.square)),r(0))).toBe(true);
      expect(equal(c.linearLog,sub(r(0),mul(p.k,p.b)))).toBe(true);
      expect(equal(add(c.linearLog,c.linear),r(0))).toBe(true);
      for(const u of [0.3,0.8,1.5,3]){
        const x=u-num(p.b),h=1e-6;
        const at=oracle(p,x),lo=oracle(p,x-h),hi=oracle(p,x+h);
        expect(at.u).toBeGreaterThan(0);
        expect(lo.u).toBeGreaterThan(0);
        expect(hi.u).toBeGreaterThan(0);
        const numerical=(hi.antiderivative-lo.antiderivative)/(2*h);
        expect(Math.abs(numerical-at.integrand)).toBeLessThan(1e-5*Math.max(1,Math.abs(at.integrand)));
      }
      const pl=presentI04LogPartsStage(p,"pl"),en=presentI04LogPartsStage(p,"en");
      expect(pl.answer).toEqual(en.answer);
      for(const [shown,locale] of [[pl,"pl"],[en,"en"]] as const){
        expect(shown.question).toContain("∫");
        expect(shown.question).toContain("ln(");
        expect(shown.question).toContain(locale==="pl"?"Dziedzina":"Domain");
        expect(shown.hint.length).toBeGreaterThan(20);
        expect(shown.nextHint.length).toBeGreaterThan(20);
        expect(shown.solution.length).toBeGreaterThanOrEqual(6);
        expect(shown.solution.at(-1)?.kind).toBe("answer");
        expect(shown.solution.some(s=>s.action.includes("F′(x)="))).toBe(true);
        expect(shown.question).toContain("+C");
        if(locale==="en")for(const s of [shown.question,shown.hint,shown.nextHint,
          shown.explanation,...shown.solution.map(t=>t.action+" "+t.reason)])
          expect(s).not.toMatch(/[ąćęłńóśźż]/i);
        const answer=shown.answer;
        expect(answer.kind).toBe("primitive");
        if(answer.kind!=="primitive")throw Error("Expected primitive");
        expect(answer.terms).toHaveLength(4);
        answer.terms.forEach((term,i)=>expect(equal(term.coefficient,coeffs[i])).toBe(true));
        expect(assessAnswer(answer,input(coeffs))).toEqual({kind:"correct"});
        expect(assessAnswer(answer,input(coeffs,false)))
          .toEqual({kind:"incorrect",reason:"missing-constant"});
        expect(assessAnswer(answer,input([add(coeffs[0],r(1)),...coeffs.slice(1)])).kind)
          .toBe("incorrect");
        expect(assessAnswer(answer,emptyAnswer(answer)).kind).toBe("invalid");
        expect(assessAnswer(answer,{
          kind:"primitive",coefficients:["1/0",...coeffs.slice(1).map(fmt)],hasConstant:true,
        }).kind).toBe("invalid");
      }
    });
  }
  it("rejects zero k and remains unregistered until integration PR",()=>{
    const p=makeI04LogPartsStage(0);
    expect(()=>i04LogPartsCoefficients({...p,k:r(0)})).toThrow();
    expect(()=>presentI04LogPartsStage({...p,k:r(0)},"pl")).toThrow();
  });
});
