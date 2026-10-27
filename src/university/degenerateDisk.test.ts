import {describe,it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {degenerateDiskFamilies,quarticClassification,quarticValue,quadraticDiskExtrema,quadraticDiskValue,type DegenerateDiskProblem} from "./degenerateDisk";
import {q,a,s,m,eq} from "./audit";
import {assessAnswer,emptyAnswer,formatRational as f} from "../answers";
import type {Rational} from "../rational";
import {polishLearningText} from "../../e2e/helpers/localization";

const sq=(x:Rational)=>m(x,x);
const pow4=(x:Rational)=>sq(sq(x));
const compare=(x:Rational,y:Rational)=>x.numerator*y.denominator<y.numerator*x.denominator?-1:x.numerator*y.denominator>y.numerator*x.denominator?1:0;
const independentQuartic=(p:Extract<DegenerateDiskProblem,{kind:"multivar-degenerate-quartic"}>,u:Rational,v:Rational)=>
 a(a(m(p.a,pow4(u)),m(p.b,pow4(v))),p.c);
const independentDisk=(p:Extract<DegenerateDiskProblem,{kind:"multivar-diagonal-quadratic-disk"}>,u:Rational,v:Rational)=>
 a(a(m(p.a,sq(u)),m(p.b,sq(v))),p.c);
const diskReference=(p:Extract<DegenerateDiskProblem,{kind:"multivar-diagonal-quadratic-disk"}>)=>{
 const R=p.radius;
 const points=[[q(0),q(0)],[s(q(0),R),q(0)],[q(0),s(q(0),R)],[R,q(0)],[q(0),R]] as const;
 const candidates=points.map(point=>({point,value:independentDisk(p,point[0],point[1])}));
 const lex=(x:readonly Rational[],y:readonly Rational[])=>compare(x[0],y[0])||compare(x[1],y[1]);
 candidates.sort((x,y)=>lex(x.point,y.point));
 const min=candidates.reduce((best,item)=>compare(item.value,best.value)<0?item:best);
 const max=candidates.reduce((best,item)=>compare(item.value,best.value)>0?item:best);
 return {min,max};
};
describe("MT-EDU-025 P2G-D: degenerate Hessian and quadratic disk extrema",()=>{
 it("provides 2 new families and precisely 144 variants",()=>{
  expect(degenerateDiskFamilies.map(f=>f.id)).toEqual(["multivar-degenerate-quartic","multivar-diagonal-quadratic-disk"]);
  expect(degenerateDiskFamilies.reduce((sum,f)=>sum+f.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const family of degenerateDiskFamilies)for(const level of family.supportedDifficulties)
 it(family.id+" "+level+" verifies 24 exact cases in PL and EN",()=>{
  const keys=new Set<string>(),seen=new Set<string>();
  for(let v=0;v<24;v++){
   const task=makeUniversityTask(family.id,v,level),p=task.university;
   keys.add(task.contentKey);
   expect(task.category).toBe("derivatives");
   if(p.kind==="multivar-degenerate-quartic"){
    const expected=p.a.numerator>0n&&p.b.numerator>0n?"minimum":
      p.a.numerator<0n&&p.b.numerator<0n?"maximum":"saddle";
    const actual=quarticClassification(p);
    expect(actual).toBe(expected);seen.add(actual);
    expect(eq(quarticValue(p,p.h,p.k),p.c)).toBe(true);
    for(const t of [q(1,2),q(-2,7),q(1,101)]){
     const fx=quarticValue(p,a(p.h,t),p.k);
     const fy=quarticValue(p,p.h,a(p.k,t));
     expect(eq(fx,independentQuartic(p,t,q(0)))).toBe(true);
     expect(eq(fy,independentQuartic(p,q(0),t))).toBe(true);
     expect(compare(fx,p.c)).toBe(p.a.numerator>0n?1:-1);
     expect(compare(fy,p.c)).toBe(p.b.numerator>0n?1:-1);
    }
   }else if(p.kind==="multivar-diagonal-quadratic-disk"){
    const extrema=quadraticDiskExtrema(p),reference=diskReference(p);
    for(const type of ["min","max"] as const){
     expect(eq(extrema[type].value,reference[type].value)).toBe(true);
     expect(extrema[type].point.every((z,i)=>eq(z,a(reference[type].point[i],i===0?p.h:p.k)))).toBe(true);
     const u=s(extrema[type].point[0],p.h),vv=s(extrema[type].point[1],p.k);
     expect(compare(a(sq(u),sq(vv)),sq(p.radius))).toBeLessThanOrEqual(0);
     expect(eq(quadraticDiskValue(p,...extrema[type].point),extrema[type].value)).toBe(true);
    }
    seen.add("sign-a:"+(p.a.numerator>0n?"+":"-")+",sign-b:"+(p.b.numerator>0n?"+":"-"));
    for(const t of [q(-3,2),q(-1),q(0),q(1),q(3,2)]){
     const one=q(1),denom=a(one,sq(t));
     const ux={numerator:s(one,sq(t)).numerator*denom.denominator,denominator:s(one,sq(t)).denominator*denom.numerator};
     const vy={numerator:m(q(2),t).numerator*denom.denominator,denominator:m(q(2),t).denominator*denom.numerator};
     const u=m(p.radius,ux),vv=m(p.radius,vy);
     expect(compare(a(sq(u),sq(vv)),sq(p.radius))).toBe(0);
     const value=independentDisk(p,u,vv);
     expect(compare(extrema.min.value,value)).toBeLessThanOrEqual(0);
     expect(compare(value,extrema.max.value)).toBeLessThanOrEqual(0);
    }
   }else throw Error("Unexpected family");
   for(const locale of ["pl","en"] as const){
    const view=localizeUniversity(task,locale),spec=view.answer;
    expect(view.contentKey).toBe(task.contentKey);
    expect(view.solution?.length).toBeGreaterThanOrEqual(7);
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    if(locale==="en")for(const txt of [view.title,view.question,view.hint,view.nextHint,view.explanation,...view.solution!.map(z=>z.action+" "+z.reason)])
     expect(txt).not.toMatch(polishLearningText);
    if(p.kind==="multivar-degenerate-quartic"){
     expect(spec.kind).toBe("choice");if(spec.kind!=="choice")throw Error("Expected choice");
     const expected=quarticClassification(p);
     expect(spec.value).toBe(expected);
     expect(spec.options.map(o=>o.value)).toEqual(["minimum","maximum","saddle"]);
     expect(assessAnswer(spec,{kind:"choice",value:expected}).kind).toBe("correct");
     expect(assessAnswer(spec,{kind:"choice",value:spec.options.find(o=>o.value!==expected)!.value}).kind).toBe("incorrect");
     expect(assessAnswer(spec,{kind:"choice",value:"inconclusive"}).kind).toBe("invalid");
    }else{
     expect(spec.kind).toBe("list");if(spec.kind!=="list")throw Error("Expected six fields");
     const answer=quadraticDiskExtrema(p);
     const expected=[...answer.min.point,answer.min.value,...answer.max.point,answer.max.value];
     expect(spec.values).toHaveLength(6);
     for(let i=0;i<6;i++)expect(eq(spec.values[i],expected[i])).toBe(true);
     expect(assessAnswer(spec,{kind:"list",values:expected.map(f)}).kind).toBe("correct");
     const wrong=expected.map(f);wrong[2]=f(a(expected[2],q(1)));
     expect(assessAnswer(spec,{kind:"list",values:wrong}).kind).toBe("incorrect");
     const invalid=expected.map(f);invalid[0]="1/0";
     expect(assessAnswer(spec,{kind:"list",values:invalid}).kind).toBe("invalid");
    }
   }
  }
  expect(keys.size).toBe(24);
  if(family.id==="multivar-degenerate-quartic")expect(seen).toEqual(new Set(["minimum","maximum","saddle"]));
  else expect(seen.size).toBe(4);
 },45000);
 it("rejects unsupported indices, difficulty and invalid geometry",()=>{
  for(const fam of degenerateDiskFamilies){
   expect(()=>makeUniversityTask(fam.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,0,"easy")).toThrow();
  }
  const q1=makeUniversityTask("multivar-degenerate-quartic",0,"hard").university;
  if(q1.kind!=="multivar-degenerate-quartic")throw Error("Wrong kind");
  expect(()=>quarticClassification({...q1,a:q(0)})).toThrow();
  const q2=makeUniversityTask("multivar-diagonal-quadratic-disk",0,"hard").university;
  if(q2.kind!=="multivar-diagonal-quadratic-disk")throw Error("Wrong kind");
  expect(()=>quadraticDiskExtrema({...q2,radius:q(0)})).toThrow();
 });
});
