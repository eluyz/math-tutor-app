import type {makeUniversityTask} from "../university/catalog";
import {formatRational as fmt} from "../answers";
import {r} from "./batchFMath";
// Exact integer sparse-polynomial differentiation and independent basis solving.
// Does not inspect production answers, hints, or coefficient calculations.
type Poly=Map<string,number>;
type B={x:number;y:number;power:number};
const poly=(terms:readonly (readonly [number,number,number])[]):Poly=>{
 const out:Poly=new Map();for(const [x,y,c]of terms){const k=x+","+y;out.set(k,(out.get(k)??0)+c);}return out;
};
const add=(a:Poly,b:Poly):Poly=>{const p=new Map(a);for(const [k,v]of b)p.set(k,(p.get(k)??0)+v);return p;};
const scale=(a:Poly,k:number):Poly=>new Map([...a].map(([n,v])=>[n,v*k]));
const mul=(a:Poly,b:Poly):Poly=>{
 const p:Poly=new Map();for(const [ka,ca]of a)for(const [kb,cb]of b){
  const [ax,ay]=ka.split(",").map(Number),[bx,by]=kb.split(",").map(Number);
  const k=(ax+bx)+","+(ay+by);p.set(k,(p.get(k)??0)+ca*cb);
 }return p;
};
const D=(a:Poly,axis:"x"|"y"):Poly=>{
 const p:Poly=new Map();for(const [key,c]of a){const [x,y]=key.split(",").map(Number),n=axis==="x"?x:y;
  if(n){const k=axis==="x"?(x-1)+","+y:x+","+(y-1);p.set(k,(p.get(k)??0)+n*c);}
 }return p;
};
const power=(a:Poly,n:number):Poly=>{if(n<0||!Number.isInteger(n))throw Error("Invalid exponent");let p=poly([[0,0,1]]);for(let i=0;i<n;i++)p=mul(p,a);return p;};
const term=(x:number,y:number)=>poly([[x,y,1]]);
function source(p:{mode:string;a:number;b:number;c:number;d:number}){
 const {a,b,c,d}=p;
 switch(p.mode){
  case "inverse-cubic":return {N:poly([[1,4,a],[2,0,b]]),v:poly([[0,1,1]]),n:3};
  case "linear-quotient":return {N:poly([[1,0,a],[0,1,-b]]),v:poly([[1,0,c],[0,1,d]]),n:1};
  case "simple-quotient":return {N:poly([[0,1,a]]),v:poly([[1,0,1]]),n:1};
  case "bilinear-quotient":return {N:poly([[1,1,a]]),v:poly([[1,0,b],[0,1,-c]]),n:1};
 }throw Error("Unrecognized mode");
}
function basis(mode:string,t:string):B[]{
 if(mode==="inverse-cubic")switch(t){
  case "x":return [{x:0,y:1,power:0},{x:1,y:0,power:3}];
  case "y":return [{x:1,y:0,power:0},{x:2,y:0,power:4}];
  case "xx":return [{x:0,y:0,power:3}];
  case "xy":case "yx":return [{x:0,y:0,power:0},{x:1,y:0,power:4}];
  case "yy":return [{x:2,y:0,power:5}];
 }
 if(mode==="linear-quotient")switch(t){
  case "x":return [{x:0,y:1,power:2}];
  case "y":return [{x:1,y:0,power:2}];
  case "xx":return [{x:0,y:1,power:3}];
  case "xy":case "yx":return [{x:1,y:0,power:3},{x:0,y:1,power:3}];
  case "yy":return [{x:1,y:0,power:3}];
 }
 if(mode==="simple-quotient")switch(t){
  case "x":return [{x:0,y:1,power:2}];case "y":return [{x:0,y:0,power:1}];
  case "xx":return [{x:0,y:1,power:3}];
  case "xy":case "yx":return [{x:0,y:0,power:2}];
  case "yy":return [{x:0,y:0,power:0}];
 }
 if(mode==="bilinear-quotient")switch(t){
  case "x":return [{x:0,y:2,power:2}];case "y":return [{x:2,y:0,power:2}];
  case "xx":return [{x:0,y:2,power:3}];
  case "xy":case "yx":return [{x:1,y:1,power:3}];
  case "yy":return [{x:2,y:0,power:3}];
 }
 throw Error("Unsupported basis");
}
function solve(value:Poly,columns:Poly[]):number[]{
 const rows=[...new Set([...value.keys(),...columns.flatMap(c=>[...c.keys()])])].map(key=>
  [...columns.map(c=>c.get(key)??0),value.get(key)??0]);
 const n=columns.length;
 for(let i=0;i<n;i++){
  const k=rows.findIndex((r,j)=>j>=i&&Math.abs(r[i])>1e-9);
  if(k<0)throw Error("Dependent function basis");
  [rows[i],rows[k]]=[rows[k],rows[i]];
  const divisor=rows[i][i];for(let c=i;c<=n;c++)rows[i][c]/=divisor;
  for(let j=0;j<rows.length;j++)if(j!==i){const factor=rows[j][i];for(let c=i;c<=n;c++)rows[j][c]-=factor*rows[i][c];}
 }
 for(let j=n;j<rows.length;j++)if(Math.abs(rows[j][n])>1e-7)throw Error("Basis does not span derivative");
 return rows.slice(0,n).map(z=>{const c=Math.round(z[n]);if(Math.abs(z[n]-c)>1e-7)throw Error("Unexpected fractional basis coefficient");return c;});
}
export function independentRational(task:ReturnType<typeof makeUniversityTask>){
 const p=task.university;
 if(p.kind!=="multivar-rational-partial")throw Error("Wrong family");
 const q=source(p);let N=q.N,n=q.n;
 for(const axis of p.target){
  N=add(mul(D(N,axis as "x"|"y"),q.v),scale(mul(N,D(q.v,axis as "x"|"y")),-n));n++;
 }
 const bs=basis(p.mode,p.target),max=Math.max(n,...bs.map(b=>b.power));
 const target=mul(N,power(q.v,max-n));
 const columns=bs.map(b=>mul(term(b.x,b.y),power(q.v,max-b.power)));
 return {kind:"list" as const,values:solve(target,columns).map(c=>fmt(r(c)))};
}
