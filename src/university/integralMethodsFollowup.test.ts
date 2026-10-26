import {describe,it,expect} from "vitest";
import {rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, equalRational as eq, type Rational} from "../rational";
import {formatRational as fmt, assessAnswer, emptyAnswer} from "../answers";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {integralMethodsFollowupFamilies, logDenominator, logNumerator, trigPartsCoefficients} from "./integralMethodsFollowup";
import {polishLearningText} from "../../e2e/helpers/localization";
const num=(v:Rational)=>Number(v.numerator)/Number(v.denominator);
const square=(x:Rational)=>mul(x,x);
const validInput=(coeffs:readonly Rational[],constant=true)=>({kind:"primitive" as const,coefficients:coeffs.map(fmt),hasConstant:constant});
describe("MT-EDU-024 P2F-B — independent I03/I04 mathematical audit",()=>{
 it("declares exactly two families and 144 variants",()=>{
  expect(integralMethodsFollowupFamilies.map(f=>f.id)).toEqual(["integral-log-substitution","integral-parts-trig-linear"]);
  expect(integralMethodsFollowupFamilies.reduce((n,f)=>n+24*f.supportedDifficulties.length,0)).toBe(144);
 });
 for(const family of integralMethodsFollowupFamilies)for(const level of family.supportedDifficulties){
  it(family.id+"/"+level+": all 24 exact variants, locales, differentiation and feedback",()=>{
   const unique=new Set<string>(),modes=new Set<string>();
   for(let v=0;v<24;v++){
    const task=makeUniversityTask(family.id,v,level),p=task.university;
    unique.add(task.contentKey);
    expect(task.category).toBe("integrals");
    const results:Rational[]=[];
    if(p.kind==="integral-log-substitution"){
      expect(p.a.numerator).not.toBe(0n);
      expect(p.k.numerator).not.toBe(0n);
      expect(p.c.numerator).toBeGreaterThan(0n);
      results.push(p.k);
      for(const x of [r(-2),r(-1,2),r(0),r(5,3)]){
        const u=add(mul(p.a,x),p.b);
        const denominator=add(square(u),p.c);
        const derivative=mul(mul(r(2),p.a),u);
        const numerator=mul(p.k,derivative);
        expect(eq(logDenominator(p,x),denominator)).toBe(true);
        expect(eq(logNumerator(p,x),numerator)).toBe(true);
        expect(denominator.numerator).toBeGreaterThan(0n);
        expect(eq(div(numerator,denominator),mul(p.k,div(derivative,denominator)))).toBe(true);
      }
      for(const x of [-2,-0.2,0,1.5]){
        const a=num(p.a),b=num(p.b),c=num(p.c),k=num(p.k),h=0.00001;
        const antiderivative=(z:number)=>k*Math.log((a*z+b)**2+c);
        const actual=k*2*a*(a*x+b)/((a*x+b)**2+c);
        expect(Math.abs((antiderivative(x+h)-antiderivative(x-h))/(2*h)-actual)).toBeLessThan(1e-7);
      }
    }else if(p.kind==="integral-parts-trig-linear"){
      modes.add(p.mode);
      expect(p.a.numerator).not.toBe(0n);
      expect(p.k.numerator).not.toBe(0n);
      const {first,second}=trigPartsCoefficients(p);
      results.push(first,second);
      if(p.mode==="sin"){
        expect(eq(sub(r(0),mul(first,p.a)),p.k)).toBe(true);
        expect(eq(add(first,mul(second,p.a)),r(0))).toBe(true);
      }else{
        expect(eq(mul(first,p.a),p.k)).toBe(true);
        expect(eq(sub(first,mul(second,p.a)),r(0))).toBe(true);
      }
      for(const x of [-1.4,-0.5,0,1.7]){
        const a=num(p.a),b=num(p.b),k=num(p.k),A=num(first),B=num(second),h=0.00001;
        const primitive=(z:number)=>p.mode==="sin"?
          A*z*Math.cos(a*z+b)+B*Math.sin(a*z+b):
          A*z*Math.sin(a*z+b)+B*Math.cos(a*z+b);
        const target=k*x*(p.mode==="sin"?Math.sin(a*x+b):Math.cos(a*x+b));
        expect(Math.abs((primitive(x+h)-primitive(x-h))/(2*h)-target)).toBeLessThan(1e-7);
      }
    }else throw Error("Unexpected family kind");
    for(const locale of ["pl","en"] as const){
      const shown=localizeUniversity(task,locale),ans=shown.answer;
      expect(shown.id).toBe(task.id);
      expect(shown.contentKey).toBe(task.contentKey);
      expect(shown.solution?.length).toBeGreaterThanOrEqual(6);
      expect(shown.question.length).toBeGreaterThan(60);
      if(locale==="en")for(const s of [shown.title,shown.question,shown.hint,shown.nextHint,shown.explanation,...shown.solution!.map(w=>w.action+" "+w.reason)])
        expect(s).not.toMatch(polishLearningText);
      expect(ans.kind).toBe("primitive");
      if(ans.kind!=="primitive")throw Error("Expected primitive coefficients");
      expect(ans.terms.map(z=>z.coefficient)).toEqual(results);
      expect(assessAnswer(ans,validInput(results)).kind).toBe("correct");
      expect(assessAnswer(ans,validInput(results,false))).toEqual({kind:"incorrect",reason:"missing-constant"});
      const wrong=[add(results[0],r(1)),...results.slice(1)];
      expect(assessAnswer(ans,validInput(wrong)).kind).toBe("incorrect");
      expect(assessAnswer(ans,emptyAnswer(ans)).kind).toBe("invalid");
      expect(assessAnswer(ans,{kind:"primitive",coefficients:["1/0",...results.slice(1).map(fmt)],hasConstant:true}).kind).toBe("invalid");
    }
   }
   expect(unique.size).toBe(24);
   if(family.id==="integral-parts-trig-linear")expect([...modes].sort()).toEqual(["cos","sin"]);
  },35000);
 }
 it("rejects invalid levels, bounds and degenerate coefficients",()=>{
  for(const family of integralMethodsFollowupFamilies){
    expect(()=>makeUniversityTask(family.id,-1,"hard")).toThrow();
    expect(()=>makeUniversityTask(family.id,24,"hard")).toThrow();
    expect(()=>makeUniversityTask(family.id,0,"easy")).toThrow();
  }
  const log=makeUniversityTask("integral-log-substitution",0,"hard").university;
  const trig=makeUniversityTask("integral-parts-trig-linear",0,"hard").university;
  if(log.kind!=="integral-log-substitution"||trig.kind!=="integral-parts-trig-linear")throw Error("Bad problem kind");
  expect(()=>logDenominator({...log,c:r(0)},r(0))).toThrow();
  expect(()=>logDenominator({...log,a:r(0)},r(0))).toThrow();
  expect(()=>logNumerator({...log,k:r(0)},r(0))).toThrow();
  expect(()=>trigPartsCoefficients({...trig,a:r(0)})).toThrow();
  expect(()=>trigPartsCoefficients({...trig,k:r(0)})).toThrow();
 });
});
