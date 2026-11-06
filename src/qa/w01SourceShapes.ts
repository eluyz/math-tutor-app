import type {makeUniversityTask} from "../university/catalog";
import {formatRational as format} from "../answers";
import {r,add,mul,type Rational} from "./batchFMath";

// Independent exact sparse-polynomial differentiation and outer-function identities.
// No production coefficient/basis routine or answer/solution field is imported.
type Poly=Map<string,Rational>;
type Series=Map<string,Rational>;
const zero=()=>r(0);
const poly=(xs:readonly (readonly [number,number,Rational])[]):Poly=>{
 const p:Poly=new Map();
 for(const [i,j,v]of xs){const key=i+","+j;p.set(key,add(p.get(key)??zero(),v));}
 return p;
};
const derivative=(p:Poly,axis:"x"|"y"):Poly=>{
 const out:Poly=new Map();
 for(const [key,value]of p){
  const [i,j]=key.split(",").map(Number),factor=axis==="x"?i:j;
  if(!factor)continue;
  const k=axis==="x"?(i-1)+","+j:i+","+(j-1);
  out.set(k,add(out.get(k)??zero(),mul(value,r(factor))));
 }
 return out;
};
const product=(a:Poly,b:Poly):Poly=>{
 const out:Poly=new Map();
 for(const [ka,ca]of a)for(const [kb,cb]of b){
  const [i,j]=ka.split(",").map(Number),[k,l]=kb.split(",").map(Number);
  const code=(i+k)+","+(j+l);
  out.set(code,add(out.get(code)??zero(),mul(ca,cb)));
 }
 return out;
};
function emit(out:Series,p:Poly,den:string,scalar:Rational){
 for(const [mon,c]of p){
  const key=den+":"+mon;
  out.set(key,add(out.get(key)??zero(),mul(c,scalar)));
 }
}
function basis(mode:string,target:string):readonly string[]{
 if(mode==="poly-cubic")switch(target){
  case "x":return ["plain:2,0","plain:0,1"];
  case "y":return ["plain:1,0","plain:0,1"];
  case "xx":return ["plain:1,0"];
  case "xy":case "yx":case "yy":return ["plain:0,0"];
 }
 if(mode==="poly-mixed")switch(target){
  case "x":return ["plain:1,0","plain:1,1","plain:0,2"];
  case "y":return ["plain:2,0","plain:1,1"];
  case "xx":return ["plain:0,0","plain:0,1"];
  case "xy":case "yx":return ["plain:1,0","plain:0,1"];
  case "yy":return ["plain:1,0"];
 }
 if(mode==="log-positive")switch(target){
  case "x":return ["u:1,0"];case "y":return ["u:0,1"];
  case "xx":return ["u:0,0","u²:2,0"];
  case "xy":case "yx":return ["u²:1,1"];
  case "yy":return ["u:0,0","u²:0,2"];
 }
 switch(target){
  case "x":return ["√u:1,0"];case "y":return ["√u:0,0"];
  case "xx":return ["√u:0,0","u³⁄²:2,0"];
  case "xy":case "yx":return ["u³⁄²:1,0"];
  case "yy":return ["u³⁄²:0,0"];
 }
}
export function independentW01SourceShape(task:ReturnType<typeof makeUniversityTask>){
 const p=task.university;
 if(p.kind!=="multivar-source-shape-partial")throw Error("Wrong W01 family");
 const {a,b,c,d}=p;
 const first=p.target[0] as "x"|"y",second=p.target[1] as "x"|"y"|undefined;
 const result:Series=new Map();
 if(p.mode==="poly-cubic"||p.mode==="poly-mixed"){
  const f=p.mode==="poly-cubic"
   ?poly([[3,0,r(a)],[1,1,r(b)],[0,2,r(-c)]])
   :poly([[2,0,r(a)],[2,1,r(-b)],[1,2,r(c)],[0,0,r(d)]]);
  let answer=derivative(f,first);
  if(second)answer=derivative(answer,second);
  emit(result,answer,"plain",r(1));
 }else{
  const inner=p.mode==="log-positive"
   ?poly([[2,0,r(a)],[0,2,r(b)],[0,0,r(d)]])
   :poly([[2,0,r(a)],[0,1,r(b)],[0,0,r(d)]]);
  const ui=derivative(inner,first);
  if(!second){
   emit(result,ui,p.mode==="log-positive"?"u":"√u",p.mode==="log-positive"?r(1):r(1,2));
  }else{
   const uj=derivative(inner,second),uij=derivative(ui,second);
   emit(result,uij,p.mode==="log-positive"?"u":"√u",p.mode==="log-positive"?r(1):r(1,2));
   emit(result,product(ui,uj),p.mode==="log-positive"?"u²":"u³⁄²",
    p.mode==="log-positive"?r(-1):r(-1,4));
  }
 }
 const keep=basis(p.mode,p.target),allowed=new Set(keep);
 for(const [key,value]of result)if(value.numerator!==0n&&!allowed.has(key))
  throw Error("Unexpected derivative term outside the answer basis: "+key);
 return {kind:"list" as const,values:keep.map(x=>format(result.get(x)??zero()))};
}
