import {describe,it,expect} from "vitest";
import {rational as r, addRational as add, multiplyRational as mul, equalRational as eq, type Rational} from "../rational";
import {formatRational as fmt, assessAnswer, emptyAnswer} from "../answers";
import {makeUniversityTask, localizeUniversity} from "./catalog";
import {parametricArcFamilies,parametricArcPoint,parametricArcDerivatives,exactParametricArcLength,type ParametricArcProblem} from "./parametricArc";
import {polishLearningText} from "../../e2e/helpers/localization";
const num=(v:Rational)=>Number(v.numerator)/Number(v.denominator);
const sq=(v:Rational)=>mul(v,v);
describe("MT-EDU-023 P2E-B2: independent exact lengths of parametric arcs",()=>{
 it("registers a new family with 72 variants",()=>{
  expect(parametricArcFamilies).toHaveLength(1);
  expect(parametricArcFamilies[0].id).toBe("integral-arc-parametric");
  expect(parametricArcFamilies[0].supportedDifficulties).toEqual(["hard","advanced","expert"]);
 });
 for(const level of parametricArcFamilies[0].supportedDifficulties){
  it("verifies all 24 different arcs, speed, numerical integrals, locales, feedback "+level,()=>{
   const seen=new Set<string>();
   for(let i=0;i<24;i++){
    const task=makeUniversityTask("integral-arc-parametric",i,level);
    const p=task.university as ParametricArcProblem;
    expect(p.kind).toBe("integral-arc-parametric");
    expect(p.scale.numerator).toBeGreaterThan(0n);
    expect(num(p.upper)).toBeGreaterThan(num(p.lower));
    for(const t of [p.lower,p.upper,r(0),r(1),r(-1)]){
     const {dx,dy}=parametricArcDerivatives(p,t);
     const expected=mul(p.scale,add(sq(t),r(1)));
     expect(eq(add(sq(dx),sq(dy)),sq(expected))).toBe(true);
     const h=0.00001,z=num(t),s=num(p.scale);
     const xy=(v:number)=>({x:s*(v**3/3-v)+num(p.shift),y:s*v*v+num(p.offset)});
     const left=xy(z-h),right=xy(z+h);
     expect(Math.abs((right.x-left.x)/(2*h)-num(dx))).toBeLessThan(0.0001);
     expect(Math.abs((right.y-left.y)/(2*h)-num(dy))).toBeLessThan(0.0001);
     const point=parametricArcPoint(p,t);
     expect(Math.abs(num(point.x)-xy(z).x)).toBeLessThan(0.00000001);
     expect(Math.abs(num(point.y)-xy(z).y)).toBeLessThan(0.00000001);
    }
    const exact=exactParametricArcLength(p);
    const a=num(p.lower),b=num(p.upper),dx=(b-a)/5000;
    let independent=0;
    for(let j=0;j<5000;j++){
     const t=a+(j+0.5)*dx,s=num(p.scale);
     independent+=Math.hypot(s*(t*t-1),2*s*t)*dx;
    }
    expect(Math.abs(num(exact)-independent)).toBeLessThan(0.0001);
    for(const locale of ["pl","en"] as const){
     const shown=localizeUniversity(task,locale),ans=shown.answer;
     expect(shown.solution?.length).toBeGreaterThanOrEqual(6);
     expect(shown.question.length).toBeGreaterThan(85);
     if(locale==="en"){
      expect(shown.question).not.toMatch(polishLearningText);
      expect(shown.explanation).not.toMatch(polishLearningText);
     }
     expect(ans.kind).toBe("scalar");
     if(ans.kind!=="scalar")throw Error("Expected rational arc length");
     expect(eq(ans.value,exact)).toBe(true);
     expect(assessAnswer(ans,fmt(exact)).kind).toBe("correct");
     expect(assessAnswer(ans,fmt(add(exact,r(1)))).kind).toBe("incorrect");
     expect(assessAnswer(ans,emptyAnswer(ans)).kind).toBe("invalid");
     expect(assessAnswer(ans,"1/0").kind).toBe("invalid");
    }
    seen.add(task.contentKey);
   }
   expect(seen.size).toBe(24);
  },35000);
 }
 it("refuses reversed bounds or negative speed scale",()=>{
  expect(()=>makeUniversityTask("integral-arc-parametric",24,"hard")).toThrow();
  expect(()=>makeUniversityTask("integral-arc-parametric",-1,"hard")).toThrow();
  expect(()=>makeUniversityTask("integral-arc-parametric",0,"easy")).toThrow();
  const p=makeUniversityTask("integral-arc-parametric",0,"hard").university as ParametricArcProblem;
  expect(()=>exactParametricArcLength({...p,scale:r(-1)})).toThrow();
  expect(()=>exactParametricArcLength({...p,upper:p.lower})).toThrow();
 });
});
