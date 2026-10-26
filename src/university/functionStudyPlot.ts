import {addRational as add,multiplyRational as mul,rational as r,type Rational} from "../rational";
import {formatRational as f} from "../answers";
import {criticalPoints,type FunctionStudyFollowupProblem} from "./functionStudyFollowup";

export type PlotPoint=Readonly<{u:number;z:number}>;
export type StudyPlot=Readonly<{
 kind:FunctionStudyFollowupProblem["kind"];
 paths:readonly (readonly PlotPoint[])[];
 critical:readonly (PlotPoint & {xLabel:string;yLabel:string})[];
 ticks:readonly {u:number;label:string}[];
 referenceX:string;referenceY:string;
 zMin:number;zMax:number;verticalAsymptote:boolean;oblique:readonly PlotPoint[]|null;
 descriptionPl:string;descriptionEn:string;
}>;

const value=(x:Rational)=>Number(x.numerator)/Number(x.denominator);
const shift=(p:FunctionStudyFollowupProblem,u:number):Rational|undefined=>
 Number.isInteger(u)?add(p.a,mul(p.q,r(u))):undefined;
const line=(from:number,to:number,steps:number,fn:(u:number)=>number):readonly PlotPoint[] =>
 Array.from({length:steps+1},(_,i)=>{const u=from+(to-from)*i/steps;return {u,z:fn(u)};});
export function buildStudyPlot(p:FunctionStudyFollowupProblem):StudyPlot{
 if(p.m.numerator===0n||p.q.numerator<=0n)throw Error("Graph requires m nonzero and q positive");
 const sign=p.m.numerator>0n?1:-1;
 const cp=criticalPoints(p), quartic=p.kind==="analysis-study-quartic";
 const uCritical=quartic?[-1,0,1]:[-1,1];
 const scale=quartic?
  Math.abs(value(p.m))*value(p.q)**4:Math.abs(value(p.m))*value(p.q);
 if(!(scale>0&&Number.isFinite(scale)))throw Error("Invalid plotting scale");
 // Plot in normalized coordinates u=(x-a)/q and z=(f(x)-k)/scale.
 // The axes are affine references x=a and y=k, not necessarily OX and OY.
 const normalized=quartic?
  (u:number)=>sign*(u*u-1)**2:
  (u:number)=>sign*(u+1/u);
 const pieces=quartic?[line(-2,2,160,normalized)]:
  [line(-3,-0.19,116,normalized),line(0.19,3,116,normalized)];
 const critical=uCritical.map((u,i)=>({
  u,z:normalized(u),xLabel:f(cp[2*i]),yLabel:f(cp[2*i+1]),
 }));
 const tickPositions=quartic?[-2,-1,0,1,2]:[-3,-1,0,1,3];
 const ticks=tickPositions.map(u=>({u,label:f(shift(p,u)!)}));
 const zMin=quartic?(sign>0?-1:-10.25):-6.2;
 const zMax=quartic?(sign>0?10.25:1):6.2;
 const descriptionPl=quartic?
  "Rzeczywisty wykres wielomianu: trzy punkty stacjonarne przy x=a−q, a, a+q; dwa przegięcia przy x=a±q/√3. "+
  "Punkty oznaczono ich dokładnymi współrzędnymi.":
  "Dwie rozłączne gałęzie funkcji wymiernej; przerwa i pionowa asymptota x=a, przerywana asymptota ukośna y=m(x−a)+k; "+
  "lokalne ekstrema przy x=a±q.";
 const descriptionEn=quartic?
  "Actual quartic curve: three stationary points at x=a−q, a, a+q and two inflections at x=a±q/√3. "+
  "Marked points have exact coordinate labels.":
  "Two separate rational branches with a gap and vertical asymptote x=a, dashed oblique asymptote y=m(x−a)+k, "+
  "and local extrema at x=a±q.";
 return {kind:p.kind,paths:pieces,critical,ticks,
  referenceX:f(p.a),referenceY:f(p.k),zMin,zMax,verticalAsymptote:!quartic,
  oblique:quartic?null:line(-3,3,1,u=>sign*u),
  descriptionPl,descriptionEn};
}
