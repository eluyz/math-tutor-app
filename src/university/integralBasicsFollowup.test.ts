import {describe,it,expect} from "vitest";
import {rational as r, addRational as add, multiplyRational as mul, divideRational as div, equalRational as eq, type Rational} from "../rational";
import {formatRational as fmt, assessAnswer, emptyAnswer} from "../answers";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {integralBasicsFollowupFamilies,expandedProduct,arctanScale,type IntegralBasicsFollowupProblem} from "./integralBasicsFollowup";
import {polishLearningText} from "../../e2e/helpers/localization";
const num=(v:Rational)=>Number(v.numerator)/Number(v.denominator);
const pow=(v:Rational,n:number)=>Array.from({length:n},()=>v).reduce(mul,r(1));
const input=(values:readonly Rational[],constant=true)=>({kind:"primitive" as const,coefficients:values.map(fmt),hasConstant:constant});
describe("MT-EDU-024 P2F-A — independent audits for I01/I02",()=>{
 it("registers two genuinely distinct families, 144 variants total",()=>{
  expect(integralBasicsFollowupFamilies.map(f=>f.id)).toEqual(["integral-direct-product","integral-table-arctan"]);
  expect(integralBasicsFollowupFamilies.reduce((n,f)=>n+24*f.supportedDifficulties.length,0)).toBe(144);
 });
 for(const family of integralBasicsFollowupFamilies)for(const level of family.supportedDifficulties){
  it(family.id+"/"+level+": checks all 24 answers, domains, localizations and feedback",()=>{
   const seen=new Set<string>();
   for(let variant=0;variant<24;variant++){
    const task=makeUniversityTask(family.id,variant,level);
    const p=task.university as IntegralBasicsFollowupProblem;
    expect(p.kind).toBe(family.id);
    expect(task.category).toBe("integrals");
    seen.add(task.contentKey);
    let coefficients:Rational[];
    if(p.kind==="integral-direct-product"){
      const [b,a]=p.linear,[e,d,c]=p.quadratic;
      expect(a.numerator).not.toBe(0n);
      expect(c.numerator).not.toBe(0n);
      // Independent distributive expansion without calling the production polynomial library.
      const independently=[
        mul(b,e),add(mul(a,e),mul(b,d)),
        add(mul(a,d),mul(b,c)),mul(a,c),
      ];
      const expanded=expandedProduct(p);
      expect(expanded.length).toBe(4);
      independently.forEach((x,i)=>expect(eq(expanded[i],x)).toBe(true));
      coefficients=independently.map((x,i)=>div(x,r(i+1)));
      for(const x of [r(-2),r(0),r(3,2)]){
        const integrand=mul(add(b,mul(a,x)),add(add(e,mul(d,x)),mul(c,pow(x,2))));
        const derivative=coefficients.reduce((sum,coef,i)=>add(sum,mul(mul(coef,r(i+1)),pow(x,i))),r(0));
        expect(eq(derivative,integrand)).toBe(true);
      }
    }else{
      expect(p.a.numerator).not.toBe(0n);
      expect(p.k.numerator).not.toBe(0n);
      const scale=arctanScale(p);
      expect(eq(mul(scale,p.a),p.k)).toBe(true);
      coefficients=[div(p.k,p.a)];
      for(const x of [-2,-0.5,0,2]){
        const h=1e-5,a=num(p.a),b=num(p.b),k=num(p.k),coef=num(scale);
        const antiderivative=(z:number)=>coef*Math.atan(a*z+b);
        const estimate=(antiderivative(x+h)-antiderivative(x-h))/(2*h);
        const target=k/(1+(a*x+b)**2);
        expect(Math.abs(estimate-target)).toBeLessThan(1e-7);
      }
    }
    for(const locale of ["pl","en"] as const){
      const shown=localizeUniversity(task,locale),spec=shown.answer;
      expect(shown.id).toBe(task.id);
      expect(shown.contentKey).toBe(task.contentKey);
      expect(shown.solution?.length).toBeGreaterThanOrEqual(4);
      expect(shown.hint.length).toBeGreaterThan(25);
      if(locale==="en")for(const str of [shown.title,shown.question,shown.hint,shown.nextHint,shown.explanation,...shown.solution!.map(s=>s.action+" "+s.reason)])
        expect(str).not.toMatch(polishLearningText);
      expect(spec.kind).toBe("primitive");
      if(spec.kind!=="primitive")throw Error("Expected primitive");
      expect(spec.terms.length).toBe(coefficients.length);
      spec.terms.forEach((term,i)=>expect(eq(term.coefficient,coefficients[i])).toBe(true));
      expect(assessAnswer(spec,input(coefficients)).kind).toBe("correct");
      expect(assessAnswer(spec,input(coefficients,false))).toEqual({kind:"incorrect",reason:"missing-constant"});
      const wrong=[add(coefficients[0],r(1)),...coefficients.slice(1)];
      expect(assessAnswer(spec,input(wrong)).kind).toBe("incorrect");
      expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
      expect(assessAnswer(spec,{kind:"primitive",coefficients:["1/0",...coefficients.slice(1).map(fmt)],hasConstant:true}).kind).toBe("invalid");
    }
   }
   expect(seen.size).toBe(24);
  },35000);
 }
 it("rejects invalid difficulty/variant and zero coefficients",()=>{
  for(const family of integralBasicsFollowupFamilies){
   expect(()=>makeUniversityTask(family.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(family.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(family.id,0,"easy")).toThrow();
  }
  const p=makeUniversityTask("integral-direct-product",0,"hard").university;
  const q=makeUniversityTask("integral-table-arctan",0,"hard").university;
  if(p.kind!=="integral-direct-product"||q.kind!=="integral-table-arctan")throw Error("Unexpected generated kinds");
  expect(()=>expandedProduct({...p,linear:[p.linear[0],r(0)]})).toThrow();
  expect(()=>arctanScale({...q,a:r(0)})).toThrow();
  expect(()=>arctanScale({...q,k:r(0)})).toThrow();
 });
});
