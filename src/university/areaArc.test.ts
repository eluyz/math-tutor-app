import {describe,it,expect} from "vitest";
import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,equalRational as eq} from "../rational";
import {formatRational as f,assessAnswer,emptyAnswer} from "../answers";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {areaArcFamilies,exactArea,exactArcLength,type AreaArcProblem} from "./areaArc";
describe("MT-EDU-017: exact areas and nonlinear arc lengths",()=>{
 it.each(areaArcFamilies)("$id: 72 checked variants",family=>{
  const seen=new Set<string>();
  for(const level of family.supportedDifficulties)for(let v=0;v<24;v++){
   const task=makeUniversityTask(family.id,v,level);
   const p=task.university as AreaArcProblem;
   const ans=task.answer;
   expect(ans.kind).toBe("scalar");
   if(ans.kind!=="scalar")throw Error("Non-numeric answer");
   if(p.kind==="integral-area-between"){
     const L=Number(p.lower.numerator)/Number(p.lower.denominator);
     const R=Number(p.upper.numerator)/Number(p.upper.denominator);
     const h=Number(p.center.numerator)/Number(p.center.denominator);
     const a=Number(p.factor.numerator)/Number(p.factor.denominator);
     const radius=Number(p.radius.numerator)/Number(p.radius.denominator);
     const n=2000,dx=(R-L)/n;
     let approx=0;
     for(let i=0;i<n;i++){const z=L+(i+.5)*dx;approx+=a*Math.abs((z-h)**2-radius**2)*dx;}
     const exact=exactArea(p);
     expect(eq(exact,ans.value)).toBe(true);
     expect(Math.abs(Number(exact.numerator)/Number(exact.denominator)-approx)).toBeLessThan(.001);
   }else{
     const k=p.slope,m=p.endRoot;
     expect(eq(ans.value,exactArcLength(p))).toBe(true);
     // Fundamental theorem: integral sqrt(1+k²t) dt from 0 to (m²−1)/k².
     const lower=r(1),upper=r(m*m);
     const independent=div(sub(mul(upper,r(m)),lower),r(3*k*k));
     expect(eq(ans.value,mul(r(2),independent))).toBe(true);
   }
   seen.add(task.contentKey);
   expect(assessAnswer(ans,f(ans.value)).kind).toBe("correct");
   expect(assessAnswer(ans,f(add(ans.value,r(1)))).kind).toBe("incorrect");
   expect(assessAnswer(ans,emptyAnswer(ans)).kind).toBe("invalid");
   const en=localizeUniversity(task,"en");
   expect(en.answer).toEqual(ans);
   expect(en.contentKey).toBe(task.contentKey);
   expect(en.question).not.toMatch(/[ąćęłńóśźż]/i);
   expect(task.solution?.length).toBeGreaterThanOrEqual(5);
   expect(en.solution?.length).toBe(task.solution?.length);
  }
  expect(seen.size).toBe(72);
 });
});