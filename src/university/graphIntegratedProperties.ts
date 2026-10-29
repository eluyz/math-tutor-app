import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import type { AnswerSpec } from "../answers";
import { teaching } from "./teaching";

type Point=Readonly<{x:number;y:number}>;
export type GraphIntegratedProblem=Readonly<{
 kind:"function-integrated-properties";
 nodes:readonly [Point,Point,Point];
 included:readonly [boolean,boolean,boolean];
}>;
export type IntegratedField="domain"|"range"|"increasing"|"decreasing"|"injective"|"parity";
type Interval=Readonly<{lo:number;hi:number;left:boolean;right:boolean}>;
export type GraphIntegratedOracle=Readonly<Record<IntegratedField,string>>;

const fmt=(x:number)=>String(x).replace("-","−");
const show=(i:Interval)=>(i.left?"[":"(")+fmt(i.lo)+"; "+fmt(i.hi)+(i.right?"]":")");
const union=(parts:readonly Interval[])=>parts.length?parts.map(show).join(" ∪ "):"∅";
const same=(a:number,b:number)=>a===b;

export function makeGraphIntegrated(v:number,difficulty:Difficulty):GraphIntegratedProblem{
 if(!Number.isInteger(v)||v<0||v>=24||!["hard","advanced","expert"].includes(difficulty))
  throw Error("Unsupported integrated graph variant");
 const level=difficulty==="hard"?0:difficulty==="advanced"?1:2;
 const mode=v%4,L=4+6*level+Math.floor(v/4);
 const height=1+(Math.floor(v/4)+level)%3;
 const firstIncluded=(v+level)%3!==0;
 const lastIncluded=mode<2?firstIncluded:(v+level)%2===0;
 const centerIncluded=(v+level)%2===0;
 let ys:readonly [number,number,number];
 if(mode===0)ys=[height,-height,height]; // even, turning, not one-to-one
 else if(mode===1){const direction=(Math.floor(v/4)+level)%2===0?1:-1;ys=[-direction*height,0,direction*height];} // odd, injective
 else if(mode===2)ys=[-3,0,2]; // neither, globally injective
 else ys=[2,-2,1]; // neither, turning, not injective
 return {kind:"function-integrated-properties",nodes:[{x:-L,y:ys[0]},{x:0,y:ys[1]},{x:L,y:ys[2]}],
  included:[firstIncluded,centerIncluded,lastIncluded]};
}

function validate(p:GraphIntegratedProblem){
 const [a,b,c]=p.nodes;
 if(p.nodes.length!==3||p.included.length!==3||p.nodes.some(q=>!Number.isSafeInteger(q.x)||!Number.isSafeInteger(q.y))
 ||a.x>=b.x||b.x>=c.x||b.x!==0||a.x!==-c.x||a.y===b.y||b.y===c.y)
  throw Error("Invalid integrated graph geometry");
}
/** Returns the exact union of the two y-images, preserving excluded extremal values and holes. */
export function integratedRangeIntervals(p:GraphIntegratedProblem):readonly Interval[]{
 validate(p);
 const parts:Interval[]=[];
 for(let i=0;i<2;i++){
  const a=p.nodes[i],b=p.nodes[i+1],rise=a.y<b.y;
  parts.push({lo:Math.min(a.y,b.y),hi:Math.max(a.y,b.y),
   left:rise?p.included[i]:p.included[i+1],
   right:rise?p.included[i+1]:p.included[i]});
 }
 parts.sort((a,b)=>a.lo-b.lo||a.hi-b.hi);
 const merged:Interval[]=[];
 for(const item of parts){
  const previous=merged[merged.length-1];
  if(previous&&(item.lo<previous.hi || item.lo===previous.hi&&(previous.right||item.left))){
    const wider=item.hi>previous.hi;
    merged[merged.length-1]={lo:previous.lo,
     hi:Math.max(previous.hi,item.hi),left:previous.left||(previous.lo===item.lo&&item.left),
     right:wider?item.right:item.hi===previous.hi?previous.right||item.right:previous.right};
  }else merged.push(item);
 }
 return merged;
}
export function integratedOracle(p:GraphIntegratedProblem):GraphIntegratedOracle{
 validate(p);
 const [a,b,c]=p.nodes,[ac,bc,cc]=p.included;
 const one=(lo:number,hi:number,left:boolean,right:boolean):Interval=>({lo,hi,left,right});
 const domain=bc?show(one(a.x,c.x,ac,cc)):
  union([one(a.x,0,ac,false),one(0,c.x,false,cc)]);
 const riseLeft=a.y<b.y,riseRight=b.y<c.y;
 const asc:Interval[]=[],desc:Interval[]=[];
 if(riseLeft===riseRight&&bc){
  (riseLeft?asc:desc).push(one(a.x,c.x,ac,cc));
 }else{
  (riseLeft?asc:desc).push(one(a.x,0,ac,bc));
  (riseRight?asc:desc).push(one(0,c.x,bc,cc));
 }
 const parity=ac!==cc?"neither":same(a.y,c.y)?"even":
   a.y===-c.y&&b.y===0?"odd":"neither";
 return {
  domain,range:union(integratedRangeIntervals(p)),
  increasing:union(asc),decreasing:union(desc),
  injective:riseLeft===riseRight?"yes":"no",parity,
 };
}
const fields:readonly IntegratedField[]=["domain","range","increasing","decreasing","injective","parity"];
const names:Record<IntegratedField,readonly [string,string]>={
 domain:["Dziedzina (D)","Domain (D)"],range:["Zbiór wartości (W)","Range (W)"],
 increasing:["Ściśle rośnie","Strictly increasing"],decreasing:["Ściśle maleje","Strictly decreasing"],
 injective:["Różnowartościowa?","One-to-one?"],parity:["Parzystość","Parity"],
};
function uniqueOptions(correct:string,candidates:readonly string[]):readonly string[]{
 const result=[correct,...candidates.filter(x=>x!==correct)];
 return [...new Set(result)].slice(0,4);
}
export function integratedAnswer(p:GraphIntegratedProblem,locale:Locale):AnswerSpec{
 const o=integratedOracle(p),[a,b,c]=p.nodes;
 const x=a.x,outerInterval=show({lo:a.x,hi:c.x,left:true,right:true});
 const yi=Math.min(a.y,b.y,c.y),ya=Math.max(a.y,b.y,c.y);
 const maybeOpen=show({lo:yi,hi:ya,left:false,right:false});
 const maybeClosed=show({lo:yi,hi:ya,left:true,right:true});
 const alternate=show({lo:a.x,hi:c.x,left:false,right:false});
 const labels={
  yes:locale==="pl"?"Tak":"Yes",no:locale==="pl"?"Nie":"No",
  even:locale==="pl"?"Parzysta":"Even",odd:locale==="pl"?"Nieparzysta":"Odd",
  neither:locale==="pl"?"Ani parzysta, ani nieparzysta":"Neither",
 };
 return {kind:"multi-choice",fields:fields.map((id,j)=>{
  let opts:readonly {value:string;label:string}[];
  if(id==="injective")opts=(["yes","no"] as const).map((v,k)=>({value:id+":"+k,label:labels[v]}));
  else if(id==="parity")opts=(["even","odd","neither"] as const).map((v,k)=>({value:id+":"+k,label:labels[v]}));
  else{
   const alternatives=id==="domain"
    ? [outerInterval,alternate,"ℝ","∅",show({lo:x,hi:0,left:false,right:false})]
    : id==="range" ? [maybeClosed,maybeOpen,"ℝ","∅"]
    : [outerInterval,alternate,"∅",show({lo:a.x,hi:0,left:false,right:false}),show({lo:0,hi:c.x,left:false,right:false})];
   opts=uniqueOptions(o[id],alternatives).map((label,k)=>({value:id+":"+k,label}));
  }
  const correct=id==="injective"?id+":"+(o.injective==="yes"?0:1):id==="parity"?
    id+":"+(o.parity==="even"?0:o.parity==="odd"?1:2):id+":0";
  const shift=(j+Math.abs(a.x))%opts.length;
  return {id,label:names[id][locale==="pl"?0:1],value:correct,
   options:[...opts.slice(shift),...opts.slice(0,shift)]};
 })};
}
export const graphIntegratedFamilies:readonly UniversityFamily[]=[{
 id:"function-integrated-properties",category:"functions",
 titles:{pl:"Pięć własności jednego wykresu",en:"Five properties of one graph"},
 supportedDifficulties:["hard","advanced","expert"],create:makeGraphIntegrated,
}];
export function presentGraphIntegrated(p:GraphIntegratedProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson,o=integratedOracle(p);
 const explanation:ReadonlyArray<readonly [string,string,string]>=[
  [t("Dziedzina","Domain"),o.domain,
   t("Sprawdź skrajne końce i ewentualne wyłączenie argumentu x=0.",
     "Check outer endpoints and whether the middle argument x=0 is excluded.")],
  [t("Zbiór wartości","Range"),o.range,
   t("Połącz obrazy obu odcinków. Pusty wierzchołek nie usuwa wysokości, jeśli inny argument nadal ją osiąga.",
     "Unite the y-images of both segments. A hollow vertex does not remove a y-value attained elsewhere.")],
  [t("Przedziały wzrostu","Increasing intervals"),o.increasing,
   t("Sprawdź znaki nachylenia po obu stronach i dołącz węzeł, tylko gdy należy do dziedziny.",
     "Compare slopes on each side and include the joining vertex only if it belongs to the domain.")],
  [t("Przedziały spadku","Decreasing intervals"),o.decreasing,
   t("Nie łącz przedziałów przez usunięty argument.",
     "Do not join intervals through an excluded argument.")],
  [t("Różnowartościowość","Injectivity"),o.injective==="yes"?t("tak","yes"):t("nie","no"),
   t("Jednakowy kierunek obu odcinków daje różnowartościowość; zmiana kierunku powtarza poziome wartości.",
     "Both slopes in the same strict direction give injectivity; a turning point repeats horizontal levels.")],
  [t("Parzystość","Parity"),o.parity==="even"?t("parzysta","even"):o.parity==="odd"?t("nieparzysta","odd"):t("żadna","neither"),
   t("Najpierw sprawdź symetrię dziedziny, potem warunek f(−x)=f(x) lub f(−x)=−f(x).",
     "Check domain symmetry first, then f(−x)=f(x) or f(−x)=−f(x).")],
 ];
 for(const [name,value,reason] of explanation)lesson.work(name+": "+value,reason);
 return lesson.finish(
  t("Z jednego wykresu podaj D, W, przedziały ścisłego wzrostu i spadku, różnowartościowość oraz parzystość. Uzupełnij wszystkie sześć pól.",
    "From a single graph find D, W, strict increase and decrease intervals, injectivity and parity. Complete all six fields."),
  integratedAnswer(p,locale),
  t("Najpierw zaznacz puste i pełne wierzchołki. Wszystkie odpowiedzi dotyczą tego SAMEGO wykresu.",
    "Mark hollow and filled vertices first. All answers concern the SAME graph."),
  t("Sprawdź osobno x, y, oba nachylenia, poziome przecięcia i odbicie w osiach.",
    "Check x, y, both slopes, horizontal intersections and reflection separately."));
}
