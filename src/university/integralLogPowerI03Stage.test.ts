import {describe,it,expect} from "vitest";
import {
  rational as r, addRational as add, multiplyRational as mul,
  divideRational as div, equalRational as equal, type Rational,
} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as fmt} from "../answers";
import {
  makeI03LogPowerStage,presentI03LogPowerStage,i03LogPowerCoefficient,
  type I03LogPowerStageProblem,
} from "./integralLogPowerI03Stage";

const num=(v:Rational)=>Number(v.numerator)/Number(v.denominator);
const response=(value:Rational,hasConstant=true)=>({
  kind:"primitive" as const,coefficients:[fmt(value)],hasConstant,
});

function independentAt(p:I03LogPowerStageProblem,x:number){
  const a=num(p.a),b=num(p.b),k=num(p.k),m=p.exponent;
  const u=a*x+b,t=Math.log(u);
  const antiderivative=k/(m+1)*Math.pow(t,m+1);
  const integrand=k*a*Math.pow(t,m)/u;
  return {antiderivative,integrand,u};
}

describe("I03 logarithmic power substitution — staged synthetic family",()=>{
  it("has exactly 24 unique cases and both log powers",()=>{
    const all=Array.from({length:24},(_,i)=>makeI03LogPowerStage(i));
    const keys=new Set(all.map(p=>[
      fmt(p.a),fmt(p.b),fmt(p.k),p.exponent,
    ].join(":")));
    expect(keys.size).toBe(24);
    expect(all.filter(p=>p.exponent===1)).toHaveLength(12);
    expect(all.filter(p=>p.exponent===2)).toHaveLength(12);
    expect(all.some(p=>p.a.numerator<0n)).toBe(true);
    expect(all.some(p=>p.k.numerator<0n)).toBe(true);
    for(const invalid of [-1,24,1.5,NaN,Infinity])
      expect(()=>makeI03LogPowerStage(invalid)).toThrow();
  });

  for(let variant=0;variant<24;variant++){
    it("variant "+variant+": exact algebra, domain, PL/EN and grading",()=>{
      const p=makeI03LogPowerStage(variant);
      const coeff=i03LogPowerCoefficient(p);
      // Independent exact-rational identity: (m+1)*a*coeff = k*a.
      expect(equal(mul(mul(r(p.exponent+1),p.a),coeff),mul(p.k,p.a))).toBe(true);
      for(const targetU of [0.25,0.8,1.4,3]){
        const x=(targetU-num(p.b))/num(p.a),h=1e-6;
        const now=independentAt(p,x);
        const minus=independentAt(p,x-h);
        const plus=independentAt(p,x+h);
        expect(now.u).toBeGreaterThan(0);
        expect(minus.u).toBeGreaterThan(0);
        expect(plus.u).toBeGreaterThan(0);
        const derivative=(plus.antiderivative-minus.antiderivative)/(2*h);
        expect(Math.abs(derivative-now.integrand)).toBeLessThan(
          1e-5*Math.max(1,Math.abs(now.integrand)));
      }
      const pl=presentI03LogPowerStage(p,"pl");
      const en=presentI03LogPowerStage(p,"en");
      expect(pl.answer).toEqual(en.answer);
      for(const [shown,locale] of [[pl,"pl"],[en,"en"]] as const){
        expect(shown.question).toContain("∫");
        expect(shown.question).toContain(locale==="pl"?"Dziedzina":"Domain");
        expect(shown.question).toContain("+C");
        expect(shown.question).toContain(p.a.numerator>0n?"x>":"x<");
        expect(shown.hint).toContain("u′/u");
        expect(shown.nextHint.length).toBeGreaterThan(20);
        expect(shown.solution.length).toBeGreaterThanOrEqual(5);
        expect(shown.solution.at(-1)?.kind).toBe("answer");
        expect(shown.solution.some(s=>s.action.includes("F′(x)="))).toBe(true);
        if(locale==="en")for(const msg of [shown.question,shown.hint,
          shown.nextHint,shown.explanation,...shown.solution.map(s=>s.action+" "+s.reason)])
          expect(msg).not.toMatch(/[ąćęłńóśźż]/i);
        expect(shown.answer.kind).toBe("primitive");
        if(shown.answer.kind!=="primitive")throw Error("Expected primitive answer");
        expect(shown.answer.terms).toHaveLength(1);
        expect(equal(shown.answer.terms[0].coefficient,div(p.k,r(p.exponent+1)))).toBe(true);
        expect(assessAnswer(shown.answer,response(coeff))).toEqual({kind:"correct"});
        expect(assessAnswer(shown.answer,response(coeff,false)))
          .toEqual({kind:"incorrect",reason:"missing-constant"});
        expect(assessAnswer(shown.answer,response(add(coeff,r(1)))))
          .toEqual({kind:"incorrect"});
        expect(assessAnswer(shown.answer,emptyAnswer(shown.answer)).kind).toBe("invalid");
        expect(assessAnswer(shown.answer,{
          kind:"primitive",coefficients:["1/0"],hasConstant:true,
        }).kind).toBe("invalid");
      }
    });
  }

  it("rejects a zero derivative, zero scale or unsupported exponent",()=>{
    const p=makeI03LogPowerStage(0);
    expect(()=>i03LogPowerCoefficient({...p,a:r(0)})).toThrow();
    expect(()=>i03LogPowerCoefficient({...p,k:r(0)})).toThrow();
    expect(()=>i03LogPowerCoefficient({...p,exponent:3 as 1|2})).toThrow();
    expect(()=>presentI03LogPowerStage({...p,a:r(0)},"en")).toThrow();
  });
});
