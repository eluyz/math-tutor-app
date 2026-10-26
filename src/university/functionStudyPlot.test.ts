import {describe,it,expect} from "vitest";
import {rational as r,addRational as add,multiplyRational as mul,type Rational} from "../rational";
import {makeUniversityTask} from "./catalog";
import {criticalPoints,type FunctionStudyFollowupProblem} from "./functionStudyFollowup";
import {buildStudyPlot} from "./functionStudyPlot";
import {formatRational as f} from "../answers";
const num=(x:Rational)=>Number(x.numerator)/Number(x.denominator);
const sq=(x:number)=>x*x;

describe("MT-EDU-022 P2D-B: normalized SVG plot geometry and algebraic landmarks",()=>{
 for(const id of ["analysis-study-quartic","analysis-study-rational-shift"] as const)
  for(const level of ["hard","advanced","expert"] as const){
   it(id+"/"+level+" maps all 24 exercises without crossing excluded poles",()=>{
    const unique=new Set<string>();
    for(let v=0;v<24;v++){
     const task=makeUniversityTask(id,v,level),p=task.university;
     if(p.kind!=="analysis-study-quartic"&&p.kind!=="analysis-study-rational-shift")throw Error("wrong problem kind");
     const plot=buildStudyPlot(p),cp=criticalPoints(p);
     unique.add(task.contentKey);
     expect(plot.kind).toBe(id);
     expect(plot.referenceX).toBe(f(p.a));
     expect(plot.referenceY).toBe(f(p.k));
     expect(plot.critical.length).toBe(id==="analysis-study-quartic"?3:2);
     const normalizedFactor=p.m.numerator>0n?1:-1;
     const scale=id==="analysis-study-quartic"?Math.abs(num(p.m))*num(p.q)**4:Math.abs(num(p.m))*num(p.q);
     for(let i=0;i<plot.critical.length;i++){
      const point=plot.critical[i];
      expect(point.xLabel).toBe(f(cp[2*i]));
      expect(point.yLabel).toBe(f(cp[2*i+1]));
      const xActual=num(p.a)+num(p.q)*point.u,yActual=num(p.k)+scale*point.z;
      expect(Math.abs(xActual-num(cp[2*i]))).toBeLessThan(1e-10);
      expect(Math.abs(yActual-num(cp[2*i+1]))).toBeLessThan(1e-9);
     }
     const expectedTicks=id==="analysis-study-quartic"?[-2,-1,0,1,2]:[-3,-1,0,1,3];
     expect(plot.ticks.map(t=>t.u)).toEqual(expectedTicks);
     for(const tick of plot.ticks){
      const x=add(p.a,mul(p.q,r(tick.u)));
      expect(tick.label).toBe(f(x));
     }
     for(const path of plot.paths){
      expect(path.length).toBeGreaterThan(100);
      for(let i=0;i<path.length;i++){
       const point=path[i];
       expect(Number.isFinite(point.u)&&Number.isFinite(point.z)).toBe(true);
       const expected=id==="analysis-study-quartic"?
        normalizedFactor*sq(sq(point.u)-1):normalizedFactor*(point.u+1/point.u);
       expect(Math.abs(point.z-expected)).toBeLessThan(1e-10);
       if(i>0)expect(point.u).toBeGreaterThan(path[i-1].u);
      }
     }
     if(id==="analysis-study-quartic"){
      expect(plot.verticalAsymptote).toBe(false);
      expect(plot.paths).toHaveLength(1);
      expect(plot.oblique).toBeNull();
      expect(plot.critical.map(x=>x.u)).toEqual([-1,0,1]);
      expect(plot.paths[0][0].u).toBe(-2);
      expect(plot.paths[0].at(-1)?.u).toBe(2);
     }else{
      expect(plot.verticalAsymptote).toBe(true);
      expect(plot.paths).toHaveLength(2);
      expect(plot.oblique).toHaveLength(2);
      expect(plot.critical.map(x=>x.u)).toEqual([-1,1]);
      expect(plot.paths[0].at(-1)!.u).toBeLessThan(0);
      expect(plot.paths[1][0].u).toBeGreaterThan(0);
      expect(plot.paths.every(path=>path.every(pt=>Math.abs(pt.u)>=0.18))).toBe(true);
      for(const point of plot.oblique!){
       expect(Math.abs(point.z-normalizedFactor*point.u)).toBeLessThan(1e-12);
      }
     }
    }
    expect(unique.size).toBe(24);
   });
  }
 it("rejects invalid parameters before plotting",()=>{
  const q=makeUniversityTask("analysis-study-quartic",0,"hard").university;
  const t=makeUniversityTask("analysis-study-rational-shift",0,"hard").university;
  if(q.kind!=="analysis-study-quartic"||t.kind!=="analysis-study-rational-shift")throw Error("wrong problem");
  expect(()=>buildStudyPlot({...q,q:r(0)})).toThrow();
  expect(()=>buildStudyPlot({...t,m:r(0)})).toThrow();
 });
});
