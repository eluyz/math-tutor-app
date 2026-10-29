import {describe,expect,it} from "vitest";
import {assessAnswer,emptyAnswer} from "../answers";
import {taskPool} from "../generators";
import {localizeUniversity,makeUniversityTask} from "./catalog";
import {makeGraphIntegrated,integratedOracle,integratedRangeIntervals,type GraphIntegratedProblem} from "./graphIntegratedProperties";

const fmt=(x:number)=>String(x).replace("-","−");
type Interval={a:number;b:number;left:boolean;right:boolean};
const write=(i:Interval)=>(i.left?"[":"(")+fmt(i.a)+"; "+fmt(i.b)+(i.right?"]":")");
const combine=(parts:Interval[])=>parts.length?parts.map(write).join(" ∪ "):"∅";
/** Independent level-set oracle; no calls to the implementation's range-merger. */
function independentlyRead(p:GraphIntegratedProblem){
 const [a,b,c]=p.nodes,[ac,bc,cc]=p.included;
 const seg=[{from:a,to:b,incA:ac,incB:bc},{from:b,to:c,incA:bc,incB:cc}];
 const hasValue=(y:number)=>{
  for(const q of seg){
   if(y>Math.min(q.from.y,q.to.y)&&y<Math.max(q.from.y,q.to.y))return true;
   if(y===q.from.y&&q.incA)return true;
   if(y===q.to.y&&q.incB)return true;
  }return false;
 };
 const breaks=[...new Set([a.y,b.y,c.y])].sort((x,y)=>x-y),set:Interval[]=[];
 for(let i=0;i<breaks.length-1;i++){
  const low=breaks[i],high=breaks[i+1];
  if(hasValue((low+high)/2))set.push({a:low,b:high,left:hasValue(low),right:hasValue(high)});
 }
 const joined:Interval[]=[];
 for(const item of set){
  const last=joined.at(-1);
  if(last&&last.b===item.a&&(last.right||item.left))
   joined[joined.length-1]={...last,b:item.b,right:item.right};
  else joined.push(item);
 }
 const up=a.y<b.y,up2=b.y<c.y;
 const trend=(direction:boolean)=>{
  if(up===up2&&bc&&up===direction)return combine([{a:a.x,b:c.x,left:ac,right:cc}]);
  const parts:Interval[]=[];
  if(up===direction)parts.push({a:a.x,b:0,left:ac,right:bc});
  if(up2===direction)parts.push({a:0,b:c.x,left:bc,right:cc});
  return combine(parts);
 };
 return {domain:bc?write({a:a.x,b:c.x,left:ac,right:cc}):
    combine([{a:a.x,b:0,left:ac,right:false},{a:0,b:c.x,left:false,right:cc}]),
  range:combine(joined),increasing:trend(true),decreasing:trend(false),
  injective:up===up2?"yes":"no",
  parity:ac!==cc?"neither":a.y===c.y?"even":a.y===-c.y&&b.y===0?"odd":"neither"};
}
describe("MT-F05-P0H integrated five-property source method",()=>{
 it("validates shapes, missing central argument and range merging",()=>{
  const p=makeGraphIntegrated(0,"hard");
  expect(integratedOracle(p)).toEqual(independentlyRead(p));
  expect(integratedRangeIntervals(p)).toHaveLength(1);
  for(const v of [-1,24,1.5,NaN,Infinity])expect(()=>makeGraphIntegrated(v,"hard")).toThrow();
  expect(()=>makeGraphIntegrated(0,"easy")).toThrow();
  expect(()=>integratedOracle({...p,nodes:[p.nodes[0],p.nodes[0],p.nodes[2]]})).toThrow();
 });
 it("72 unique shapes, six independent oracle fields, both locales and grading outcomes",()=>{
  const keys=new Set<string>(),tally={even:0,odd:0,neither:0,yes:0,no:0,hole:0};
  for(const level of ["hard","advanced","expert"] as const){
   const pool=taskPool("functions",level).filter(x=>x.templateId==="function-integrated-properties");
   expect(pool).toHaveLength(24);expect(new Set(pool.map(x=>x.contentKey)).size).toBe(24);
   for(let v=0;v<24;v++){
    const task=makeUniversityTask("function-integrated-properties",v,level);
    if(task.university.kind!=="function-integrated-properties")throw Error("Unexpected type");
    const p=task.university,oracle=integratedOracle(p),ind=independentlyRead(p);
    keys.add(task.contentKey);
    for(const field of ["domain","range","increasing","decreasing","injective","parity"] as const)
     expect(oracle[field],level+"/"+v+"/"+field).toBe(ind[field]);
    tally[oracle.parity as "even"|"odd"|"neither"]++;tally[oracle.injective as "yes"|"no"]++;if(!p.included[1])tally.hole++;
    for(const locale of ["pl","en"] as const){
     const view=localizeUniversity(task,locale),spec=view.answer;
     if(spec.kind!=="multi-choice")throw Error("Missing six-field answer");
     expect(spec.fields.map(f=>f.id)).toEqual(["domain","range","increasing","decreasing","injective","parity"]);
     expect(spec.fields.every(f=>f.options.some(o=>o.value===f.value))).toBe(true);
     expect(spec.fields.every(f=>new Set(f.options.map(o=>o.label)).size===f.options.length)).toBe(true);
     const complete={kind:"multi-choice" as const,values:Object.fromEntries(spec.fields.map(f=>[f.id,f.value]))};
     expect(assessAnswer(spec,complete).kind).toBe("correct");
     expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
     const malformed={...complete,values:{...complete.values,domain:"missing"}};
     expect(assessAnswer(spec,malformed).kind).toBe("invalid");
     for(const f of spec.fields){
      const wrong=f.options.find(o=>o.value!==f.value)!;
      const incorrect={...complete,values:{...complete.values,[f.id]:wrong.value}};
      expect(assessAnswer(spec,incorrect).kind,"Incorrect "+f.id).toBe("incorrect");
     }
     expect(view.solution).toHaveLength(7);
     expect(view.question).toContain(locale==="pl"?"sześć":"six");
     if(locale==="en")expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
    }
   }
  }
  expect(keys.size).toBe(72);
  for(const item of ["even","odd","neither","yes","no","hole"] as const)
   expect(tally[item]).toBeGreaterThan(0);
 },60000);
});
