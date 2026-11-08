import {describe,it,expect} from "vitest";
import {
  rational as r,addRational as add,multiplyRational as mul,
  subtractRational as sub,equalRational as eq,type Rational,
} from "../rational";
import {formatRational as fmt,assessAnswer,emptyAnswer} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";
import {
  makeQuadraticTrigParts,quadraticTrigPartsCoefficients,
  presentQuadraticTrigParts,integralPartsTrigQuadraticFamily,
} from "./integralPartsTrigQuadratic";

const num=(x:Rational)=>Number(x.numerator)/Number(x.denominator);
const input=(coeffs:readonly Rational[],hasConstant=true)=>({
  kind:"primitive" as const,coefficients:coeffs.map(fmt),hasConstant,
});

describe("I04 staged two-pass quadratic trigonometric integrals",()=>{
  it("keeps the family outside the shared catalog until serialized integration",()=>{
    expect(integralPartsTrigQuadraticFamily.id).toBe("integral-parts-trig-quadratic");
    expect(integralPartsTrigQuadraticFamily.supportedDifficulties)
      .toEqual(["hard","advanced","expert"]);
  });

  for(const level of integralPartsTrigQuadraticFamily.supportedDifficulties){
    it(level+": 24 distinct variants, exact independent derivative, PL/EN and grading",()=>{
      const seen=new Set<string>(),modes=new Set<string>();
      for(let variant=0;variant<24;variant++){
        const p=makeQuadraticTrigParts(variant,level);
        expect(p.kind).toBe("integral-parts-trig-quadratic");
        expect(p.a.numerator).not.toBe(0n);
        expect(p.k.numerator).not.toBe(0n);
        modes.add(p.mode);
        seen.add([p.mode,fmt(p.a),fmt(p.b),fmt(p.k)].join("|"));
        const {first,second,third}=quadraticTrigPartsCoefficients(p);
        const [a,k]=[p.a,p.k];
        // Differentiation of A*x²*cos+B*x*sin+C*cos for the sine case;
        // differentiation of A*x²*sin+B*x*cos+C*sin for the cosine case.
        // These independently checked coefficient identities are not
        // reconstructed from the production recurrence.
        if(p.mode==="sin"){
          expect(eq(sub(r(0),mul(a,first)),k)).toBe(true); // x² sin
          expect(eq(add(mul(r(2),first),mul(a,second)),r(0))).toBe(true); // x cos
          expect(eq(sub(second,mul(a,third)),r(0))).toBe(true); // sin
        }else{
          expect(eq(mul(a,first),k)).toBe(true); // x² cos
          expect(eq(sub(mul(r(2),first),mul(a,second)),r(0))).toBe(true); // x sin
          expect(eq(add(second,mul(a,third)),r(0))).toBe(true); // cos
        }
        const aValue=num(a),bValue=num(p.b),kValue=num(k);
        const primitive=(x:number)=>{
          const theta=aValue*x+bValue;
          return p.mode==="sin"
            ? num(first)*x*x*Math.cos(theta)+num(second)*x*Math.sin(theta)+num(third)*Math.cos(theta)
            : num(first)*x*x*Math.sin(theta)+num(second)*x*Math.cos(theta)+num(third)*Math.sin(theta);
        };
        for(const x of [-1.4,-0.5,0,0.8,2.1]){
          const h=0.00001;
          const derivative=(primitive(x+h)-primitive(x-h))/(2*h);
          const target=kValue*x*x*(p.mode==="sin"?Math.sin(aValue*x+bValue):Math.cos(aValue*x+bValue));
          expect(Math.abs(derivative-target)).toBeLessThan(1e-6*Math.max(1,Math.abs(target)));
        }
        const coeffs=[first,second,third];
        for(const locale of ["pl","en"] as const){
          const shown=presentQuadraticTrigParts(p,locale),ans=shown.answer;
          expect(shown.question).toContain("∫");
          expect(shown.hint.length).toBeGreaterThan(30);
          expect(shown.nextHint.length).toBeGreaterThan(30);
          expect(shown.hint).not.toBe(shown.nextHint);
          expect(shown.solution.length).toBeGreaterThanOrEqual(7);
          if(locale==="en")
            for(const str of [shown.question,shown.hint,shown.nextHint,shown.explanation,
              ...shown.solution.map(step=>step.action+" "+step.reason)])
              expect(str).not.toMatch(polishLearningText);
          expect(ans.kind).toBe("primitive");
          if(ans.kind!=="primitive")throw Error("Expected primitive coefficients");
          expect(ans.terms.map(x=>x.coefficient)).toEqual(coeffs);
          expect(ans.terms.map(x=>x.basis)).toEqual(
            [p.mode==="sin"?"x^2 cos":"x^2 sin",p.mode==="sin"?"x sin":"x cos",p.mode==="sin"?"cos":"sin"]
              .map((s)=>s+"("+ "("+fmt(p.a)+")x+("+fmt(p.b)+")"+")")
          );
          expect(assessAnswer(ans,input(coeffs))).toEqual({kind:"correct"});
          expect(assessAnswer(ans,input(coeffs,false)))
            .toEqual({kind:"incorrect",reason:"missing-constant"});
          expect(assessAnswer(ans,input([add(first,r(1)),second,third])).kind).toBe("incorrect");
          expect(assessAnswer(ans,input([first,add(second,r(1)),third])).kind).toBe("incorrect");
          expect(assessAnswer(ans,input([first,second,add(third,r(1))])).kind).toBe("incorrect");
          expect(assessAnswer(ans,emptyAnswer(ans)).kind).toBe("invalid");
          expect(assessAnswer(ans,{
            kind:"primitive",coefficients:["1/0",fmt(second),fmt(third)],hasConstant:true,
          }).kind).toBe("invalid");
        }
      }
      expect(seen.size).toBe(24);
      expect([...modes].sort()).toEqual(["cos","sin"]);
    },35000);
  });

  it("hand-derived positive, negative and borderline controls",()=>{
    const sin=makeQuadraticTrigParts(0,"hard");
    const cos=makeQuadraticTrigParts(1,"hard");
    expect(sin.mode).toBe("sin");
    expect(cos.mode).toBe("cos");
    const a=quadraticTrigPartsCoefficients(sin);
    expect(eq(a.first,r(-1))).toBe(true);
    expect(eq(a.second,r(2))).toBe(true);
    expect(eq(a.third,r(2))).toBe(true);
    const b=quadraticTrigPartsCoefficients(cos);
    expect(eq(b.first,r(-1,2))).toBe(true);
    expect(eq(b.second,r(1,2))).toBe(true);
    expect(eq(b.third,r(1,4))).toBe(true);
    // Invalid inputs are not silently simplified to zero or reinterpreted.
    expect(()=>makeQuadraticTrigParts(-1,"hard")).toThrow();
    expect(()=>makeQuadraticTrigParts(24,"hard")).toThrow();
    expect(()=>makeQuadraticTrigParts(0,"easy")).toThrow();
    expect(()=>makeQuadraticTrigParts(0.5,"hard")).toThrow();
    expect(()=>quadraticTrigPartsCoefficients({...sin,a:r(0)})).toThrow();
    expect(()=>quadraticTrigPartsCoefficients({...sin,k:r(0)})).toThrow();
  });
});
