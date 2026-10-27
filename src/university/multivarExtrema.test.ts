import {describe,it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {multivarExtremaFamilies,rectangleExtrema,diskExtrema,type MultivarExtremaProblem} from "./multivarExtrema";
import {q,a,s,m,d,eq} from "./audit";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import type {Rational} from "../rational";
import {polishLearningText} from "../../e2e/helpers/localization";

const cmp=(x:Rational,y:Rational)=>x.numerator*y.denominator<y.numerator*x.denominator?-1:x.numerator*y.denominator>y.numerator*x.denominator?1:0;
const pointCmp=(x:readonly Rational[],y:readonly Rational[])=>cmp(x[0],y[0])||cmp(x[1],y[1]);
const square=(x:Rational)=>m(x,x);
function referenceRectangle(p:Extract<MultivarExtremaProblem,{kind:"multivar-rectangle-extrema"}>){
 const xs=[p.x0,p.x1,...(cmp(p.x0,p.h)<=0&&cmp(p.h,p.x1)<=0?[p.h]:[])];
 const ys=[p.y0,p.y1,...(cmp(p.y0,p.k)<=0&&cmp(p.k,p.y1)<=0?[p.k]:[])];
 const candidates=xs.flatMap(x=>ys.map(y=>({
  point:[x,y] as readonly [Rational,Rational],
  value:a(a(m(p.a,square(s(x,p.h))),m(p.b,square(s(y,p.k)))),p.c)
 })));
 const ordered=candidates.sort((i,j)=>pointCmp(i.point,j.point));
 const min=ordered.reduce((best,z)=>cmp(z.value,best.value)<0?z:best);
 const max=ordered.reduce((best,z)=>cmp(z.value,best.value)>0?z:best);
 return {min:{point:min.point,value:min.value,points:ordered.filter(z=>eq(z.value,min.value)).map(z=>z.point)},
         max:{point:max.point,value:max.value,points:ordered.filter(z=>eq(z.value,max.value)).map(z=>z.point)}};
}
const independentDisk=(p:Extract<MultivarExtremaProblem,{kind:"multivar-disk-linear-extrema"}>)=>{
 const dx=d(m(p.radius,p.u),p.norm),dy=d(m(p.radius,p.v),p.norm);
 const low=[s(p.h,dx),s(p.k,dy)] as const;
 const high=[a(p.h,dx),a(p.k,dy)] as const;
 const at=(point:readonly [Rational,Rational])=>a(a(m(p.u,point[0]),m(p.v,point[1])),p.c);
 return {min:{point:low,value:at(low)},max:{point:high,value:at(high)}};
};
describe("MT-EDU-025 P2G-B: global two-variable extrema",()=>{
 it("adds exactly 2 families × 3 levels × 24 = 144 variants",()=>{
  expect(multivarExtremaFamilies.map(x=>x.id)).toEqual(["multivar-rectangle-extrema","multivar-disk-linear-extrema"]);
  expect(multivarExtremaFamilies.reduce((n,x)=>n+x.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const family of multivarExtremaFamilies)for(const level of family.supportedDifficulties)
 it(family.id+" "+level+" independently audits all 24 variants in PL/EN",()=>{
  const keys=new Set<string>(),cases=new Set<string>();
  for(let v=0;v<24;v++){
   const task=makeUniversityTask(family.id,v,level),p=task.university;
   keys.add(task.contentKey);
   expect(task.category).toBe("derivatives");
   let expected:ReturnType<typeof referenceRectangle>|ReturnType<typeof independentDisk>;
   if(p.kind==="multivar-rectangle-extrema"){
    expected=referenceRectangle(p);
    const got=rectangleExtrema(p);
    for(const type of ["min","max"] as const){
     expect(eq(got[type].value,expected[type].value)).toBe(true);
     expect(got[type].point.every((z,i)=>eq(z,expected[type].point[i]))).toBe(true);
     expect(got[type].points.length).toBeGreaterThanOrEqual(1);
    }
    const ties=got.min.points.length>1||got.max.points.length>1;
    cases.add(ties?"tie":"unique");
    const centerInside=cmp(p.x0,p.h)<=0&&cmp(p.h,p.x1)<=0&&cmp(p.y0,p.k)<=0&&cmp(p.k,p.y1)<=0;
    cases.add(centerInside?"interior-stationary":"outside-stationary");
    for(const x of [p.x0,p.x1])for(const y of [p.y0,p.y1]){
     const value=a(a(m(p.a,square(s(x,p.h))),m(p.b,square(s(y,p.k)))),p.c);
     expect(cmp(expected.min.value,value)).toBeLessThanOrEqual(0);
     expect(cmp(expected.max.value,value)).toBeGreaterThanOrEqual(0);
    }
   }else if(p.kind==="multivar-disk-linear-extrema"){
    expected=independentDisk(p);
    const got=diskExtrema(p);
    expect(eq(square(p.norm),a(square(p.u),square(p.v)))).toBe(true);
    for(const type of ["min","max"] as const){
     expect(eq(got[type].value,expected[type].value)).toBe(true);
     expect(got[type].point.every((z,i)=>eq(z,expected[type].point[i]))).toBe(true);
     const [x,y]=got[type].point;
     expect(eq(a(square(s(x,p.h)),square(s(y,p.k))),square(p.radius))).toBe(true);
    }
    for(let t=-5;t<=5;t++){
     // Rational parametrization of the unit circle, independently checked.
     const parameter=q(t,3),one=q(1),denom=a(one,square(parameter));
     const dx=d(s(one,square(parameter)),denom),dy=d(m(q(2),parameter),denom);
     const x=a(p.h,m(p.radius,dx)),y=a(p.k,m(p.radius,dy));
     const value=a(a(m(p.u,x),m(p.v,y)),p.c);
     expect(cmp(expected.min.value,value)).toBeLessThanOrEqual(0);
     expect(cmp(expected.max.value,value)).toBeGreaterThanOrEqual(0);
    }
   }else throw Error("Unexpected family kind");
   const expectedValues=[...expected.min.point,expected.min.value,...expected.max.point,expected.max.value];
   for(const locale of ["pl","en"] as const){
    const view=localizeUniversity(task,locale),spec=view.answer;
    expect(view.contentKey).toBe(task.contentKey);
    expect(view.solution?.length).toBeGreaterThanOrEqual(7);
    expect(view.question.length).toBeGreaterThan(80);
    expect(spec.kind).toBe("list");
    if(spec.kind!=="list")throw Error("Expected 6 input values");
    expect(spec.values).toHaveLength(6);
    expect(spec.labels).toEqual(["x_min","y_min","f_min","x_max","y_max","f_max"]);
    for(let i=0;i<6;i++)expect(eq(spec.values[i],expectedValues[i])).toBe(true);
    expect(assessAnswer(spec,{kind:"list",values:expectedValues.map(f)}).kind).toBe("correct");
    const wrong=expectedValues.map(f);wrong[2]=f(a(expectedValues[2],q(1)));
    expect(assessAnswer(spec,{kind:"list",values:wrong}).kind).toBe("incorrect");
    const malformed=expectedValues.map(f);malformed[0]="1/0";
    expect(assessAnswer(spec,{kind:"list",values:malformed}).kind).toBe("invalid");
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    if(locale==="en")for(const line of [view.title,view.question,view.hint,view.nextHint,view.explanation,...view.solution!.map(s=>s.action+" "+s.reason)])
     expect(line).not.toMatch(polishLearningText);
   }
  }
  expect(keys.size).toBe(24);
  if(family.id==="multivar-rectangle-extrema")expect(cases).toEqual(new Set(["tie","unique","interior-stationary","outside-stationary"]));
 },45000);
 it("rejects unsupported parameters and inconsistent geometry",()=>{
  for(const fam of multivarExtremaFamilies){
   expect(()=>makeUniversityTask(fam.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,0,"easy")).toThrow();
  }
  const rect=makeUniversityTask("multivar-rectangle-extrema",0,"hard").university;
  if(rect.kind!=="multivar-rectangle-extrema")throw Error("Unexpected rectangle");
  expect(()=>rectangleExtrema({...rect,x1:rect.x0})).toThrow();
  expect(()=>rectangleExtrema({...rect,a:q(0)})).toThrow();
  const circle=makeUniversityTask("multivar-disk-linear-extrema",0,"hard").university;
  if(circle.kind!=="multivar-disk-linear-extrema")throw Error("Unexpected disk");
  expect(()=>diskExtrema({...circle,radius:q(0)})).toThrow();
  expect(()=>diskExtrema({...circle,norm:q(1)})).toThrow();
 });
});
