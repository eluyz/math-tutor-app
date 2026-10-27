import {describe,it,expect} from "vitest";
import {assessAnswer,emptyAnswer} from "../answers";
import {englishAnswer} from "../locales/lessons-en";
import {rational as r,addRational as add,divideRational as div,multiplyRational as mul,equalRational as eq,type Rational} from "../rational";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {rectangularPathFamilies,chainTrace,anisotropicClass,nonlinearPathValue,type RectangularPathProblem,type Shape} from "./rectangularPaths";
import {polishLearningText} from "../../e2e/helpers/localization";

const shapeOracle=(p:Extract<RectangularPathProblem,{kind:"matrix-four-factor-dimensions"}>)=>{
 let current:Shape|null=p.matrices[0];
 for(const right of p.matrices.slice(1)){
  if(current===null)break;
  current=current.columns===right.rows?{rows:current.rows,columns:right.columns}:null;
 }
 return current;
};
const v=(a:Rational)=>Number(a.numerator)/Number(a.denominator);
const pow=(a:Rational,n:number)=>Array.from({length:n},()=>a).reduce((acc,x)=>mul(acc,x),r(1));
const f2=(p:Extract<RectangularPathProblem,{kind:"multivar-anisotropic-limit"}>,u:Rational,vv:Rational):Rational=>
 add(p.base,div(mul(mul(p.factor,pow(u,p.power)),pow(vv,2)),add(pow(u,6),pow(vv,4))));

describe("MT-EDU-029 P3C — exact independent M03/W03 audit",()=>{
 it("registers two families, 3 difficulties each, and 144 variants",()=>{
  expect(rectangularPathFamilies.map(f=>f.id)).toEqual(["matrix-four-factor-dimensions","multivar-anisotropic-limit"]);
  expect(rectangularPathFamilies.reduce((acc,f)=>acc+f.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const family of rectangularPathFamilies)for(const level of family.supportedDifficulties)
 it(family.id+"/"+level+": all 24 variants, oracle, PL/EN, answer validation",()=>{
  const keys=new Set<string>(),classes=new Set<string>();
  for(let index=0;index<24;index++){
   const task=makeUniversityTask(family.id,index,level),p=task.university;
   if(p.kind!=="matrix-four-factor-dimensions"&&p.kind!=="multivar-anisotropic-limit")throw Error("wrong kind");
   keys.add(task.contentKey);
   expect(task.category).toBe(family.category);
   let value:string;
   if(p.kind==="matrix-four-factor-dimensions"){
    const expected=shapeOracle(p),actual=chainTrace(p);
    expect(actual.shape).toEqual(expected);
    if(expected){value=expected.rows+"x"+expected.columns;expect(actual.steps).toHaveLength(3);}
    else {value="not-possible";expect(actual.steps.length).toBeGreaterThanOrEqual(1);expect(actual.steps.length).toBeLessThanOrEqual(3);}
    classes.add(value==="not-possible"?"impossible":"possible");
    expect(p.matrices[0].rows).toBeGreaterThanOrEqual(2);
    expect(p.matrices[0].columns).toBeGreaterThanOrEqual(2);
   }else{
    const expected=p.power===3?"nonremovable":eq(p.base,p.valueAt)?"continuous":"removable";
    expect(anisotropicClass(p)).toBe(expected);value=expected;classes.add(value);
    expect(p.factor.numerator).not.toBe(0n);
    const zeroOnAxis=p.base;
    if(p.power===3){
     expect(eq(nonlinearPathValue(p),add(p.base,div(p.factor,r(2))))).toBe(true);
     expect(eq(nonlinearPathValue(p),zeroOnAxis)).toBe(false);
    }else{
     // Independent exact arithmetic: on u=t², v=t³ the fraction equals t²/2.
     for(const denom of [3,11,71]){
      const t=r(1,denom),u=pow(t,2),vv=pow(t,3);
      const expectedPath=add(p.base,div(mul(p.factor,u),r(2)));
      expect(eq(f2(p,u,vv),expectedPath)).toBe(true);
      const residual=v(add(f2(p,u,vv),r(-p.base.numerator,p.base.denominator)));
      expect(Math.abs(residual)).toBeLessThanOrEqual(Math.abs(v(p.factor))*v(u)/2+1e-9);
     }
     // AM-GM: u^6+v^4>=2|u^3|v^2 for any u,v and convergence after extra u.
     for(const [u,vv] of [[r(1,3),r(2,5)],[r(-2,7),r(1,4)]]){
      const lhs=Math.abs(v(add(f2(p,u,vv),r(-p.base.numerator,p.base.denominator))));
      expect(lhs).toBeLessThanOrEqual(Math.abs(v(p.factor))*Math.abs(v(u))/2+1e-9);
     }
    }
   }
   for(const locale of ["pl","en"] as const){
    const presentation=localizeUniversity(task,locale),spec=presentation.answer;
    expect(presentation.contentKey).toBe(task.contentKey);
    expect(presentation.question.length).toBeGreaterThan(55);
    expect(presentation.solution?.length).toBeGreaterThanOrEqual(5);
    expect(spec.kind).toBe("choice");
    if(spec.kind!=="choice")throw Error("expected choice");
    expect(spec.value).toBe(value);
    expect(new Set(spec.options.map(x=>x.value)).size).toBe(spec.options.length);
    expect(new Set(spec.options.map(x=>x.label)).size).toBe(spec.options.length);
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    expect(assessAnswer(spec,{kind:"choice",value:spec.value}).kind).toBe("correct");
    expect(assessAnswer(spec,{kind:"choice",value:spec.options.find(x=>x.value!==spec.value)!.value}).kind).toBe("incorrect");
    expect(assessAnswer(spec,{kind:"choice",value:"not-an-option"}).kind).toBe("invalid");
    if(locale==="en"){
     expect(spec).toEqual(englishAnswer(task.answer));
     for(const text of [presentation.title,presentation.question,presentation.hint,presentation.nextHint,presentation.explanation,...presentation.solution!.map(x=>x.action+" "+x.reason)])
      expect(text).not.toMatch(polishLearningText);
    }
    for(const step of presentation.solution!){
     expect(step.action.length).toBeGreaterThan(8);
     expect(step.reason.length).toBeGreaterThan(15);
    }
   }
  }
  expect(keys.size).toBe(24);
  expect(classes).toEqual(family.id==="matrix-four-factor-dimensions"?new Set(["possible","impossible"]):new Set(["continuous","removable","nonremovable"]));
 },45000);
 it("rejects out-of-range and unsupported variants",()=>{
  for(const family of rectangularPathFamilies){
   expect(()=>makeUniversityTask(family.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(family.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(family.id,0,"easy")).toThrow();
  }
 });
});
