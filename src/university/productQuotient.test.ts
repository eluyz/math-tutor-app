import {describe,expect,it} from "vitest";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import {rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, equalRational as eq} from "../rational";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {englishAnswer} from "../locales/lessons-en";
import {productQuotientFamilies,valueProduct,valueQuotient,denominatorAt,type ProductQuotientProblem} from "./productQuotient";

function independently(p:ProductQuotientProblem){
 const a=p.a,b=p.b,c=p.c,d=p.d,h=p.at;
 if(p.kind==="derivative-product-point"){
  const u=add(mul(a,h),b),v=add(mul(c,mul(h,h)),d);
  const du=a,dv=mul(r(2),mul(c,h));
  return add(mul(du,v),mul(u,dv));
 }
 // Substitution into the quotient rule, independently of the simplified implementation.
 const n=add(mul(a,h),b),den=add(mul(c,h),d);
 if(den.numerator===0n)throw Error("Invalid quotient domain");
 return div(sub(mul(a,den),mul(n,c)),mul(den,den));
}
describe("MT-EDU-016 P1B exact product/quotient derivative audit",()=>{
 it.each(productQuotientFamilies)("$id: every difficulty and variant has a correct exact derivative",family=>{
  for(const level of family.supportedDifficulties){
   const seen=new Set<string>();
   for(let v=0;v<24;v++){
    const task=makeUniversityTask(family.id,v,level);
    const p=task.university as ProductQuotientProblem;
    const ans=independently(p);
    seen.add(task.contentKey);
    if(p.kind==="derivative-product-point")expect(eq(valueProduct(p),ans)).toBe(true);
    else{
     expect(denominatorAt(p).numerator).not.toBe(0n);
     expect(eq(valueQuotient(p),ans)).toBe(true);
     expect(sub(mul(p.a,p.d),mul(p.b,p.c)).numerator).not.toBe(0n);
    }
    const spec=task.answer;
    expect(spec.kind).toBe("scalar");
    if(spec.kind!=="scalar")throw Error("Expected exact numeric response");
    expect(eq(spec.value,ans)).toBe(true);
    expect(assessAnswer(spec,f(ans)).kind).toBe("correct");
    expect(assessAnswer(spec,f(add(ans,r(1)))).kind).toBe("incorrect");
    expect(assessAnswer(spec,"1/0").kind).toBe("invalid");
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    const en=localizeUniversity(task,"en");
    expect(en.contentKey).toBe(task.contentKey);
    expect(en.answer).toEqual(englishAnswer(task.answer));
    expect(en.question).not.toMatch(/[ąćęłńóśźż]/i);
    for(const shown of [task,en]){
     expect(shown.solution?.length).toBeGreaterThanOrEqual(5);
     expect(shown.hint.length).toBeGreaterThan(20);
     expect(shown.nextHint.length).toBeGreaterThan(20);
    }
   }
   expect(seen.size,family.id+"/"+level).toBe(24);
  }
 });
 it("keeps every new exercise globally unique across 3 levels",()=>{
  const all=(["easy","medium","hard"] as const).flatMap(level=>
   productQuotientFamilies.flatMap(family=>Array.from({length:24},(_,i)=>makeUniversityTask(family.id,i,level))));
  expect(new Set(all.map(t=>t.contentKey)).size).toBe(144);
 });
});
