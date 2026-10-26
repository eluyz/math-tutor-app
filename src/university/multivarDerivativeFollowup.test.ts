import {describe,it,expect} from "vitest";
import {rational as r,addRational as add,multiplyRational as mul,equalRational as eq,type Rational} from "../rational";
import {formatRational as f,assessAnswer,emptyAnswer} from "../answers";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {multivarDerivativeFollowupFamilies,cubicPartials,chainGradient} from "./multivarDerivativeFollowup";
import {polishLearningText} from "../../e2e/helpers/localization";
const n=(x:Rational)=>Number(x.numerator)/Number(x.denominator);
const product=(...xs:Rational[])=>xs.reduce(mul,r(1));
describe("MT-EDU-025 P2G-A — 144 W01 exercises",()=>{
 it("has exactly two families and 144 variants",()=>{
  expect(multivarDerivativeFollowupFamilies.map(x=>x.id)).toEqual(["multivar-cubic-partial","multivar-chain-gradient"]);
  expect(multivarDerivativeFollowupFamilies.reduce((n,x)=>n+x.supportedDifficulties.length*24,0)).toBe(144);
 });
 for(const fam of multivarDerivativeFollowupFamilies)for(const level of fam.supportedDifficulties)
 it(fam.id+" "+level+" independently checks all 24 generated variants",()=>{
  const keys=new Set<string>(),targets=new Set<string>();
  for(let v=0;v<24;v++){
   const task=makeUniversityTask(fam.id,v,level),p=task.university;
   keys.add(task.contentKey);
   expect(task.category).toBe("derivatives");
   let expected:readonly Rational[];
   if(p.kind==="multivar-cubic-partial"){
    targets.add(p.target);
    const {a,b,c,d,e,g,h,x,y}=p;
    const values={
      x:add(add(add(add(product(r(3),a,x,x),product(r(2),b,x,y)),product(c,y,y)),mul(e,y)),g),
      y:add(add(add(add(product(b,x,x),product(r(2),c,x,y)),product(r(3),d,y,y)),mul(e,x)),h),
      xx:add(product(r(6),a,x),product(r(2),b,y)),
      xy:add(add(product(r(2),b,x),product(r(2),c,y)),e),
      yy:add(product(r(2),c,x),product(r(6),d,y))
    };
    const got=cubicPartials(p);
    for(const kind of ["x","y","xx","xy","yy"] as const)expect(eq(got[kind],values[kind])).toBe(true);
    expected=[values[p.target]];
    const evalF=(X:number,Y:number)=>n(a)*X**3+n(b)*X*X*Y+n(c)*X*Y*Y+n(d)*Y**3+n(e)*X*Y+n(g)*X+n(h)*Y;
    const X=n(x),Y=n(y),delta=0.001;
    const px=(evalF(X+delta,Y)-evalF(X-delta,Y))/(2*delta);
    const py=(evalF(X,Y+delta)-evalF(X,Y-delta))/(2*delta);
    const pxx=(evalF(X+delta,Y)-2*evalF(X,Y)+evalF(X-delta,Y))/(delta*delta);
    const pyy=(evalF(X,Y+delta)-2*evalF(X,Y)+evalF(X,Y-delta))/(delta*delta);
    const pxy=(evalF(X+delta,Y+delta)-evalF(X+delta,Y-delta)-evalF(X-delta,Y+delta)+evalF(X-delta,Y-delta))/(4*delta*delta);
    for(const [actual,ref] of [[px,values.x],[py,values.y],[pxx,values.xx],[pxy,values.xy],[pyy,values.yy]] as const)
     expect(Math.abs(actual-n(ref))).toBeLessThan(0.02);
    expect(p.a.numerator).not.toBe(0n);expect(p.d.numerator).not.toBe(0n);
   }else if(p.kind==="multivar-chain-gradient"){
    const {a,b,c,k,d,x,y}=p,u=add(add(mul(a,x),mul(b,y)),c);
    const fx=add(product(r(3),k,a,u,u),mul(d,y)),fy=add(product(r(3),k,b,u,u),mul(d,x));
    const got=chainGradient(p);expect(eq(got[0],fx)).toBe(true);expect(eq(got[1],fy)).toBe(true);
    expected=[fx,fy];
    const fn=(X:number,Y:number)=>n(k)*(n(a)*X+n(b)*Y+n(c))**3+n(d)*X*Y;
    const X=n(x),Y=n(y),delta=0.0001;
    expect(Math.abs((fn(X+delta,Y)-fn(X-delta,Y))/(2*delta)-n(fx))).toBeLessThan(0.005);
    expect(Math.abs((fn(X,Y+delta)-fn(X,Y-delta))/(2*delta)-n(fy))).toBeLessThan(0.005);
    expect(a.numerator).not.toBe(0n);expect(b.numerator).not.toBe(0n);expect(k.numerator).not.toBe(0n);
   }else throw Error("Unknown generated family");
   for(const locale of ["pl","en"] as const){
    const t=localizeUniversity(task,locale),spec=t.answer;
    expect(t.id).toBe(task.id);expect(t.contentKey).toBe(task.contentKey);
    expect(t.solution?.length).toBeGreaterThanOrEqual(6);
    expect(t.question.length).toBeGreaterThan(60);
    if(locale==="en")for(const text of [t.title,t.question,t.hint,t.nextHint,t.explanation,...t.solution!.map(s=>s.action+" "+s.reason)])
     expect(text).not.toMatch(polishLearningText);
    if(expected.length===1){
     expect(spec.kind).toBe("scalar");if(spec.kind!=="scalar")throw Error("Expected scalar");
     expect(eq(spec.value,expected[0])).toBe(true);
     expect(assessAnswer(spec,f(expected[0])).kind).toBe("correct");
     expect(assessAnswer(spec,f(add(expected[0],r(1)))).kind).toBe("incorrect");
     expect(assessAnswer(spec,"1/0").kind).toBe("invalid");
    }else{
     expect(spec.kind).toBe("list");if(spec.kind!=="list")throw Error("Expected gradient list");
     expect(spec.values).toHaveLength(2);
     expect(eq(spec.values[0],expected[0])&&eq(spec.values[1],expected[1])).toBe(true);
     expect(assessAnswer(spec,{kind:"list",values:expected.map(f)}).kind).toBe("correct");
     expect(assessAnswer(spec,{kind:"list",values:[f(add(expected[0],r(1))),f(expected[1])]}).kind).toBe("incorrect");
     expect(assessAnswer(spec,{kind:"list",values:["1/0",f(expected[1])]}).kind).toBe("invalid");
    }
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
   }
  }
  expect(keys.size).toBe(24);
  if(fam.id==="multivar-cubic-partial")expect(targets.size).toBe(5);
 },35000);
 it("rejects invalid variants, levels and degenerate coefficients",()=>{
  for(const fam of multivarDerivativeFollowupFamilies){
   expect(()=>makeUniversityTask(fam.id,-1,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,24,"hard")).toThrow();
   expect(()=>makeUniversityTask(fam.id,0,"easy")).toThrow();
  }
  const p=makeUniversityTask("multivar-cubic-partial",0,"hard").university;
  const q=makeUniversityTask("multivar-chain-gradient",0,"hard").university;
  if(p.kind!=="multivar-cubic-partial"||q.kind!=="multivar-chain-gradient")throw Error("Unexpected generated problem kind");
  expect(()=>cubicPartials({...p,a:r(0)})).toThrow();
  expect(()=>cubicPartials({...p,d:r(0)})).toThrow();
  expect(()=>chainGradient({...q,a:r(0)})).toThrow();
  expect(()=>chainGradient({...q,b:r(0)})).toThrow();
  expect(()=>chainGradient({...q,k:r(0)})).toThrow();
 });
});
