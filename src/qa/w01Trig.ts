import type { makeUniversityTask } from "../university/catalog";
import { formatRational as f } from "../answers";
import { r } from "./batchFMath";

// Sparse polynomial differentiation is independent of the production coefficient switch.
type P = Map<string, number>;
const polynomial = (xs: readonly (readonly [number,number,number])[]): P =>
  new Map(xs.map(([x,y,c])=>[x+","+y,c]));
const D = (p:P, variable:"x"|"y"):P => {
  const q:P=new Map();
  for (const [key,c] of p) {
    const [x,y]=key.split(",").map(Number), degree=variable==="x"?x:y;
    if (degree) {
      const k=variable==="x" ? (x-1)+","+y : x+","+(y-1);
      q.set(k,(q.get(k)??0)+degree*c);
    }
  }
  return q;
};
const product=(a:P,b:P):P=>{
  const out:P=new Map();
  for(const [ka,ca] of a)for(const [kb,cb] of b){
    const [ax,ay]=ka.split(",").map(Number),[bx,by]=kb.split(",").map(Number);
    const key=(ax+bx)+","+(ay+by);
    out.set(key,(out.get(key)??0)+ca*cb);
  }
  return out;
};
const scaled=(a:P,k:number):P=>new Map([...a].map(([key,c])=>[key,c*k]));
const values=(p:P,basis:readonly string[]):string[]=>{
  const permitted=new Set(basis);
  for(const [key,c] of p)if(c!==0&&!permitted.has(key))
    throw new Error("Unexpected residual monomial "+key);
  return basis.map(key=>f(r(p.get(key)??0)));
};

export function independentTrig(task:ReturnType<typeof makeUniversityTask>) {
  const p=task.university;
  if(p.kind!=="multivar-trig-partial")throw new Error("Expected trig partial");
  const u=p.mode==="sin-square-linear"
    ? polynomial([[1,0,p.a],[0,1,p.b]])
    : polynomial([[1,2,p.k]]);
  const i=p.target[0] as "x"|"y", j=p.target[1] as "x"|"y"|undefined;
  const ui=D(u,i);
  if(p.mode==="sin-square-linear") {
    const coefficients=j?scaled(product(ui,D(u,j)),2):ui;
    const result=values(coefficients,["0,0"]);
    return {kind:"list" as const,values:result};
  }
  if(!j){
    const basis=i==="x"?["0,2"]:["1,1"];
    return {kind:"list" as const,values:values(scaled(ui,-1),basis)};
  }
  const sin=scaled(D(ui,j),-1),cos=scaled(product(ui,D(u,j)),-1);
  if(p.target==="xx")return {kind:"list" as const,values:values(cos,["0,4"])};
  if(p.target==="yy")
    return {kind:"list" as const,values:[...values(sin,["1,0"]),...values(cos,["2,2"])]};
  return {kind:"list" as const,values:[...values(sin,["0,1"]),...values(cos,["1,3"])]};
}
