import {describe,it,expect} from "vitest";
import {assessAnswer,emptyAnswer} from "../answers";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {makeIntegratedJump,jumpOracle,jumpValueIntervals,type IntegratedJumpProblem} from "./graphIntegratedJump";

const fmt=(n:number)=>String(n).replace(/-/g,"−");
const int=(a:number,b:number,ca:boolean,cb:boolean)=>(ca?"[":"(")+fmt(a)+"; "+fmt(b)+(cb?"]":")");
/** Separate mathematical witness using horizontal-level tests and topological endpoints,
    not the implementation's range-merge code. */
function independent(p:IntegratedJumpProblem){
 const [a,b]=p.left,[c,d]=p.right;
 const left=(y:number)=>y>=Math.min(a.y,b.y)&&y<=Math.max(a.y,b.y)&&y!==b.y;
 const right=(y:number)=>y>=Math.min(c.y,d.y)&&y<=Math.max(c.y,d.y);
 const critical=[...new Set([a.y,b.y,c.y,d.y])].sort((x,y)=>x-y);
 const levels=[...critical,...critical.slice(1).map((x,i)=>(x+critical[i+1])/2)];
 // Each piece is strictly monotone. A duplicated y in both images violates injection.
 const injective=!levels.some(y=>left(y)&&right(y));
 const ranges:{lo:number;hi:number;cl:boolean;ch:boolean}[]=[];
 for(let i=0;i<critical.length-1;i++){
  const low=critical[i],high=critical[i+1];
  if(left((low+high)/2)||right((low+high)/2))
   ranges.push({lo:low,hi:high,cl:left(low)||right(low),ch:left(high)||right(high)});
 }
 const combined:typeof ranges=[];
 for(const r of ranges){
  const last=combined.at(-1);
  if(last&&last.hi===r.lo&&(last.ch||r.cl))combined[combined.length-1]={...last,hi:r.hi,ch:r.ch};
  else combined.push(r);
 }
 const rng=combined.map(r=>int(r.lo,r.hi,r.cl,r.ch)).join(" ∪ ");
 const lRise=b.y>a.y,rRise=d.y>c.y;
 const strictGlobal=lRise===rRise&&(lRise?b.y<=c.y:b.y>=c.y);
 const leftX=int(a.x,0,true,false),rightX=int(0,d.x,true,true);
 const rising=strictGlobal&&lRise?int(a.x,d.x,true,true):
   [lRise?leftX:null,rRise?rightX:null].filter(Boolean).join(" ∪ ")||"∅";
 const falling=strictGlobal&&!lRise?int(a.x,d.x,true,true):
   [!lRise?leftX:null,!rRise?rightX:null].filter(Boolean).join(" ∪ ")||"∅";
 return {domain:int(a.x,d.x,true,true),range:rng,increasing:rising,decreasing:falling,
  injective:injective?"yes":"no",parity:"neither"};
}
describe("F05 P0I source-like f/c jump cases",()=>{
 it("rejects invalid variant inputs and incompatible y-topology",()=>{
  const p=makeIntegratedJump(0,"hard");
  for(const invalid of [-1,24,NaN,Infinity,1.2])expect(()=>makeIntegratedJump(invalid,"hard")).toThrow();
  expect(()=>jumpOracle({...p,left:[p.left[1],p.left[0]]})).toThrow();
  expect(()=>jumpOracle({...p,topology:"overlap"})).toThrow();
 });
 it("independently checks 72 unique shapes, 5 property groups and both locales",()=>{
  const signatures=new Set<string>();
  let separated=0,overlap=0,closedTop=0,openTop=0;
  for(const level of ["hard","advanced","expert"] as const)for(let variant=0;variant<24;variant++){
   const task=makeUniversityTask("function-integrated-jump",variant,level);
   if(task.university.kind!=="function-integrated-jump")throw Error("Wrong task");
   const p=task.university,o=jumpOracle(p),check=independent(p);
   signatures.add(JSON.stringify(p));
   expect(o,level+"/"+variant).toEqual(check);
   expect(p.left[1].x).toBe(p.right[0].x);expect(p.left[1].y).not.toBe(p.right[0].y);
   expect(o.domain).toMatch(/^\[−\d+; \d+\]$/);
   if(p.topology==="separated"){
    separated++;expect(variant%2).toBe(0);expect(o.injective).toBe("yes");
    expect(jumpValueIntervals(p)).toHaveLength(2);
    expect(o.range).toContain(" ∪ ");expect(o.decreasing).not.toBe("∅");
   }else {
    overlap++;expect(variant%2).toBe(1);expect(o.injective).toBe("no");
    expect(jumpValueIntervals(p)).toHaveLength(1);expect(o.range).not.toContain(" ∪ ");
    expect(o.decreasing).toBe("∅");
    if(o.range.endsWith("]"))closedTop++;else openTop++;
   }
   for(const locale of ["pl","en"] as const){
    const view=localizeUniversity(task,locale),spec=view.answer;
    if(spec.kind!=="multi-choice")throw Error("Wrong answer spec");
    expect(spec.fields.map(f=>f.id)).toEqual(["domain","range","increasing","decreasing","injective","parity"]);
    expect(spec.fields.every(f=>f.options.some(opt=>opt.value===f.value))).toBe(true);
    expect(spec.fields.every(f=>new Set(f.options.map(opt=>opt.label)).size===f.options.length)).toBe(true);
    expect(spec.fields.find(f=>f.id==="range")?.options.find(opt=>opt.value===spec.fields.find(f=>f.id==="range")?.value)?.label).toBe(o.range);
    expect(spec.fields.find(f=>f.id==="increasing")?.options.find(opt=>opt.value===spec.fields.find(f=>f.id==="increasing")?.value)?.label).toBe(o.increasing);
    const correct={kind:"multi-choice" as const,values:Object.fromEntries(spec.fields.map(f=>[f.id,f.value]))};
    expect(assessAnswer(spec,correct).kind).toBe("correct");
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
    for(const f of spec.fields){
     const missing={...correct,values:{...correct.values,[f.id]:""}};
     expect(assessAnswer(spec,missing).kind).toBe("invalid");
     const bad={...correct,values:{...correct.values,[f.id]:f.options.find(opt=>opt.value!==f.value)!.value}};
     expect(assessAnswer(spec,bad).kind).toBe("incorrect");
    }
    expect(view.solution).toHaveLength(8);
    expect(view.question).toContain(locale==="pl"?"sześć":"six");
    if(locale==="en")expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
   }
  }
  expect(signatures.size).toBe(72);expect(separated).toBe(36);expect(overlap).toBe(36);
  expect(closedTop).toBeGreaterThan(0);expect(openTop).toBeGreaterThan(0);
 },60000);
});
