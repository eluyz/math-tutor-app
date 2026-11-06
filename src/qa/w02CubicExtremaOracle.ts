import type {makeUniversityTask} from "../university/catalog";
import {formatRational as fmt} from "../answers";
import {r} from "./batchFMath";
// This oracle independently enumerates cubic stationarity candidates,
// tests both gradient equations and evaluates the Hessian at both points.
// It does not call w02CubicExtremum or read production answer fields.
export type W02CubicClassification={
 point:readonly [number,number];value:number;det:number;fxx:number;
 kind:"minimum"|"maximum"|"saddle"|"inconclusive";
};
export function independentW02Cubic(task:ReturnType<typeof makeUniversityTask>){
 const p=task.university;
 if(p.kind!=="multivar-cubic-extrema-full")throw Error("Expected W02 source family");
 const {a,k,s}=p;
 const critical:W02CubicClassification[]=[];
 // From fx=0: y=-x²/k. From fy=0: x·(s x³ + k³)=0.
 // Enumerate ALL real roots of this restricted polynomial family.
 for(const x of [-k,0,k]){
  const y=-x*x/k;
  const gx=3*a*x*x+3*a*k*y;
  const gy=3*s*a*y*y+3*a*k*x;
  if(gx!==0||gy!==0)continue;
  const f=a*x*x*x+s*a*y*y*y+3*a*k*x*y;
  const fxx=6*a*x,fxy=3*a*k,fyy=6*s*a*y;
  const det=fxx*fyy-fxy*fxy;
  const kind=det<0?"saddle":det>0?(fxx>0?"minimum":"maximum"):"inconclusive";
  critical.push({point:[x,y],value:f,det,fxx,kind});
 }
 if(critical.length!==2||critical.filter(p=>p.kind==="minimum"||p.kind==="maximum").length!==1||
    critical.filter(p=>p.kind==="saddle").length!==1)
  throw Error("Unexpected extrema structure: "+JSON.stringify(critical));
 const extremum=critical.find(p=>p.kind==="minimum"||p.kind==="maximum")!;
 if(extremum.point[0]===0||extremum.point[1]===0)throw Error("Nonzero extremum expected");
 return {kind:"list" as const,values:[...extremum.point,extremum.value].map(n=>fmt(r(n))),
  classification:extremum.kind as "minimum"|"maximum",
  critical};
}
